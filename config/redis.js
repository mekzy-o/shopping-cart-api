import { createClient } from 'redis';

const connectRedis = () => {
  const client = createClient(process.env.REDIS_URL || 'redis://localhost:6379');
  
  client.on('error', (err) => console.error('Redis error:', err));
  client.on('connect', () => console.log('Redis connected'));
  
  return client;
};

export default connectRedis;