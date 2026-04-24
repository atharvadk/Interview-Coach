"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { faceApi } from '@/utils/api';

export function useWebcamEmotion(isRecording, webcamRef) {
  const [currentEmotion, setCurrentEmotion] = useState({ emotion: 'Neutral', emoji: '😐', confidence: 100 });
  const [emotionTimeline, setEmotionTimeline] = useState([]);
  const canvasRef = useRef(null);

  const captureFrame = useCallback(async () => {
    if (webcamRef && webcamRef.current) {
      const video = webcamRef.current.video;
      if (video && video.readyState === 4) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        // Convert to base64
        return canvas.toDataURL('image/jpeg', 0.5);
      }
    }
    return null;
  }, [webcamRef]);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(async () => {
        try {
          const imageData = await captureFrame();
          if (imageData) {
            const emotion = await faceApi.analyze(imageData);
            setCurrentEmotion(emotion);
            setEmotionTimeline(prev => [...prev, emotion.emoji || emotion.emotion]);
          }
        } catch (e) {
          console.error("Emotion analysis error:", e);
        }
      }, 2000);
    } else {
      if (currentEmotion.emotion !== 'Neutral') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentEmotion({ emotion: 'Neutral', emoji: '😐', confidence: 100 });
      }
    }
    return () => clearInterval(interval);
  }, [isRecording, currentEmotion.emotion, captureFrame]);

  const resetEmotionTimeline = useCallback(() => {
    setEmotionTimeline([]);
  }, []);

  return {
    currentEmotion,
    emotionTimeline,
    resetEmotionTimeline
  };
}
