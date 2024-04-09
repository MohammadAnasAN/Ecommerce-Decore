const jwt = require('jsonwebtoken');

// Middleware function for verifying JWT tokens
const verifyToken = (req, res, next) => {
  // Get the token from the request headers
  const token = req.headers['authorization'];

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token is missing' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, 'token'); // Replace 'your_secret_key' with your actual secret key

    // Attach the decoded payload to the request object
    req.user = decoded;

    // Continue with the next middleware or route handler
    next();
  } catch (err) {
    // Token is invalid
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = verifyToken;
