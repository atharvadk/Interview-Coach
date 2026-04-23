// Mocking API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  auth: {
    register: async (data) => {
      await delay(800);
      return { token: "mock_jwt_token_123", user: { id: 1, name: data.name, email: data.email } };
    },
    login: async (data) => {
      await delay(800);
      if (data.email === "test@example.com" && data.password === "Password123") {
        return { token: "mock_jwt_token_123", user: { id: 1, name: "Test User", email: data.email } };
      }
      if (data.password) {
         return { token: "mock_jwt_token_123", user: { id: 1, name: data.email.split('@')[0], email: data.email } };
      }
      throw new Error("Invalid credentials");
    },
    getMe: async () => {
      await delay(400);
      return { id: 1, name: "Atharva", email: "atharva@example.com" };
    }
  },
  users: {
    getStats: async () => {
      await delay(600);
      return { total: 12, avgScore: 7.2, bestDomain: "ML" };
    },
    getSessions: async () => {
      await delay(600);
      return [
        { id: "s1", date: "2026-04-18", domain: "ML", score: 8.1, trend: "up" },
        { id: "s2", date: "2026-04-10", domain: "DSA", score: 6.3, trend: "down" },
        { id: "s3", date: "2026-04-05", domain: "OS", score: 5.8, trend: "same" },
      ];
    },
    getChartData: async () => {
       await delay(300);
       return [
         { name: '1', score: 5 },
         { name: '2', score: 5.5 },
         { name: '3', score: 6 },
         { name: '4', score: 4.5 },
         { name: '5', score: 7 },
         { name: '6', score: 6.8 },
         { name: '7', score: 7.2 },
       ];
    }
  },
  session: {
    start: async (data) => {
      await delay(800);
      return { sessionId: "session_" + Math.random().toString(36).substr(2, 9), ...data };
    }
  },
  questions: {
    generate: async (domain, difficulty, count) => {
      await delay(1200);
      const questions = [];
      for (let i = 1; i <= count; i++) {
        questions.push({
          id: i,
          text: `Sample ${difficulty} question ${i} about ${domain}?`,
        });
      }
      return questions;
    }
  },
  speech: {
    transcribe: async (chunk) => {
      await delay(500);
      return " This is a mock transcribed chunk.";
    }
  },
  face: {
    analyze: async () => {
      // Mocking emotion changes
      const emotions = [
        { emotion: "Neutral", emoji: "😐", confidence: 72 },
        { emotion: "Happy", emoji: "😊", confidence: 85 },
        { emotion: "Confused", emoji: "😟", confidence: 60 }
      ];
      return emotions[Math.floor(Math.random() * emotions.length)];
    }
  },
  evaluate: async (transcript, question) => {
    await delay(1500);
    const score = (Math.random() * 4 + 6).toFixed(1); // Score between 6.0 and 10.0
    return {
      score: parseFloat(score),
      feedback: "Good answer, but could have explained concepts deeper.",
      semantic: parseFloat((score * 0.9).toFixed(1)),
      keywords: parseFloat((score * 0.8).toFixed(1)),
      grammar: 10.0,
      missing: ["regularization", "dropout"],
      modelAnswer: `A comprehensive answer to ${question.text} would include details on the topic.`
    };
  },
  report: {
    get: async (sessionId) => {
      await delay(1000);
      return {
         sessionId,
         averageScore: 7.2,
         domain: "ML",
         totalQuestions: 10,
         overallFeedback: "Good performance overall. Strong conceptual understanding but missed some specific keywords.",
         strengths: ["Good conceptual understanding", "Clear communication"],
         improvements: ["gradient descent", "regularization"],
         questionBreakdown: [
            { id: 1, text: "What is overfitting?", score: 8.1, semantic: 8.2, keywords: 7.1, grammar: 10.0, missing: ["regularization", "dropout"], emotion: "Neutral", emoji: "😐", feedback: "Good answer...", modelAnswer: "Overfitting means..." }
         ]
      };
    }
  }
};
