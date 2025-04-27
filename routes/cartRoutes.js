import { Router } from 'express';
const router = Router();
import { getCart, addToCart, removeFromCart, updateCartItem, checkout } from '../controllers/cartController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateCartItem, validateCheckout } from '../middleware/validationMiddleware.js';

router.use(authMiddleware);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/add', validateCartItem, addToCart);

// Remove item from cart
router.delete('/item/:itemId', removeFromCart);

// Update item quantity
router.patch('/item/:itemId', validateCartItem, updateCartItem);

// Process checkout
router.post('/checkout', validateCheckout, checkout);

export default router;
