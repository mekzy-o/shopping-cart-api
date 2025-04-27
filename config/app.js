export const port = process.env.PORT || 3000;
export const env = process.env.NODE_ENV || 'development';
export const cache = {
  productTTL: 600, // 10 minutes in seconds
  cartTTL: 300, // 5 minutes in seconds 
  categoryTTL: 1800 // 30 minutes in seconds
};
export const cart = {
  expiryDays: 7, // Cart expires after 7 days
  lockTimeout: 10 // Lock timeout in seconds
};
export const checkout = {
  lockTimeout: 30, // Checkout lock timeout in seconds
};
export const pagination = {
  defaultLimit: 10,
  maxLimit: 50
};