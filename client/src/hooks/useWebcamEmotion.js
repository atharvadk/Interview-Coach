"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

const EMOTION_MAP = {
  happy:     { emoji: "😊", label: "Happy" },
  neutral:   { emoji: "😐", label: "Neutral" },
  surprised: { emoji: "😮", label: "Surprised" },
  fearful:   { emoji: "😰", label: "Nervous" },
  angry:     { emoji: "😠", label: "Stressed" },
  disgusted: { emoji: "😟", label: "Uncomfortable" },
  sad:       { emoji: "😔", label: "Low Confidence" },
};

// Limit timeline size to prevent memory leak
const MAX_TIMELINE_SIZE = 100;

export function useWebcamEmotion(isRecording, webcamRef) {
  const [currentEmotion, setCurrentEmotion] = useState({ 
    emotion: "Neutral", 
    emoji: "😐", 
    confidence: 100 
  });
  const [emotionTimeline, setEmotionTimeline] = useState([]);
  const intervalRef = useRef(null);
  const isProcessingRef = useRef(false);

  const captureAndAnalyze = useCallback(async () => {
    // Prevent concurrent processing
    if (isProcessingRef.current || !webcamRef?.current) return;
    
    try {
      isProcessingRef.current = true;
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        isProcessingRef.current = false;
        return;
      }

      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') 
        : null;

      const response = await fetch('http://localhost:5000/api/face/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'x-auth-token': token })
        },
        body: JSON.stringify({ image: imageSrc })
      });

      if (!response.ok) {
        isProcessingRef.current = false;
        return;
      }

      const data = await response.json();
      const dominant = data.dominant_emotion || "neutral";
      const mapped = EMOTION_MAP[dominant.toLowerCase()] || { emoji: "😐", label: "Neutral" };
      const score = data.emotion_scores?.[dominant] || 0;

      setCurrentEmotion({
        emotion: mapped.label,
        emoji: mapped.emoji,
        confidence: Math.round(score * 100)
      });

      setEmotionTimeline(prev => {
        const newTimeline = [...prev, mapped.emoji];
        // Limit array size to prevent memory leak
        if (newTimeline.length > MAX_TIMELINE_SIZE) {
          return newTimeline.slice(-MAX_TIMELINE_SIZE);
        }
        return newTimeline;
      });

    } catch (err) {
      console.warn("Face analysis error:", err.message);
    } finally {
      isProcessingRef.current = false;
    }
  }, [webcamRef]);

  useEffect(() => {
    if (isRecording) {
      // Clear any existing interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(captureAndAnalyze, 3000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isProcessingRef.current = false;
    };
  }, [isRecording, captureAndAnalyze]);

  const resetEmotionTimeline = useCallback(() => {
    setEmotionTimeline([]);
  }, []);

  return {
    currentEmotion,
    emotionTimeline,
    resetEmotionTimeline
  };
}