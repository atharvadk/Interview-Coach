const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  session_id: String,
  domain: String,
  // Change this from questionBreakdown to questions if it isn't already
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

module.exports = mongoose.model('Report', ReportSchema);
