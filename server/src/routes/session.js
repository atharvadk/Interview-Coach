const express = require("express");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router  = express.Router();

// Multer setup for resume uploads
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
        cb(null, name);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") cb(null, true);
        else cb(new Error("Only PDF files are allowed"));
    }
});

// POST /upload-resume
router.post("/upload-resume", upload.single("resume"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    // Return file path or URL (adjust as needed for prod)
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ resumeUrl: fileUrl });
});

// ✅ This must be "/start" not "/"
router.post("/start", (req, res) => {
    const { domain, difficulty, totalQuestions } = req.body;

    if (!domain) {
        return res.status(400).json({ error: "Domain is required" });
    }

    const sessionId = uuidv4();

    req.session.interviewSession = {
        sessionId,
        domain,
        difficulty:      difficulty     || "medium",
        totalQuestions:  totalQuestions || 5,
        startTime:       new Date().toISOString(),
        questions:       [],
        results:         [],
        emotions:        []
    };

    return res.json({
        sessionId,
        domain,
        difficulty:     difficulty     || "medium",
        totalQuestions: totalQuestions || 5,
        message:        "Session started successfully"
    });
});

router.get("/:id", (req, res) => {
    const session = req.session.interviewSession;

    if (!session || session.sessionId !== req.params.id) {
        return res.status(404).json({ error: "Session not found" });
    }

    return res.json(session);
});

router.post("/end", (req, res) => {
    req.session.interviewSession = null;
    return res.json({ message: "Session ended" });
});

const authMiddleware = require("../middleware/auth");
const Session = require("../models/Session");

// GET /api/session/history — fetch all past sessions for logged in user
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id })
      .sort({ startedAt: -1 })
      .limit(20);

    const formatted = sessions.map((s) => {
      const scores = s.questions.map((q) => q.score).filter(Boolean);
      const avgScore =
        scores.length > 0
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
          : 0;

      return {
        id: s._id,
        sessionId: s._id,
        domain: s.faceAnalysis?.domain || "N/A",
        date: new Date(s.startedAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        score: avgScore,
        totalQuestions: s.questions.length,
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.error("History error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/session/stats — fetch aggregated stats for logged in user
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id }).sort({
      startedAt: -1,
    });

    if (sessions.length === 0) {
      return res.json({
        total: 0,
        avgScore: 0,
        bestDomain: "N/A",
        chartData: [],
        domainPerformance: [],
      });
    }

    // Overall avg score
    let allScores = [];
    sessions.forEach((s) => {
      s.questions.forEach((q) => {
        if (q.score != null) allScores.push(q.score);
      });
    });
    const avgScore =
      allScores.length > 0
        ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
        : 0;

    // Best domain
    const domainScores = {};
    const domainCounts = {};
    sessions.forEach((s) => {
      const domain = s.faceAnalysis?.domain || "unknown";
      const scores = s.questions.map((q) => q.score).filter(Boolean);
      if (scores.length === 0) return;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (!domainScores[domain]) {
        domainScores[domain] = 0;
        domainCounts[domain] = 0;
      }
      domainScores[domain] += avg;
      domainCounts[domain] += 1;
    });

    let bestDomain = "N/A";
    let bestAvg = 0;
    Object.keys(domainScores).forEach((d) => {
      const avg = domainScores[d] / domainCounts[d];
      if (avg > bestAvg) {
        bestAvg = avg;
        bestDomain = d.toUpperCase();
      }
    });

    // Chart data — last 10 sessions
    const chartData = sessions
      .slice(0, 10)
      .reverse()
      .map((s, i) => {
        const scores = s.questions.map((q) => q.score).filter(Boolean);
        const avg =
          scores.length > 0
            ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
            : 0;
        return { name: `S${i + 1}`, score: avg };
      });

    // Domain performance
    const domainPerformance = Object.keys(domainScores).map((d) => ({
      domain: d.toUpperCase(),
      score:
        Math.round((domainScores[d] / domainCounts[d]) * 10) / 10,
    }));

    return res.json({
      total: sessions.length,
      avgScore,
      bestDomain,
      chartData,
      domainPerformance,
    });
  } catch (err) {
    console.error("Stats error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;