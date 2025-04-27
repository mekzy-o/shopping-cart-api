import express, { json } from 'express';
import connectDB from "./config/database.js";
import createClient from './config/redis.js'
import { promisify } from 'util';
import { config } from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';

config();

// Initialize Express app
const app = express();
app.use(json());

// Connect to MongoDB
connectDB()

// Initialize Redis client
const redisClient = createClient();

// Make redis client available in req object
app.use((req, res, next) => {
  req.redisClient = redisClient;
  req.getAsync = promisify(redisClient.get).bind(redisClient);
  req.setAsync = promisify(redisClient.set).bind(redisClient);
  req.delAsync = promisify(redisClient.del).bind(redisClient);
  next();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;