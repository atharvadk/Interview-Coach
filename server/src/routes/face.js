const express  = require("express");
const multer   = require("multer");
const axios    = require("axios");
const FormData = require("form-data");
const router   = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits:  { fileSize: 5 * 1024 * 1024 }    // 5MB max
});


// Handle both file upload and base64 image
router.post("/analyze", async (req, res) => {
    try {
        const { image, session_id } = req.body;
        
        let imageBuffer;
        let contentType = 'image/jpeg';
        
        if (image) {
            // Handle base64 image from frontend
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            imageBuffer = Buffer.from(base64Data, 'base64');
        } else if (req.file) {
            // Handle file upload
            imageBuffer = req.file.buffer;
            contentType = req.file.mimetype;
        } else {
            return res.status(400).json({ error: "No image provided" });
        }

        const session    = req.session?.interviewSession;
        const currentSessionId = req.body.session_id || session?.sessionId;

        const form = new FormData();
        form.append("frame", imageBuffer, {
            filename:    "frame.jpg",
            contentType: contentType
        });
        form.append("session_id", currentSessionId);

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