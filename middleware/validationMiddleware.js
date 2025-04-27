
export function validateProduct(req, res, next) {
  const { name, price, stock } = req.body;
  
  if (!name || !price || stock === undefined) {
    return res.status(400).json({
      status: 'fail',
      message: 'Product requires name, price, and stock'
    });
  }
  
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Price must be a positive number'
    });
  }
  
  if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Stock must be a positive integer'
    });
  }
  
  next();
}


// Cart validation middleware
export function validateCartItem(req, res, next) {
  const { productId, quantity } = req.body;
  
  if (!productId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Product ID is required'
    });
  }
  
  if (!quantity || typeof quantity !== 'number' || quantity < 1 || !Number.isInteger(quantity)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Quantity must be a positive integer'
    });
  }
  
  next();
}

// Checkout validation middleware
export function validateCheckout(req, res, next) {
  const { shippingAddress, paymentInfo } = req.body;
  
  if (!shippingAddress) {
    return res.status(400).json({
      status: 'fail',
      message: 'Shipping address is required'
    });
  }
  
  if (!shippingAddress.street || !shippingAddress.city || 
      !shippingAddress.state) {
    return res.status(400).json({
      status: 'fail',
      message: 'Shipping address must include street, city, and state'
    });
  }
  
  // PaymentInfo is optional in this implementation
  
  next();
}