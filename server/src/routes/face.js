const express  = require("express");
const multer   = require("multer");
const axios    = require("axios");
const FormData = require("form-data");
const router   = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits:  { fileSize: 5 * 1024 * 1024 }    // 5MB max
});


router.post("/analyze", upload.single("frame"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image provided" });
        }

        const session    = req.session.interviewSession;
        const session_id = req.body.session_id || session?.sessionId;

        const form = new FormData();
        form.append("frame",      req.file.buffer, {
            filename:    "frame.jpg",
            contentType: req.file.mimetype
        });
        form.append("session_id", session_id);

        const response = await axios.post(
            `${process.env.FASTAPI_URL}/face/analyze`,
            form,
            { headers: form.getHeaders(), timeout: 15000 }
        );

        // Store emotion in session
        if (session) {
            session.emotions.push({
                timestamp:        new Date().toISOString(),
                dominant_emotion: response.data.dominant_emotion
            });
        }

        return res.json(response.data);

    } catch (error) {
        console.error("Face analysis error:", error.message);
        return res.status(500).json({ error: error.message });
    }
});


module.exports = router;