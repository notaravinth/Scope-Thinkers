const SOCIETY_ROLES = [
  "resident",
  "owner",
  "committee",
  "security",
  "manager",
];

const allowRoles = (...allowedRoles) => {
  const invalidRoles = allowedRoles.filter(
    (role) => !SOCIETY_ROLES.includes(role)
  );

  if (invalidRoles.length > 0) {
    throw new Error(`Invalid society role(s): ${invalidRoles.join(", ")}`);
  }

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
module.exports.SOCIETY_ROLES = SOCIETY_ROLES;
