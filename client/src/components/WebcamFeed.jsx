"use client";

import Webcam from "react-webcam";
import { EmotionBadge } from "./EmotionBadge";

export function WebcamFeed({ currentEmotion, webcamRef }) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/50 aspect-video shadow-[0_0_40px_rgba(59,130,246,0.1)]">
      <Webcam
        ref={webcamRef}
        className="w-full h-full object-cover"
        mirrored={true}
        audio={false}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.6}
      />
      <div className="absolute top-4 right-4">
        <EmotionBadge emotion={currentEmotion} />
      </div>
    </div>
  );
}