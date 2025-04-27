import { connect } from 'mongoose';
import Product from '../models/productModel.js';
import { config } from 'dotenv';

config();

// Connect to MongoDB
connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-cart', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample product data
const products = [
  {
    name: 'Smartphone X',
    description: 'Latest smartphone with amazing features',
    price: 999.99,
    stock: 50,
    category: 'Electronics',
    imageUrl: 'https://example.com/smartphone.jpg'
  },
  {
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    stock: 30,
    category: 'Electronics',
    imageUrl: 'https://example.com/laptop.jpg'
  },
  {
    name: 'Wireless Headphones',
    description: 'Premium wireless headphones with noise cancellation',
    price: 199.99,
    stock: 100,
    category: 'Electronics',
    imageUrl: 'https://example.com/headphones.jpg'
  },
  {
    name: 'Smart Watch',
    description: 'Fitness and health tracking smartwatch',
    price: 249.99,
    stock: 75,
    category: 'Electronics',
    imageUrl: 'https://example.com/smartwatch.jpg'
  },
  {
    name: 'Coffee Maker',
    description: 'Automatic coffee maker with timer',
    price: 89.99,
    stock: 40,
    category: 'Home Appliances',
    imageUrl: 'https://example.com/coffeemaker.jpg'
  },
  {
    name: 'Blender',
    description: 'High-speed blender for smoothies and more',
    price: 79.99,
    stock: 60,
    category: 'Home Appliances',
    imageUrl: 'https://example.com/blender.jpg'
  },
  {
    name: 'Desk Chair',
    description: 'Ergonomic office chair with lumbar support',
    price: 199.99,
    stock: 25,
    category: 'Furniture',
    imageUrl: 'https://example.com/chair.jpg'
  },
  {
    name: 'Standing Desk',
    description: 'Adjustable height standing desk',
    price: 349.99,
    stock: 15,
    category: 'Furniture',
    imageUrl: 'https://example.com/desk.jpg'
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable bluetooth speaker with deep bass',
    price: 129.99,
    stock: 80,
    category: 'Electronics',
    imageUrl: 'https://example.com/speaker.jpg'
  },
  {
    name: 'Tablet Pro',
    description: 'Lightweight tablet with high-resolution display',
    price: 499.99,
    stock: 45,
    category: 'Electronics',
    imageUrl: 'https://example.com/tablet.jpg'
  }
];

// Seed function
const seedProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    
    // Insert new products
    await Product.insertMany(products);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedProducts();