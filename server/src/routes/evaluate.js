const express = require("express");
const fastapi = require("../config/fastapi");
const router  = express.Router();


router.post("/", async (req, res) => {
    try {
        const session = req.session.interviewSession;

        const payload = {
            session_id:  req.body.session_id  || session?.sessionId,
            question_id: req.body.question_id,
            question:    req.body.question,
            answer:      req.body.answer,
            domain:      req.body.domain      || session?.domain
        };

        const response = await fastapi.post("/evaluate/", payload);

        // Store result in session
        if (session) {
            session.results.push({
                question_id:     payload.question_id,
                question:        payload.question,
                user_answer:     payload.answer,
                ...response.data
            });

            // Update difficulty for next question
            session.difficulty = response.data.next_difficulty;
        }

        return res.json(response.data);

    } catch (error) {
        console.error("Evaluation error:", error.message);
        return res.status(500).json({ error: error.message });
    }
});


module.exports = router;