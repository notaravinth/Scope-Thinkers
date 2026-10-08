const express = require("express");
const db = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");
const loadSocietyUser = require("../middleware/societyUserMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authenticateUser, loadSocietyUser, async (req, res) => {
  try {
    let query = `
      SELECT c.*, u.name AS creator_name, a.name AS assignee_name
      FROM society_complaints c
      JOIN society_users u ON u.id = c.created_by
      LEFT JOIN society_users a ON a.id = c.assigned_to
    `;
    const params = [];

    if (["resident", "owner"].includes(req.societyUser.role)) {
      query += " WHERE c.created_by = ?";
      params.push(req.societyUser.id);
    }

    query += " ORDER BY c.created_at DESC";

    const [complaints] = await db.query(query, params);
    res.json({ complaints });
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

router.post("/", authenticateUser, loadSocietyUser, allowRoles("resident", "owner"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const [result] = await db.query(
      `INSERT INTO society_complaints (title, description, created_by)
       VALUES (?, ?, ?)`,
      [title.trim(), description.trim(), req.societyUser.id]
    );

    res.status(201).json({
      message: "Complaint created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Create complaint error:", error);
    res.status(500).json({ message: "Failed to create complaint" });
  }
});

router.patch("/:id/status", authenticateUser, loadSocietyUser, allowRoles("manager", "committee"), async (req, res) => {
  try {
    const allowedStatuses = ["pending", "in_progress", "resolved", "closed"];
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid complaint status" });
    }

    await db.query(
      "UPDATE society_complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, req.params.id]
    );

    res.json({ message: "Complaint status updated" });
  } catch (error) {
    console.error("Update complaint error:", error);
    res.status(500).json({ message: "Failed to update complaint" });
  }
});

module.exports = router;
