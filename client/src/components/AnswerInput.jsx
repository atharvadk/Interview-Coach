import { motion } from "framer-motion";
import { Mic, Square, Send, Loader2 } from "lucide-react";

export function AnswerInput({ 
  isRecording, 
  transcript, 
  onStartRecord, 
  onStopRecord, 
  onSubmit, 
  isSubmitting 
}) {
  return (
    <div className="glass-card rounded-2xl flex flex-col h-full relative overflow-hidden">
      {/* Transcript Box */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-900/30">
        {!transcript ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-center px-4">
            <p>Your transcribed answer will appear here as you speak...</p>
          </div>
        ) : (
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
            {transcript}
            {isRecording && <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse"></span>}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-between items-center gap-4">
        
        <div className="flex-1">
          {(!transcript && !isRecording) ? (
            <p className="text-sm text-slate-400 pl-2">Click mic to start answering...</p>
          ) : (
            isRecording && (
              <div className="flex items-center gap-2 pl-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-sm font-medium text-red-400 tracking-wider">RECORDING</span>
              </div>
            )
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
              onClick={onStopRecord}
              className="bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            onClick={onSubmit}
            disabled={!transcript || isSubmitting || isRecording}
            className={`btn-primary px-6 h-12 rounded-xl flex items-center gap-2 ${(!transcript || isSubmitting || isRecording) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
               <>Submit Answer <Send className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
