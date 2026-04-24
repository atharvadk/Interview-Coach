const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router  = express.Router();

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