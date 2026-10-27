import { Router } from "express";
import multer from "multer";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { matchResume } from "../services/matching.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = {
      ".pdf": "application/pdf",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    const extension = file.originalname
      .slice(file.originalname.lastIndexOf("."))
      .toLowerCase();

    if (allowedTypes[extension] !== file.mimetype) {
      return callback(new Error("Please upload a valid PDF or DOCX resume."));
    }

    callback(null, true);
  },
});

async function extractResumeText(file) {
  const extension = file.originalname
    .slice(file.originalname.lastIndexOf("."))
    .toLowerCase();

  if (extension === ".pdf") {
    const parser = new PDFParse({ data: file.buffer });

    try {
      const result = await parser.getText();
      return result.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  if (extension === ".docx") {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    return result.value.trim();
  }

  throw new Error("Unsupported file type.");
}

// Existing endpoint: match pasted resume text.
router.post("/match", async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (typeof resumeText !== "string" || !resumeText.trim()) {
      return res.status(400).json({
        error: "Please provide resumeText.",
      });
    }

    const matches = await matchResume(resumeText, 5);

    return res.json({
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error("Resume matching failed:", error.message);

    return res.status(500).json({
      error: "Unable to match the resume. Please try again.",
    });
  }
});

// New endpoint: upload a PDF or DOCX resume.
router.post(
  "/upload-match",
  (req, res, next) => {
    upload.single("resume")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          error: error.message || "Unable to upload the file.",
        });
      }

      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Please select a PDF or DOCX resume.",
        });
      }

      const resumeText = await extractResumeText(req.file);

      if (resumeText.length < 30) {
        return res.status(400).json({
          error:
            "Not enough text could be extracted. Try a text-based PDF or DOCX file. Scanned PDFs are not supported yet.",
        });
      }

      if (resumeText.length > 100_000) {
        return res.status(400).json({
          error: "Resume text is too long. Please use a shorter resume.",
        });
      }

      const matches = await matchResume(resumeText, 5);

      return res.json({
        fileName: req.file.originalname,
        extractedCharacters: resumeText.length,
        count: matches.length,
        matches,
      });
    } catch (error) {
      console.error("Resume upload/matching failed:", error.message);

      return res.status(500).json({
        error: "Unable to process this resume. Please try another file.",
      });
    }
  },
);

export default router;
