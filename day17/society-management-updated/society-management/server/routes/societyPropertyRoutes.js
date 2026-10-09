const express = require("express");
const db = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");
const loadSocietyUser = require("../middleware/societyUserMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authenticateUser, loadSocietyUser, async (req, res) => {
  try {
    let query = `
      SELECT p.*, o.name AS owner_name, o.email AS owner_email
      FROM society_properties p
      LEFT JOIN society_users o ON o.id = p.owner_id
    `;
    const params = [];

    if (["resident", "owner"].includes(req.societyUser.role)) {
      query += " WHERE p.owner_id = ?";
      params.push(req.societyUser.id);
    }

    query += " ORDER BY p.block, p.flat_number";

    const [properties] = await db.query(query, params);
    res.json({ properties });
  } catch (error) {
    console.error("Get properties error:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});

router.post("/", authenticateUser, loadSocietyUser, allowRoles("manager"), async (req, res) => {
  try {
    const { flat_number, block, owner_id } = req.body;

    if (!flat_number || !block) {
      return res.status(400).json({ message: "Flat number and block are required" });
    }

    await db.query(
      `INSERT INTO society_properties (flat_number, block, owner_id)
       VALUES (?, ?, ?)`,
      [flat_number.trim(), block.trim(), owner_id || null]
    );

    res.status(201).json({ message: "Property created successfully" });
  } catch (error) {
    console.error("Create property error:", error);
    res.status(500).json({ message: "Failed to create property" });
  }
});

module.exports = router;
