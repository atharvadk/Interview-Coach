const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  session_id: String,
  domain: String,
  questions: [{
    question_number: Number,
    question: String,
    user_answer: String,
    composite_score: Number,
    feedback: String
  }],
  average_score: Number,
  createdAt: { type: Date, default: Date.now }
});

// Was "ReportSchema" (undefined) — fixed to "reportSchema"
module.exports = mongoose.model('Report', reportSchema);