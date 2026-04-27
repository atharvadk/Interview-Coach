"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useInterview } from "@/context/InterviewContext";
import { useWebcamEmotion } from "@/hooks/useWebcamEmotion";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { evaluateApi, questionsApi } from "@/utils/api";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/QuestionCard";
import { WebcamFeed } from "@/components/WebcamFeed";
import { AnswerInput } from "@/components/AnswerInput";
import { ScoreCard } from "@/components/ScoreCard";
import { Loader2 } from "lucide-react";

export default function Interview() {
  const webcamRef = useRef(null);
  const router = useRouter();
  const { session, questions, setQuestions, currentQuestionIndex, nextQuestion, saveEvaluation } = useInterview();
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  
  // Custom hooks
  const { isRecording, transcript, startRecording, stopRecording } = useAudioRecorder();
  const { currentEmotion, emotionTimeline, resetEmotionTimeline } = useWebcamEmotion(isRecording, webcamRef);

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);

  useEffect(() => {
    return () => {
      stopRecording();
      resetEmotionTimeline();
    };
  }, [stopRecording, resetEmotionTimeline]);

  

  useEffect(() => {
    if (!session.sessionId) {
      router.push("/setup");
      return;
    }

    if (questions.length === 0 && loadingQuestion) {
      const load = async () => {
        try {
          const allQuestions = [];
          for (let i = 0; i < session.totalQuestions; i++) {
            const q = await questionsApi.generate(
              session.domain,
              session.difficulty,
              session.sessionId
            );
            allQuestions.push(...q);
          }
          setQuestions(allQuestions);
        } catch (e) {
          console.error("Failed to load questions:", e);
        } finally {
          setLoadingQuestion(false);
        }
      };
      load();
    }
  }, [session.sessionId, session.domain, session.difficulty, session.totalQuestions, questions.length, loadingQuestion, setQuestions]);

  const handleStopAndSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const finalTranscript = await stopRecording();
      
      if (!finalTranscript || finalTranscript.trim() === "") {
        alert("No speech detected. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const currentQuestion = questions[currentQuestionIndex];

      const evaluation = await evaluateApi.evaluate(
        finalTranscript,
        currentQuestion,
        session.sessionId,
        session.domain
      );

      saveEvaluation(
        currentQuestion.question_id, 
        { ...evaluation, emotionTimeline }
      );
      setCurrentResult(evaluation);

    } catch (e) {
      console.error("Submit error:", e);
      alert("Failed to evaluate answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [stopRecording, questions, currentQuestionIndex, saveEvaluation, emotionTimeline, session]);

  const handleNext = useCallback(() => {
    setCurrentResult(null);
    resetEmotionTimeline();
    const hasNext = nextQuestion();
    if (!hasNext) {
      router.push(`/report?sessionId=${session.sessionId}`);
    }
  }, [resetEmotionTimeline, nextQuestion, router, session.sessionId]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <Navbar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col pt-8">
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${((currentQuestionIndex) / session.totalQuestions) * 100}%` }}
            ></div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
            {/* Left Column */}
            <div className="flex flex-col gap-6 min-h-0">
              <div className="h-64 lg:h-auto lg:flex-1 min-h-0">
                <QuestionCard 
                  question={questions[currentQuestionIndex]}
                  current={currentQuestionIndex + 1}
                  total={session.totalQuestions}
                  domain={session.domain}
                  difficulty={session.difficulty}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6 min-h-0">
              <div className="flex-none">
                <WebcamFeed currentEmotion={currentEmotion} webcamRef={webcamRef} />
              </div>
              
              <div className="flex-1 min-h-0">
                <AnswerInput 
                  isRecording={isRecording}
                  transcript={transcript}
                  onStartRecord={startRecording}
                  onStopAndSubmit={handleStopAndSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        </main>

        {currentResult && (
          <ScoreCard result={currentResult} onProvideNext={handleNext} />
        )}
      </div>
    </ProtectedRoute>
  );
}