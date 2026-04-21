'use client';
import { useRef, useCallback, useEffect } from 'react';
import { faceAPI } from '@/utils/api';

export function useWebcamEmotion({ webcamRef, onEmotionUpdate, intervalMs = 2000 }) {
  const intervalRef = useRef(null);

  const captureAndAnalyze = useCallback(async () => {
    if (!webcamRef?.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;

    try {
      const res  = await fetch(screenshot);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('frame', blob, 'frame.jpg');
      const { data } = await faceAPI.analyze(formData);
      if (data.emotion && onEmotionUpdate) {
        onEmotionUpdate(data);
      }
    } catch (err) {
      // Silently fail — face analysis is non-blocking
    }
  }, [webcamRef, onEmotionUpdate]);

  const startAnalysis = useCallback(() => {
    intervalRef.current = setInterval(captureAndAnalyze, intervalMs);
  }, [captureAndAnalyze, intervalMs]);

  const stopAnalysis = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { startAnalysis, stopAnalysis };
}