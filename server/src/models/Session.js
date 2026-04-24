const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  questions: [{
    question: String,
    answer: String,
    score: Number,
    feedback: String
  }],
  faceAnalysis: {
    type: Object,
    default: {}
  },
  speechAnalysis: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('Session', SessionSchema);
