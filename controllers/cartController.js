import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import { catchAsync } from '../utils/errorHandler.js';
import { startSession } from 'mongoose';

export const getCart = catchAsync(async (req, res) => {
  const userId = req.headers['user-id']; 
  
  // Check cache first
  const cacheKey = `cart:${userId}`;
  const cachedCart = await req.getAsync(cacheKey);
  
  if (cachedCart) {
    return res.json(JSON.parse(cachedCart));
  }
  
  let cart = await Cart.findOne({ userId }).populate('items.product', 'name price stock');
  
  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
  }
  
  // Cache the cart for 5 minutes
  await req.setAsync(cacheKey, JSON.stringify(cart), 'EX', 300);
  
  res.json(cart);
});

export const addToCart = catchAsync(async (req, res) => {
  const userId = req.headers['user-id']; 

  const { productId, quantity } = req.body;
  
  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({
      status: 'fail',
      message: 'Product ID and quantity (positive integer) are required'
    });
  }
  
  // Use Redis lock to prevent race conditions
  const lockKey = `lock:cart:${userId}`;
  const lockAcquired = await req.setAsync(lockKey, 'locked', 'NX', 'EX', 10);
  
  if (!lockAcquired) {
    return res.status(409).json({
      status: 'fail',
      message: 'Another operation is in progress, please try again'
    });
  }
  
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      await req.delAsync(lockKey);
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    if (product.stock < quantity) {
      await req.delAsync(lockKey);
      return res.status(400).json({
        status: 'fail',
        message: 'Not enough stock available'
      });
    }
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    
    if (itemIndex > -1) {
      // Update quantity if product already in cart
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        name: product.name
      });
    }
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    // Invalidate cache
    await req.delAsync(`cart:${userId}`);
    
    // Release lock
    await req.delAsync(lockKey);
    
    res.json(cart);
  } catch (error) {
    // Release lock in case of error
    await req.delAsync(lockKey);
    throw error;
  }
});

export const removeFromCart = catchAsync(async (req, res) => {
  const userId = req.headers['user-id'];
  const { itemId } = req.params;
  
  // Use Redis lock to prevent race conditions
  const lockKey = `lock:cart:${userId}`;
  const lockAcquired = await req.setAsync(lockKey, 'locked', 'NX', 'EX', 10);
  
  if (!lockAcquired) {
    return res.status(409).json({
      status: 'fail',
      message: 'Another operation is in progress, please try again'
    });
  }
  
  try {
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      await req.delAsync(lockKey);
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }
    
    // Find the item index
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    console.log("ITEM INDEXXXX", itemIndex);

    if (itemIndex === -1) {
      await req.delAsync(lockKey);
      return res.status(404).json({
        status: 'fail',
        message: 'Item not found in cart'
      });
    }
    
    // Remove the item
    cart.items.splice(itemIndex, 1);
    cart.updatedAt = Date.now();
    await cart.save();
    
    await req.delAsync(`cart:${userId}`);
    
    await req.delAsync(lockKey);
    
    res.json(cart);
  } catch (error) {
    await req.delAsync(lockKey);
    throw error;
  }
});

export const updateCartItem = catchAsync(async (req, res) => {
  const userId = req.headers['user-id'];
  const { itemId } = req.params;
  const { quantity, productId } = req.body;
  
  // Use Redis lock to prevent race conditions
  const lockKey = `lock:cart:${userId}`;
  const lockAcquired = await req.setAsync(lockKey, 'locked', 'NX', 'EX', 10);
  
  if (!lockAcquired) {
    return res.status(409).json({
      status: 'fail',
      message: 'Another operation is in progress, please try again'
    });
  }
  
  try {
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      await req.delAsync(lockKey);
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }
    
    // Find the item
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      await req.delAsync(lockKey);
      return res.status(404).json({
        status: 'fail',
        message: 'Item not found in cart'
      });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      await req.delAsync(lockKey);
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    if (product.stock < quantity) {
      await req.delAsync(lockKey);
      return res.status(400).json({
        status: 'fail',
        message: 'Not enough stock available'
      });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();
    
    // Invalidate cache
    await req.delAsync(`cart:${userId}`);
    
    // Release lock
    await req.delAsync(lockKey);
    
    res.json(cart);
  } catch (error) {
    // Release lock in case of error
    await req.delAsync(lockKey);
    throw error;
  }
});

export const checkout = catchAsync(async (req, res) => {
  const userId = req.headers['user-id'];
  const { shippingAddress, paymentInfo } = req.body;

  // Use MongoDB session for transaction
  const session = await startSession();
  session.startTransaction();
  
  try {
    // Use Redis lock to prevent race conditions
    const lockKey = `lock:checkout:${userId}`;
    const lockAcquired = await req.setAsync(lockKey, 'locked', 'NX', 'EX', 30);
    
    if (!lockAcquired) {
      return res.status(409).json({
        status: 'fail',
        message: 'Another checkout operation is in progress, please try again'
      });
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ userId }).session(session);
    
    if (!cart || cart.items.length === 0) {
      await req.delAsync(lockKey);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: 'fail',
        message: 'Cart is empty'
      });
    }
    
    // Check stock availability and update product stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product).session(session);
      
      if (!product) {
        await req.delAsync(lockKey);
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          status: 'fail',
          message: `Product with ID ${item.product} not found`
        });
      }
      
      if (product.stock < item.quantity) {
        await req.delAsync(lockKey);
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: 'fail',
          message: `Not enough stock for product: ${product.name}`
        });
      }
      
      // Update stock
      product.stock -= item.quantity;
      await product.save({ session });
      
      // Invalidate product cache
      await req.delAsync(`product:${product._id}`);
    }
    
    // Calculate total amount
    const totalAmount = cart.calculateTotal();
    
    // Create order
    const order = new Order({
      userId,
      items: cart.items,
      totalAmount,
      shippingAddress,
      paymentInfo,
      status: 'processing'
    });
    
    await order.save({ session });
    
    // Clear the cart
    await Cart.findByIdAndDelete(cart._id, { session });
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    // Invalidate caches
    await req.delAsync(`cart:${userId}`);
    await req.delAsync('products:*');
    
    // Release lock
    await req.delAsync(lockKey);
    
    res.status(201).json({
      status: 'success',
      order
    });
  } catch (error) {
    // Abort transaction and release lock in case of error
    await session.abortTransaction();
    session.endSession();
    await req.delAsync(`lock:checkout:${userId}`);
    throw error;
  }
});