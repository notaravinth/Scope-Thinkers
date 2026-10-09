const express = require("express");
const db = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authenticateUser, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, firebase_uid, name, email, role, created_at
       FROM society_users
       WHERE firebase_uid = ?`,
      [req.user.uid]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Society user not found" });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error("Get current society user error:", error);
    res.status(500).json({ message: "Failed to get society user" });
  }
});

module.exports = router;
