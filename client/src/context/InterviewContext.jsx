'use client';
import { createContext, useContext, useState } from 'react';

const InterviewContext = createContext(null);

const initialState = {
  sessionId:       null,
  domain:          null,
  difficulty:      null,
  totalQuestions:  null,
  currentQuestion: null,
  questionNumber:  0,
  transcriptChunks: [],
  fullTranscript:  '',
  isRecording:     false,
  currentEmotion:  null,
  emotionTimeline: [],
  results:         [],
  scores:          [],
};

export function InterviewProvider({ children }) {
  const [state, setState] = useState(initialState);

  const setSessionId      = (id) => setState(s => ({ ...s, sessionId: id }));
  const setDomain         = (d)  => setState(s => ({ ...s, domain: d }));
  const setDifficulty     = (d)  => setState(s => ({ ...s, difficulty: d }));
  const setTotalQuestions = (n)  => setState(s => ({ ...s, totalQuestions: n }));
  const setCurrentQuestion= (q)  => setState(s => ({ ...s, currentQuestion: q }));
  const setQuestionNumber = (n)  => setState(s => ({ ...s, questionNumber: n }));

  const addTranscriptChunk = (chunk) =>
    setState(s => ({
      ...s,
      transcriptChunks: [...s.transcriptChunks, chunk],
      fullTranscript:   [...s.transcriptChunks, chunk].join(' '),
    }));

  const clearTranscript = () =>
    setState(s => ({ ...s, transcriptChunks: [], fullTranscript: '' }));

  const setIsRecording     = (v) => setState(s => ({ ...s, isRecording: v }));
  const setCurrentEmotion  = (e) => setState(s => ({ ...s, currentEmotion: e }));

  const addEmotionToTimeline = (e) =>
    setState(s => ({ ...s, emotionTimeline: [...s.emotionTimeline, e] }));

  const clearEmotionTimeline = () =>
    setState(s => ({ ...s, emotionTimeline: [] }));

  const addResult = (r)  => setState(s => ({ ...s, results: [...s.results, r] }));
  const addScore  = (sc) => setState(s => ({ ...s, scores:  [...s.scores,  sc] }));

  const resetInterview = () => setState(initialState);

  return (
    <InterviewContext.Provider
      value={{
        ...state,
        setSessionId,
        setDomain,
        setDifficulty,
        setTotalQuestions,
        setCurrentQuestion,
        setQuestionNumber,
        addTranscriptChunk,
        clearTranscript,
        setIsRecording,
        setCurrentEmotion,
        addEmotionToTimeline,
        clearEmotionTimeline,
        addResult,
        addScore,
        resetInterview,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export const useInterview = () => {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error('useInterview must be used inside InterviewProvider');
  return ctx;
};