const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const societyUserRoutes = require("./routes/societyUserRoutes");
const societyAuthRoutes = require("./routes/societyAuthRoutes");
const societyComplaintRoutes = require("./routes/societyComplaintRoutes");
const societyVisitorRoutes = require("./routes/societyVisitorRoutes");
const societyAnnouncementRoutes = require("./routes/societyAnnouncementRoutes");
const societyPaymentRoutes = require("./routes/societyPaymentRoutes");
const societyPropertyRoutes = require("./routes/societyPropertyRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Society Management API is running",
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS result");

    res.json({
      message: "MySQL connected successfully",
      result: rows[0].result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.use("/api/society-users", societyUserRoutes);
app.use("/api/society-auth", societyAuthRoutes);
app.use("/api/society-complaints", societyComplaintRoutes);
app.use("/api/society-visitors", societyVisitorRoutes);
app.use("/api/society-announcements", societyAnnouncementRoutes);
app.use("/api/society-payments", societyPaymentRoutes);
app.use("/api/society-properties", societyPropertyRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
