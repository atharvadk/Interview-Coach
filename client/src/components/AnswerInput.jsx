"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, AlertCircle, RefreshCw } from "lucide-react";

export function AnswerInput({ 
  isRecording, 
  transcript, 
  transcribeError,
  onStartRecord, 
  onStopAndSubmit,
  onRetry,
  isSubmitting 
}) {

  // Map error codes to friendly messages
  const errorMessages = {
    no_audio:     "No audio was captured. Check your microphone and try again.",
    no_speech:    "No speech was detected. Please speak clearly and try again.",
    server_error: "Could not process audio. Please try again."
  };

  return (
    <div className="glass-card rounded-2xl flex flex-col h-full relative overflow-hidden">

      {/* Transcript / Error / Loading Box */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-900/30">

        {/* Error State */}
        <AnimatePresence>
          {transcribeError && !isSubmitting && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-4 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <p className="text-red-400 font-medium mb-1">
                  {errorMessages[transcribeError] || "Something went wrong."}
                </p>
                <p className="text-slate-500 text-sm">
                  Click the mic button to try again.
                </p>
              </div>
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submitting State */}
        {isSubmitting && (
          <div className="h-full flex items-center justify-center text-slate-400 text-center px-4">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p>Evaluating your answer...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!transcript && !isSubmitting && !transcribeError && (
          <div className="h-full flex items-center justify-center text-slate-500 text-center px-4">
            <p>Your transcribed answer will appear here after you stop recording...</p>
          </div>
        )}

        {/* Transcript */}
        {transcript && !isSubmitting && !transcribeError && (
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
            {transcript}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-between items-center gap-4">

        <div className="flex-1">
          {!isRecording && !transcript && !isSubmitting && !transcribeError && (
            <p className="text-sm text-slate-400 pl-2">Click mic to start answering...</p>
          )}
          {isRecording && (
            <div className="flex items-center gap-2 pl-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-400 tracking-wider">
                RECORDING — Click stop when done
              </span>
            </div>
          )}
          {transcript && !isSubmitting && !transcribeError && (
            <p className="text-sm text-emerald-400 pl-2">
              ✓ Answer captured — click mic to re-record
            </p>
          )}
        </div>

        <div className="flex gap-3 shrink-0">
          {!isRecording ? (
            <button
              onClick={onStartRecord}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50"
            >
              <Mic className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onStopAndSubmit}
              className="bg-red-500 hover:bg-red-600 text-white px-6 h-12 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              <Square className="w-4 h-4 fill-current" />
              Stop & Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}