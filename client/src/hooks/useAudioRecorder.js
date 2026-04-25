"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { speechApi } from '@/utils/api';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Request mic permission and get stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setTranscript("");

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      // Collect audio chunks
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(1000); // collect chunk every 1 second
      setIsRecording(true);

    } catch (err) {
      console.error("Mic access error:", err);
      alert("Microphone access denied. Please allow mic access and try again.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve("");
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          // Combine all chunks into one blob
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          // Send to backend for transcription
          const result = await speechApi.transcribe(audioBlob);
          const text = result.transcript || "";
          setTranscript(text);
          resolve(text);
        } catch (err) {
          console.error("Transcription error:", err);
          resolve("");
        } finally {
          // Stop all tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
          }
          setIsRecording(false);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
  };
}