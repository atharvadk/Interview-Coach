const express = require("express");
const axios = require("axios");
const router = express.Router();
const Session = require("../models/Session");
const authMiddleware = require("../middleware/auth");

// ── Overall AI Summary ────────────────────────────────────────────────────────
async function generateOverallSummary(results, avgScore, domain) {
  try {
    const questionSummaries = results
      .map(
        (r, i) =>
          `Q${i + 1}: Score ${r.composite_score}/10. Missing: ${
            r.missing_keywords?.join(", ") || "none"
          }`
      )
      .join("\n");

    const payload = {
      session_id: "report_summary",
      question_id: "overall",
      question: `Generate overall interview feedback for a ${domain} interview`,
      answer: questionSummaries,
      domain: domain,
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

// ── Helper: build report from results array ───────────────────────────────────
function buildQuestionReports(results, emotions = []) {
  return results.map((result, index) => {
    const questionsCount = results.length;
    const emotionsPerQ = Math.floor(emotions.length / questionsCount) || 1;
    const qEmotions = emotions
      .slice(index * emotionsPerQ, (index + 1) * emotionsPerQ)
      .map((e) => e.dominant_emotion || e);

    const dominantEmotion =
      qEmotions.length > 0
        ? qEmotions.sort(
            (a, b) =>
              qEmotions.filter((v) => v === b).length -
              qEmotions.filter((v) => v === a).length
          )[0]
        : "neutral";

    return {
      question_number: index + 1,
      question: result.question,
      user_answer: result.user_answer || result.answer,
      composite_score: result.composite_score || result.score || 0,
      semantic_score: result.semantic_score || 0,
      keyword_score: result.keyword_score || 0,
      grammar_score: result.grammar_score || 0,
      missing_keywords: result.missing_keywords || [],
      misconceptions: result.misconceptions || [],
      feedback: result.feedback || "",
      model_answer: result.model_answer || "",
      dominant_emotion: dominantEmotion,
      emotion_timeline: qEmotions,
    };
  });
}

// ── GET /api/report/:sessionId ────────────────────────────────────────────────
router.get("/:sessionId", authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // ── Case 1: Try Express session first (fresh interview) ──────────────────
    const expressSession = req.session.interviewSession;

    if (expressSession && expressSession.sessionId === sessionId) {
      const results = expressSession.results || [];
      const emotions = expressSession.emotions || [];

      if (results.length === 0) {
        return res.status(400).json({ error: "No results found for this session" });
      }

      const scores = results.map((r) => r.composite_score);
      const avgScore =
        scores.reduce((a, b) => a + b, 0) / scores.length;

      // Improvement trend
      let trend = "stable";
      if (scores.length >= 2) {
        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));
        const firstAvg =
          firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg =
          secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        if (secondAvg - firstAvg > 1.0) trend = "improving";
        else if (firstAvg - secondAvg > 1.0) trend = "declining";
      }

      const questionReports = buildQuestionReports(results, emotions);

      const allMissing = results.flatMap((r) => r.missing_keywords || []);
      const uniqueMissing = [...new Set(allMissing)].slice(0, 5);

      const strengths =
        scores.filter((s) => s >= 7.0).length > scores.length / 2
          ? ["Good conceptual understanding", "Clear communication"]
          : ["Showed effort in attempting all questions"];

      const overallFeedback = await generateOverallSummary(
        results,
        avgScore,
        expressSession.domain
      );

      // ── Save to MongoDB so it can be loaded from history later ─────────────
      try {
        await Session.findOneAndUpdate(
          { sessionId: sessionId },
          {
            user: req.user.id,
            sessionId: sessionId,
            endedAt: new Date(),
            questions: results.map((r) => ({
              question: r.question,
              answer: r.user_answer,
              score: r.composite_score,
              feedback: r.feedback,
            })),
            faceAnalysis: { domain: expressSession.domain },
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.warn("Could not save session to DB:", dbErr.message);
      }

      return res.json({
        sessionId,
        domain: expressSession.domain,
        total_questions: results.length,
        average_score: Math.round(avgScore * 100) / 100,
        improvement_trend: trend,
        questions: questionReports,
        overall_feedback: overallFeedback,
        strengths,
        areas_to_improve: uniqueMissing,
      });
    }

    // ── Case 2: Load from MongoDB (from dashboard history link) ───────────────
    const dbSession = await Session.findOne({
      $or: [
        { sessionId: sessionId },
        { _id: sessionId.match(/^[a-f\d]{24}$/i) ? sessionId : null },
      ],
      user: req.user.id,
    });

    if (!dbSession) {
      return res.status(404).json({
        error: "Session not found. It may have expired or belongs to another user.",
      });
    }

    const results = dbSession.questions.map((q) => ({
      question: q.question,
      user_answer: q.answer,
      composite_score: q.score || 0,
      semantic_score: q.score || 0,
      keyword_score: q.score || 0,
      grammar_score: q.score || 0,
      missing_keywords: [],
      misconceptions: [],
      feedback: q.feedback || "",
      model_answer: "",
    }));

    if (results.length === 0) {
      return res.status(400).json({ error: "No results found for this session" });
    }

    const scores = results.map((r) => r.composite_score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    let trend = "stable";
    if (scores.length >= 2) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      if (secondAvg - firstAvg > 1.0) trend = "improving";
      else if (firstAvg - secondAvg > 1.0) trend = "declining";
    }

    const questionReports = buildQuestionReports(results);
    const domain = dbSession.faceAnalysis?.domain || "general";

    const strengths =
      scores.filter((s) => s >= 7.0).length > scores.length / 2
        ? ["Good conceptual understanding", "Clear communication"]
        : ["Showed effort in attempting all questions"];

    const overallFeedback = await generateOverallSummary(
      results,
      avgScore,
      domain
    );

    return res.json({
      sessionId: dbSession.sessionId || dbSession._id,
      domain,
      total_questions: results.length,
      average_score: Math.round(avgScore * 100) / 100,
      improvement_trend: trend,
      questions: questionReports,
      overall_feedback: overallFeedback,
      strengths,
      areas_to_improve: [],
    });
  } catch (error) {
    console.error("Report error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;