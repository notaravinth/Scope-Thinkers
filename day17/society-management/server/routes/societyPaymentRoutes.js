const express = require("express");
const db = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");
const loadSocietyUser = require("../middleware/societyUserMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authenticateUser, loadSocietyUser, async (req, res) => {
  try {
    let query = `
      SELECT p.*, pr.flat_number, pr.block, u.name AS user_name, u.email AS user_email
      FROM society_payments p
      LEFT JOIN society_properties pr ON pr.id = p.property_id
      JOIN society_users u ON u.id = p.user_id
    `;
    const params = [];

    if (["resident", "owner"].includes(req.societyUser.role)) {
      query += " WHERE p.user_id = ?";
      params.push(req.societyUser.id);
    }

    query += " ORDER BY p.due_date DESC";

    const [payments] = await db.query(query, params);
    res.json({ payments });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

router.post("/", authenticateUser, loadSocietyUser, allowRoles("manager"), async (req, res) => {
  try {
    const { user_id, property_id, amount, due_date } = req.body;

    if (!user_id || !amount || !due_date) {
      return res.status(400).json({ message: "User, amount and due date are required" });
    }

    await db.query(
      `INSERT INTO society_payments (user_id, property_id, amount, due_date)
       VALUES (?, ?, ?, ?)`,
      [user_id, property_id || null, amount, due_date]
    );

    res.status(201).json({ message: "Payment bill created successfully" });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ message: "Failed to create payment" });
  }
});

router.patch("/:id/paid", authenticateUser, loadSocietyUser, allowRoles("manager"), async (req, res) => {
  try {
    await db.query(
      `UPDATE society_payments
       SET status = 'paid', paid_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [req.params.id]
    );

    res.json({ message: "Payment marked as paid" });
  } catch (error) {
    console.error("Mark payment error:", error);
    res.status(500).json({ message: "Failed to update payment" });
  }
});

module.exports = router;
