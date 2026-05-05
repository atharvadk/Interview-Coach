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
  const {
    session,
    questions,
    setQuestions,
    currentQuestionIndex,
    nextQuestion,
    saveEvaluation
  } = useInterview();

  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const hasLoadedRef = useRef(false); // prevent double load in strict mode

  const { isRecording, transcript, startRecording, stopRecording } = useAudioRecorder();
  const { currentEmotion, emotionTimeline, resetEmotionTimeline } = useWebcamEmotion(
    isRecording,
    webcamRef
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      resetEmotionTimeline();
    };
  }, [stopRecording, resetEmotionTimeline]);

  // Load all questions once on mount
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
          // q is [questionObj] — push just the object
          allQuestions.push(q[0]);
        }
        setQuestions(allQuestions);
      } catch (e) {
        console.error("Failed to load questions:", e);
      } finally {
        setLoadingQuestion(false);
      }
    };

    load();
  }, [session.sessionId]); // only run when sessionId is available

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

      saveEvaluation(currentQuestion.question_id, {
        ...evaluation,
        emotionTimeline
      });

      setCurrentResult(evaluation);
    } catch (e) {
      console.error("Submit error:", e);
      alert("Failed to evaluate answer. Please try again.");
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

  const handleNext = useCallback(() => {
    setCurrentResult(null);
    resetEmotionTimeline();

    // Use questions.length as the source of truth
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

  // Show loader while questions are being fetched
  if (loadingQuestion) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              <p className="text-slate-400">
                Preparing your {session.totalQuestions} questions...
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col pt-8">
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${((currentQuestionIndex) / session.totalQuestions) * 100}%`
              }}
            ></div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
            {/* Left Column */}
            <div className="flex flex-col gap-6 min-h-0">
              <div className="h-64 lg:h-auto lg:flex-1 min-h-0">
                <QuestionCard
                  question={questions[currentQuestionIndex]}
                  current={currentQuestionIndex + 1}
                  total={questions.length}
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