const authMiddleware = (req, res, next) => {
  const userId = req.headers['user-id'];
  
  if (!userId) {
    return res.status(401).json({
      status: 'fail',
      message: 'Authentication required. Please provide user-id in headers.'
    });
  }
  
  // Set userId in request object for use in controllers
  req.userId = userId;
  next();
};

export default authMiddleware;