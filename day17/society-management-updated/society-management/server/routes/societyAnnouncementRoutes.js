const express = require("express");
const db = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");
const loadSocietyUser = require("../middleware/societyUserMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authenticateUser, async (req, res) => {
  try {
    const [announcements] = await db.query(`
      SELECT a.*, u.name AS author_name
      FROM society_announcements a
      JOIN society_users u ON u.id = a.created_by
      ORDER BY a.created_at DESC
    `);

    res.json({ announcements });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
});

router.post(
  "/",
  authenticateUser,
  loadSocietyUser,
  allowRoles("manager", "committee"),
  async (req, res) => {
    try {
      const { title, content } = req.body;

      if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({
          message: "Title and content are required",
        });
      }

      await db.query(
        `INSERT INTO society_announcements (title, content, created_by)
         VALUES (?, ?, ?)`,
        [title.trim(), content.trim(), req.societyUser.id]
      );

      res.status(201).json({ message: "Announcement created successfully" });
    } catch (error) {
      console.error("Create announcement error:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  }
);

router.delete(
  "/:id",
  authenticateUser,
  loadSocietyUser,
  allowRoles("manager"),
  async (req, res) => {
    try {
      await db.query(
        "DELETE FROM society_announcements WHERE id = ?",
        [req.params.id]
      );

      res.json({ message: "Announcement deleted" });
    } catch (error) {
      console.error("Delete announcement error:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  }
);

module.exports = router;
