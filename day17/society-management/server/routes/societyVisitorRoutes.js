const express = require("express");
const db = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");
const loadSocietyUser = require("../middleware/societyUserMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authenticateUser, loadSocietyUser, async (req, res) => {
  try {
    let query = `
      SELECT v.*, u.name AS resident_name
      FROM society_visitors v
      JOIN society_users u ON u.id = v.resident_id
    `;
    const params = [];

    if (["resident", "owner"].includes(req.societyUser.role)) {
      query += " WHERE v.resident_id = ?";
      params.push(req.societyUser.id);
    } else {
      query += " WHERE v.visit_date >= CURDATE() - INTERVAL 1 DAY";
    }

    query += " ORDER BY v.visit_date ASC, v.created_at DESC";

    const [visitors] = await db.query(query, params);
    res.json({ visitors });
  } catch (error) {
    console.error("Get visitors error:", error);
    res.status(500).json({ message: "Failed to fetch visitors" });
  }
});

router.post("/", authenticateUser, loadSocietyUser, allowRoles("resident", "owner"), async (req, res) => {
  try {
    const { visitor_name, visit_date } = req.body;

    if (!visitor_name || !visit_date) {
      return res.status(400).json({ message: "Visitor name and visit date are required" });
    }

    const [result] = await db.query(
      `INSERT INTO society_visitors (visitor_name, resident_id, visit_date)
       VALUES (?, ?, ?)`,
      [visitor_name.trim(), req.societyUser.id, visit_date]
    );

    res.status(201).json({
      message: "Visitor added successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Create visitor error:", error);
    res.status(500).json({ message: "Failed to create visitor" });
  }
});

router.patch("/:id/status", authenticateUser, loadSocietyUser, allowRoles("security"), async (req, res) => {
  try {
    const allowedStatuses = ["expected", "entered", "exited"];
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid visitor status" });
    }

    await db.query(
      "UPDATE society_visitors SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    res.json({ message: "Visitor status updated" });
  } catch (error) {
    console.error("Update visitor error:", error);
    res.status(500).json({ message: "Failed to update visitor" });
  }
});

module.exports = router;
