"use client";

import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

const InterviewContext = createContext();

export function InterviewProvider({ children }) {
  const [session, setSession] = useState({
    sessionId: null,
    domain: null,
    difficulty: null,
    totalQuestions: 5
  });
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [results, setResults] = useState([]); // per-question evaluation results
  const [emotionsTimeline, setEmotionsTimeline] = useState([]);
  
  const startSession = useCallback((details) => {
    setSession({
      sessionId: details.sessionId,
      domain: details.domain,
      difficulty: details.difficulty,
      totalQuestions: details.totalQuestions
    });
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setResults([]);
    setEmotionsTimeline([]);
  }, []);

  const saveEvaluation = useCallback((questionId, evaluation) => {
    setResults(prev => [...prev, { questionId, ...evaluation }]);
  }, []);

  const nextQuestion = useCallback(() => {
    let hasNext = false;
    setCurrentQuestionIndex(prev => {
      if (prev < session.totalQuestions - 1) {
        hasNext = true;
        return prev + 1;
      }
      return prev;
    });
    return hasNext;
  }, [session.totalQuestions]);

  const resetInterview = useCallback(() => {
    setSession({
      sessionId: null,
      domain: null,
      difficulty: null,
      totalQuestions: 5
    });
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setResults([]);
    setEmotionsTimeline([]);
  }, []);

  const value = useMemo(() => ({
    session, 
    startSession,
    questions, 
    setQuestions,
    currentQuestionIndex,
    nextQuestion,
    results,
    saveEvaluation,
    emotionsTimeline,
    setEmotionsTimeline,
    resetInterview
  }), [
    session, 
    startSession, 
    questions, 
    currentQuestionIndex, 
    nextQuestion, 
    results, 
    saveEvaluation, 
    emotionsTimeline, 
    resetInterview
  ]);

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
}

export const useInterview = () => useContext(InterviewContext);
