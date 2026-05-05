const express = require("express");
const axios   = require("axios");
const router  = express.Router();


// ── Overall AI Summary ────────────────────────────────────────────────────────
async function generateOverallSummary(results, avgScore, domain) {
    try {
        const questionSummaries = results.map((r, i) =>
            `Q${i + 1}: Score ${r.composite_score}/10. Missing: ${r.missing_keywords.join(", ") || "none"}`
        ).join("\n");

        const payload = {
            session_id:  "report_summary",
            question_id: "overall",
            question:    `Generate overall interview feedback for a ${domain} interview`,
            answer:      questionSummaries,
            domain:      domain
        };

        const response = await axios.post(
            `${process.env.FASTAPI_URL}/evaluate/`,
            payload
        );

        return response.data.feedback;

    } catch (error) {
        console.error("Overall summary error:", error.message);
        return avgScore >= 7
            ? "Strong overall performance. Keep practicing advanced topics."
            : "Good effort. Focus on the missing concepts to improve your score.";
    }
}


// ── Report Route ──────────────────────────────────────────────────────────────
router.get("/:sessionId", async (req, res) => {
    try {
        const session = req.session.interviewSession;

        if (!session || session.sessionId !== req.params.sessionId) {
            return res.status(404).json({ error: "Session not found" });
        }

        const results  = session.results  || [];
        const emotions = session.emotions || [];

        if (results.length === 0) {
            return res.status(400).json({ error: "No results found for this session" });
        }

        // ── Overall Stats ─────────────────────────────────────────────────────
        const scores   = results.map(r => r.composite_score);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        // Improvement trend
        let trend = "stable";
        if (scores.length >= 2) {
            const firstHalf  = scores.slice(0, Math.floor(scores.length / 2));
            const secondHalf = scores.slice(Math.floor(scores.length / 2));
            const firstAvg   = firstHalf.reduce((a,  b) => a + b, 0) / firstHalf.length;
            const secondAvg  = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

            if (secondAvg - firstAvg > 1.0)      trend = "improving";
            else if (firstAvg - secondAvg > 1.0) trend = "declining";
        }

        // ── Per Question Report ───────────────────────────────────────────────
        const questionReports = results.map((result, index) => {
            const questionsCount = results.length;
            const emotionsPerQ   = Math.floor(emotions.length / questionsCount) || 1;
            const qEmotions      = emotions
                .slice(index * emotionsPerQ, (index + 1) * emotionsPerQ)
                .map(e => e.dominant_emotion);

            const dominantEmotion = qEmotions.length > 0
                ? qEmotions.sort((a, b) =>
                    qEmotions.filter(v => v === b).length -
                    qEmotions.filter(v => v === a).length)[0]
                : "neutral";

            return {
                question_number:  index + 1,
                question:         result.question,
                user_answer:      result.user_answer,
                composite_score:  result.composite_score,
                semantic_score:   result.semantic_score,
                keyword_score:    result.keyword_score,
                grammar_score:    result.grammar_score,
                missing_keywords: result.missing_keywords,
                misconceptions:   result.misconceptions,
                feedback:         result.feedback,
                model_answer:     result.model_answer,
                dominant_emotion: dominantEmotion,
                emotion_timeline: qEmotions
            };
        });

        // ── Strengths & Areas to Improve ──────────────────────────────────────
        const allMissing    = results.flatMap(r => r.missing_keywords);
        const uniqueMissing = [...new Set(allMissing)].slice(0, 5);

        const strengths = scores.filter(s => s >= 7.0).length > scores.length / 2
            ? ["Good conceptual understanding", "Clear communication"]
            : ["Showed effort in attempting all questions"];

        // ── AI Overall Summary ────────────────────────────────────────────────
        const overallFeedback = await generateOverallSummary(
            results,
            avgScore,
            session.domain
        );

        // Save session to DB so dashboard can read it
        try {
        const authHeader = req.headers["x-auth-token"];
        if (authHeader) {
            const jwt = require("jsonwebtoken");
            const User = require("../models/User");
            const Session = require("../models/Session");

            const decoded = jwt.verify(
            authHeader,
            process.env.JWT_SECRET || "your_jwt_secret"
            );
            const userId = decoded.user.id;

            await Session.findOneAndUpdate(
            { _id: session.sessionId },
            {
                user: userId,
                endedAt: new Date(),
                questions: results.map((r) => ({
                question: r.question,
                answer: r.user_answer,
                score: r.composite_score,
                feedback: r.feedback,
                })),
                faceAnalysis: { domain: session.domain },
            },
            { upsert: true, new: true }
            );
        }
        } catch (dbErr) {
        console.warn("Could not save session to DB:", dbErr.message);
        }
        
        // ── Final Response ────────────────────────────────────────────────────
        return res.json({
            sessionId:         session.sessionId,
            domain:            session.domain,
            total_questions:   results.length,
            average_score:     Math.round(avgScore * 100) / 100,
            improvement_trend: trend,
            questions:         questionReports,
            overall_feedback:  overallFeedback,
            strengths,
            areas_to_improve:  uniqueMissing
        });

    } catch (error) {
        console.error("Report error:", error.message);
        return res.status(500).json({ error: error.message });
    }
});


module.exports = router;