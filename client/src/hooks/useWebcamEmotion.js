"use client";

import { useState, useEffect, useCallback } from 'react';
import { mockApi } from '@/utils/api';

export function useWebcamEmotion(isRecording) {
  const [currentEmotion, setCurrentEmotion] = useState({ emotion: 'Neutral', emoji: '😐', confidence: 100 });
  const [emotionTimeline, setEmotionTimeline] = useState([]);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(async () => {
        try {
          // Normally would extract a frame here and send arraybuffer to mockApi
          const emotion = await mockApi.face.analyze();
          setCurrentEmotion(emotion);
          setEmotionTimeline(prev => [...prev, emotion.emoji]);
        } catch (e) {
          console.error("Emotion analysis mapping issue", e);
        }
      }, 2000);
    } else {
      if (currentEmotion.emotion !== 'Neutral') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentEmotion({ emotion: 'Neutral', emoji: '😐', confidence: 100 });
      }
    }
    return () => clearInterval(interval);
  }, [isRecording, currentEmotion.emotion]);

  const resetEmotionTimeline = useCallback(() => {
    setEmotionTimeline([]);
  }, []);

  return {
    currentEmotion,
    emotionTimeline,
    resetEmotionTimeline
  };
}
