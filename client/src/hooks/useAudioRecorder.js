"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { speechApi } from '@/utils/api';

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
    
    // Start recording audio chunks and transcribe
    timerRef.current = setInterval(async () => {
       try {
         // Get audio chunks from mediaRecorder if available
         if (mediaRecorderRef.current && chunksRef.current.length > 0) {
           // Create a blob from chunks
           const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
           const result = await speechApi.transcribe(audioBlob);
           if (result.text) {
             setTranscript(prev => prev + " " + result.text);
           }
         }
       } catch (e) {
         console.error("Transcription error:", e);
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
    stopRecording,
    mediaRecorderRef,
    chunksRef
  };
}
