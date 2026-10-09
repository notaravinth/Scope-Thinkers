const db = require("../config/db");

const loadSocietyUser = async (req, res, next) => {
  try {
    const [users] = await db.query(
      `SELECT id, firebase_uid, name, email, role, created_at
       FROM society_users
       WHERE firebase_uid = ?`,
      [req.user.uid]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "Society profile not found",
      });
    }

    req.societyUser = users[0];
    next();
  } catch (error) {
    console.error("Load society user error:", error);
    res.status(500).json({
      message: "Failed to load society profile",
    });
  }
};

module.exports = loadSocietyUser;
