const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }
    
    // Create cache key based on route and query parameters
    const cacheKey = `cache:${req.originalUrl}`;
    
    try {
      const cachedResponse = await req.getAsync(cacheKey);
      
      if (cachedResponse) {
        const parsedResponse = JSON.parse(cachedResponse);
        return res.json(parsedResponse);
      }
      
      // Store original send function
      const originalSend = res.send;
      
      // Override response send method to cache response
      res.send = function(body) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (req.headers['cache-control'] !== 'no-cache') {
            req.setAsync(cacheKey, body, 'EX', ttl);
          }
        }
        
        // Call original send method
        originalSend.call(this, body);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export default cacheMiddleware;