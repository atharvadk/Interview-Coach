"use client";

import { useEffect, useState, useCallback } from "react";
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
  const router = useRouter();
  const { session, questions, setQuestions, currentQuestionIndex, nextQuestion, saveEvaluation } = useInterview();
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  
  // Custom hooks
  const { isRecording, transcript, startRecording, stopRecording } = useAudioRecorder();
  const { currentEmotion, emotionTimeline, resetEmotionTimeline } = useWebcamEmotion(isRecording);

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);

  useEffect(() => {
    // If user accesses /interview without establishing session
    if (!session.sessionId) {
      router.push("/setup");
      return;
    }

    // Load questions if not loaded
    if (questions.length === 0) {
      const load = async () => {
        try {
          const fetched = await questionsApi.generate(session.domain, session.difficulty, session.totalQuestions);
          setQuestions(fetched);
        } finally {
          setLoadingQuestion(false);
        }
      };
      load();
    } else if (loadingQuestion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingQuestion(false);
    }
  }, [session, router, questions, setQuestions, loadingQuestion]);

  const handleSubmitAnswer = useCallback(async () => {
    const finalTranscript = stopRecording();
    setIsSubmitting(true);
    try {
      const evaluation = await evaluateApi.evaluate(finalTranscript, questions[currentQuestionIndex]);
      // Attach emotion timeline history to the evaluation record
      saveEvaluation(questions[currentQuestionIndex].id, { ...evaluation, emotionTimeline });
      setCurrentResult(evaluation);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }, [stopRecording, questions, currentQuestionIndex, saveEvaluation, emotionTimeline]);

  const handleNext = useCallback(() => {
    setCurrentResult(null);
    resetEmotionTimeline();
    const hasNext = nextQuestion();
    if (!hasNext) {
      router.push(`/report?sessionId=${session.sessionId}`);
    }
  }, [resetEmotionTimeline, nextQuestion, router, session.sessionId]);

  if (!session.sessionId || loadingQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const question = questions[currentQuestionIndex];

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
                   question={question}
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
                 <WebcamFeed currentEmotion={currentEmotion} />
               </div>
               
               <div className="flex-1 min-h-0">
                 <AnswerInput 
                   isRecording={isRecording}
                   transcript={transcript}
                   onStartRecord={startRecording}
                   onStopRecord={stopRecording}
                   onSubmit={handleSubmitAnswer}
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
