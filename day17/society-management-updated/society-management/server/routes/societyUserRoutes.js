const express = require("express");
const db = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");
const loadSocietyUser = require("../middleware/societyUserMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authenticateUser, async (req, res) => {
  try {
    const { name } = req.body;
    const firebase_uid = req.user.uid;
    const email = req.user.email;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const [existingUsers] = await db.query(
      "SELECT id FROM society_users WHERE firebase_uid = ?",
      [firebase_uid]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Society user already exists" });
    }

    const [result] = await db.query(
      `INSERT INTO society_users (firebase_uid, name, email, role)
       VALUES (?, ?, ?, 'resident')`,
      [firebase_uid, name.trim(), email]
    );

    res.status(201).json({
      message: "Society user created successfully",
      user: {
        id: result.insertId,
        firebase_uid,
        name: name.trim(),
        email,
        role: "resident",
      },
    });
  } catch (error) {
    console.error("Create society user error:", error);
    res.status(500).json({ message: "Failed to create society user" });
  }
});

router.get("/", authenticateUser, loadSocietyUser, allowRoles("manager"), async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, name, email, role, created_at
       FROM society_users
       ORDER BY created_at DESC`
    );
    res.json({ users });
  } catch (error) {
    console.error("Get society users error:", error);
    res.status(500).json({ message: "Failed to fetch society users" });
  }
});

router.patch("/:id/role", authenticateUser, loadSocietyUser, allowRoles("manager"), async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["resident", "owner", "committee", "security", "manager"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (Number(req.params.id) === req.societyUser.id && role !== "manager") {
      return res.status(400).json({ message: "You cannot remove your own manager role" });
    }

    await db.query(
      "UPDATE society_users SET role = ? WHERE id = ?",
      [role, req.params.id]
    );

    res.json({ message: "Role updated successfully" });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ message: "Failed to update role" });
  }
});

module.exports = router;
