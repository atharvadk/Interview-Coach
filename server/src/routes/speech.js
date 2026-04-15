const express = require("express");
const multer  = require("multer");
const axios   = require("axios");
const FormData = require("form-data");
const router  = express.Router();

// Store audio in memory temporarily
const upload = multer({
    storage: multer.memoryStorage(),
    limits:  { fileSize: 25 * 1024 * 1024 }   // 25MB max
});


router.post("/transcribe", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided" });
        }

        const session    = req.session.interviewSession;
        const session_id = req.body.session_id || session?.sessionId;

        // Forward audio file to FastAPI
        const form = new FormData();
        form.append("audio",      req.file.buffer, {
            filename:    "answer.webm",
            contentType: req.file.mimetype
        });
        form.append("session_id", session_id);

        const response = await axios.post(
            `${process.env.FASTAPI_URL}/speech/transcribe`,
            form,
            { headers: form.getHeaders(), timeout: 60000 }
        );

        return res.json(response.data);

    } catch (error) {
        console.error("Transcription error:", error.message);
        return res.status(500).json({ error: error.message });
    }
});


module.exports = router;