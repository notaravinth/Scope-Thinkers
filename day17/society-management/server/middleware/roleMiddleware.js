const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.societyUser) {
      return res.status(401).json({
        message: "Society user profile required",
      });
    }

    if (!allowedRoles.includes(req.societyUser.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

module.exports = allowRoles;
