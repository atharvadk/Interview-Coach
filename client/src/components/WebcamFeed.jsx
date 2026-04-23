"use client";

import Webcam from "react-webcam";
import { EmotionBadge } from "./EmotionBadge";

export function WebcamFeed({ currentEmotion }) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/50 aspect-video shadow-[0_0_40px_rgba(59,130,246,0.1)]">
      <Webcam
        className="w-full h-full object-cover"
        mirrored={true}
        audio={false}
      />
      <div className="absolute top-4 right-4">
        <EmotionBadge emotion={currentEmotion} />
      </div>
      
      {/* Scanning effect line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div className="w-full h-full border-2 border-blue-500/10 rounded-2xl"></div>
        <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/50 blur-[2px] shadow-[0_0_10px_#3b82f6] animate-[scan_3s_ease-in-out_infinite]" 
             style={{ animation: 'scan 4s linear infinite alternate' }}></div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
