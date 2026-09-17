const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Get the Authorization header
  const authHeader = req.headers.authorization;

  // Check if the header exists
  if (!authHeader) {
    return res.status(401).json({
      message: "Access token required",
    });
  }

  // Header looks like:
  // "Bearer eyJhbGciOiJIUzI1Ni..."
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid authorization format",
    });
  }

  try {
    // Verify the JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Store decoded information on the request
    req.user = decoded;

    // Continue to the actual route
    next();

  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticateToken;