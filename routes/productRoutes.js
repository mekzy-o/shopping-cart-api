import { Router } from 'express';
const router = Router();
import { getProducts, getProductById } from '../controllers/productController.js';
import cacheMiddleware from '../middleware/cacheMiddleware.js';
import { cache } from '../config/app.js';


// Get all products (with caching)
router.get('/', cacheMiddleware(cache.productTTL), getProducts);

// Get single product (with caching)
router.get('/:id', cacheMiddleware(cache.productTTL), getProductById);

export default router;

