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
import { PrepareLoader } from "@/components/PrepareLoader";
import { Loader2 } from "lucide-react";

export default function Interview() {
  const webcamRef = useRef(null);
  const router = useRouter();
  const {
    session,
    questions,
    setQuestions,
    currentQuestionIndex,
    nextQuestion,
    saveEvaluation
  } = useInterview();

  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const hasLoadedRef = useRef(false);

  const {
    isRecording,
    transcript,
    transcribeError,
    clearError,
    startRecording,
    stopRecording
  } = useAudioRecorder();

  const { currentEmotion, emotionTimeline, resetEmotionTimeline } = useWebcamEmotion(
    isRecording,
    webcamRef
  );

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

    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const load = async () => {
      try {
        const allQuestions = [];
        for (let i = 0; i < session.totalQuestions; i++) {
          const q = await questionsApi.generate(
            session.domain,
            session.difficulty,
            session.sessionId
          );
          allQuestions.push(q[0]);
          setLoadedCount(i + 1);
        }
        setQuestions(allQuestions);
      } catch (e) {
        console.error("Failed to load questions:", e);
      } finally {
        setLoadingQuestion(false);
      }
    };

    load();
  }, [session.sessionId]);

  const handleStopAndSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const finalTranscript = await stopRecording();

      // If transcription failed or empty — don't submit, show error via hook state
      if (!finalTranscript || finalTranscript.trim() === "") {
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

      saveEvaluation(currentQuestion.question_id, {
        ...evaluation,
        emotionTimeline
      });

      setCurrentResult(evaluation);
    } catch (e) {
      console.error("Submit error:", e);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    stopRecording,
    questions,
    currentQuestionIndex,
    saveEvaluation,
    emotionTimeline,
    session
  ]);

  // Retry — just clear the error, user can press mic again
  const handleRetry = useCallback(() => {
    clearError();
  }, [clearError]);

  const handleNext = useCallback(() => {
    setCurrentResult(null);
    resetEmotionTimeline();

    if (currentQuestionIndex >= questions.length - 1) {
      router.push(`/report?sessionId=${session.sessionId}`);
      return;
    }

    nextQuestion();
  }, [
    currentQuestionIndex,
    questions.length,
    resetEmotionTimeline,
    nextQuestion,
    router,
    session.sessionId
  ]);

  if (loadingQuestion) {
    return (
      <ProtectedRoute>
        <PrepareLoader
          totalQuestions={session.totalQuestions}
          domain={session.domain}
          difficulty={session.difficulty}
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <Navbar />

        <main
          className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col"
          style={{ height: "calc(100vh - 64px)" }}
        >
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4 flex-shrink-0">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${(currentQuestionIndex / session.totalQuestions) * 100}%`
              }}
            />
          </div>

          {/* Main Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">

            {/* Left — Question Card */}
            <div className="h-full overflow-hidden">
              <QuestionCard
                question={questions[currentQuestionIndex]}
                current={currentQuestionIndex + 1}
                total={questions.length}
                domain={session.domain}
                difficulty={session.difficulty}
              />
            </div>

            {/* Right — Webcam + Answer */}
            <div className="flex flex-col gap-4 h-full overflow-hidden">
              <div className="flex-shrink-0">
                <WebcamFeed
                  currentEmotion={currentEmotion}
                  webcamRef={webcamRef}
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <AnswerInput
                  isRecording={isRecording}
                  transcript={transcript}
                  transcribeError={transcribeError}
                  onStartRecord={startRecording}
                  onStopAndSubmit={handleStopAndSubmit}
                  onRetry={handleRetry}
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