import Product from '../models/productModel.js';
import { catchAsync } from '../utils/errorHandler.js';

export const getProducts = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, category, search } = req.query;
  const skip = (page - 1) * limit;

  // Build query
  const query = {};
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  // Check cache first
  const cacheKey = `products:${JSON.stringify({ page, limit, category, search })}`;
  const cachedData = await req.getAsync(cacheKey);

  if (cachedData) {
    console.log({cacheKey})
    return res.json(JSON.parse(cachedData));
  }

  // If not cached, fetch from DB
  const products = await Product.find(query)
    .select('name price description stock imageUrl category')
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const totalProducts = await Product.countDocuments(query);

  const result = {
    products,
    totalPages: Math.ceil(totalProducts / limit),
    currentPage: Number(page),
    totalProducts
  };

  // Cache the result for 5 minutes
  await req.setAsync(cacheKey, JSON.stringify(result), 'EX', 300);

  res.json(result);
});

export const getProductById = catchAsync(async (req, res) => {
  const { id: productId } = req.params;

  // Check cache first
  const cacheKey = `product:${productId}`;
  const cachedProduct = await req.getAsync(cacheKey);

  if (cachedProduct) {
    return res.json(JSON.parse(cachedProduct));
  }

  const product = await Product.findById(productId).lean();

  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }

  // Cache the product for 10 minutes
  await req.setAsync(cacheKey, JSON.stringify(product), 'EX', 600);

  res.json(product);
});
