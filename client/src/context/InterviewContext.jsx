import { createContext, useContext, useState } from "react";

const InterviewContext = createContext(null);

export function InterviewProvider({ children }) {
  const [sessionId]  = useState(() => crypto.randomUUID());
  const [domain,  setDomain]      = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [scores,  setScores]      = useState([]);
  const [results, setResults]     = useState([]);
  const [emotions, setEmotions]   = useState([]);

  const addResult  = (r) => setResults(prev  => [...prev, r]);
  const addScore   = (s) => setScores(prev   => [...prev, s]);
  const addEmotion = (e) => setEmotions(prev => [...prev, e]);

  const resetSession = () => {
    setDomain(null);
    setDifficulty("medium");
    setQuestionNumber(1);
    setScores([]);
    setResults([]);
    setEmotions([]);
  };

  return (
    <InterviewContext.Provider value={{
      sessionId, domain, setDomain,
      difficulty, setDifficulty,
      questionNumber, setQuestionNumber,
      scores, addScore,
      results, addResult,
      emotions, addEmotion,
      resetSession
    }}>
      {children}
    </InterviewContext.Provider>
  );
}

export const useInterview = () => useContext(InterviewContext);