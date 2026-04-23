"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { mockApi } from '@/utils/api';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const transcriptRef = useRef("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Keep transcriptRef in sync with transcript state
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    // Clear any existing interval just in case
    if (timerRef.current) clearInterval(timerRef.current);

    setIsRecording(true);
    setTranscript("");
    chunksRef.current = [];
    
    // Simulate speech-to-text chunking
    timerRef.current = setInterval(async () => {
       try {
         const newText = await mockApi.speech.transcribe("chunk");
         setTranscript(prev => prev + newText);
       } catch (e) {
         console.error("Transcription error", e);
       }
    }, 3000); 
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return transcriptRef.current;
  }, []);

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording
  };
}
