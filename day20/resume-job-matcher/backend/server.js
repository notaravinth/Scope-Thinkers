import "dotenv/config";
import resumeRoutes from "./src/routes/resumes.js";
import express from "express";
import cors from "cors";
import {
  connectWeaviate,
  ensureJobCollection,
  closeWeaviate,
} from "./src/services/weaviate.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));
app.use(express.json());
app.use("/api/resumes", resumeRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "resume-job-matcher-api" });
});

async function startServer() {
  try {
    await connectWeaviate();
    await ensureJobCollection();

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
}

async function shutdown() {
  await closeWeaviate();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();