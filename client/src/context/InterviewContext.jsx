"use client";

import React, { createContext, useState, useContext, useCallback, useMemo, useRef } from 'react';

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
  
  const [results, setResults] = useState([]);
  const [emotionsTimeline, setEmotionsTimeline] = useState([]);

  // Ref to always have the latest totalQuestions without stale closure issues
  const totalQuestionsRef = useRef(5);
  // Ref to always have the latest questions length
  const questionsLengthRef = useRef(0);

  const startSession = useCallback((details) => {
    totalQuestionsRef.current = details.totalQuestions;
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

  // Sync questionsLengthRef whenever questions changes
  const setQuestionsWithRef = useCallback((questionsOrUpdater) => {
    setQuestions(prev => {
      const next = typeof questionsOrUpdater === 'function'
        ? questionsOrUpdater(prev)
        : questionsOrUpdater;
      questionsLengthRef.current = next.length;
      return next;
    });
  }, []);

  const nextQuestion = useCallback(() => {
    // Use ref values so this never reads stale state
    const total = totalQuestionsRef.current;
    const qLength = questionsLengthRef.current;
    // Use whichever limit is more reliable — loaded questions length takes priority
    const limit = qLength > 0 ? qLength : total;

    let hasNext = false;
    setCurrentQuestionIndex(prev => {
      if (prev < limit - 1) {
        hasNext = true;
        return prev + 1;
      }
      return prev;
    });
    return hasNext;
  }, []); // empty deps — reads from refs only, never goes stale

  const resetInterview = useCallback(() => {
    totalQuestionsRef.current = 5;
    questionsLengthRef.current = 0;
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
    setQuestions: setQuestionsWithRef,
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
    setQuestionsWithRef,
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