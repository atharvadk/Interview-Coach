const express = require("express");
const fastapi = require("../config/fastapi");
const router  = express.Router();


router.post("/generate", async (req, res) => {
    try {
        const session = req.session.interviewSession;
        const { domain, difficulty, session_id, previous_scores } = req.body;

        const payload = {
            domain:          domain          || session?.domain,
            difficulty:      difficulty      || session?.difficulty || "medium",
            session_id:      session_id      || session?.sessionId,
            previous_scores: previous_scores || []
        };

        const response = await fastapi.post("/questions/generate", payload);

        // Store question in session
        if (session) {
            session.questions.push(response.data);
        }

        return res.json(response.data);

    } catch (error) {
        console.error("Question generation error:", error.message);
        return res.status(500).json({ error: error.message });
    }
});


module.exports = router;