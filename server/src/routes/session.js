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

module.exports = router;