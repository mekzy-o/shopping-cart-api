# Shopping Cart API 🛒

A simple yet robust shopping-cart backend built with Node.js, Express, MongoDB and Redis. It supports product browsing, cart management, basic concurrency controls and in-memory caching to keep things snappy for your users.

## Table of Contents

1. [What's Inside](#whats-inside)
2. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Variables](#environment-variables)
   - [Running the App](#running-the-app)
   - [Seeding Sample Data](#seeding-sample-data)
3. [How It Works](#how-it-works)
   - [Folder Layout](#folder-layout)
   - [Tech Highlights](#tech-highlights)
   - [Key Configurations](#key-configurations)
4. [What to Add Next](#what-to-add-next)
5. [API Reference](#api-reference)
6. [Acknowledgments](#acknowledgments)

## What's Inside

- **Express.js** server with clear separation of routes, controllers and middleware
- **Mongoose** models for `Product`, `Cart` and `Order`
- **Redis** cache layer (with TTLs) to speed up reads for products and carts
- **Config files** for database, Redis and application settings
- **Middleware** for error handling, request validation, simple auth stub and response caching
- **Seed script** to pre-load a handful of example products
- **Locking logic** around cart updates and checkout to prevent race conditions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- A running MongoDB instance (local or cloud)
- A running Redis instance (local or cloud)
- npm (comes with Node.js)

### Installation

1. Clone this repo
   ```bash
   git clone https://github.com/mekzy-o/shopping-cart-api.git
   cd shopping-cart-api
   ```

2. Install dependencies
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the project root with:

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/shopping-cart 
REDIS_URL=redis://localhost:6379
```

- **PORT**: port where the server listens
- **NODE_ENV**: development or production
- **MONGODB_URI**: your MongoDB connection string
- **REDIS_URL**: your Redis connection string

### Running the App

Development mode (auto-reload on file changes):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

You should see:
```
MongoDB Connected: localhost
Redis connected
Server running on port 3000
```

### Seeding Sample Data

To load example products into MongoDB:
```bash
npm run seed
```

## How It Works

### Folder Layout

```
├── app.js                     # Application entry point
├── config/
│   ├── app.js                 # TTLs, pagination and cart/checkout settings
│   ├── database.js            # MongoDB connection logic
│   └── redis.js               # Redis client setup
├── controllers/
│   ├── productController.js   # Handlers for product routes
│   └── cartController.js      # Handlers for cart & checkout
├── middleware/
│   ├── authMiddleware.js      # Placeholder for auth logic
│   ├── cacheMiddleware.js     # Caches GET responses in Redis
│   ├── validationMiddleware.js# Validates request bodies
│   └── errorMiddleware.js     # Centralized error handler
├── models/
│   ├── productModel.js        # Mongoose schema for products
│   ├── cartModel.js           # Mongoose schema for carts
│   └── orderModel.js          # Mongoose schema for orders
├── routes/
│   ├── productRoutes.js       # `/api/products` endpoints
│   └── cartRoutes.js          # `/api/cart` endpoints
└── utils/
    ├── seedData.js            # Script to populate sample data
    └── errorHandler.js        # Helper for building API errors
```

### Tech Highlights

- ES Modules (import/export): modern syntax and forward-compatible
- Mongoose schemas with validation, defaults and indexes (text search on name/description)
- Redis caching layer for read-heavy endpoints with configurable TTLs
- Redis locks to prevent race conditions during cart updates and checkout
- Centralized config in `/config/app.js` so you can tweak behavior without touching code

### Key Configurations

**Cache TTLs** (in seconds):
- productTTL: 600
- cartTTL: 300
- categoryTTL: 1800

**Cart settings**:
- expiryDays: 7 (auto-expire carts older than a week)
- lockTimeout: 10 seconds

**Checkout lock**:
- lockTimeout: 30 seconds

**Pagination**:
- Default limit = 10, max limit = 50

## What to Add Next

- Automated tests (unit + integration with Jest or Mocha)
- Swagger/OpenAPI documentation for interactive API exploration
- Docker & Docker Compose setup for local development
- Security hardening (rate-limiting, Helmet headers)
- TypeScript migration for type safety
- Monitoring/alerting (e.g. Sentry, Logstash)
- CI/CD pipeline for linting, tests, and deployments

## API Reference

### Product Routes

| Method | Endpoint           | Description                       |
|--------|-------------------|-----------------------------------|
| GET    | /api/products     | List all products (cached)        |
| GET    | /api/products/:id | Get a single product by its ID    |

### Cart Routes
All cart routes are protected by authMiddleware (currently a stub).

| Method | Endpoint                | Description                           |
|--------|------------------------|---------------------------------------|
| GET    | /api/cart              | Retrieve the current user's cart      |
| POST   | /api/cart/add          | Add an item to cart  |
| DELETE | /api/cart/item/:itemId | Remove one item from the cart         |
| PATCH  | /api/cart/item/:itemId | Update quantity of an item  |
| POST   | /api/cart/checkout     | Complete checkout   |
