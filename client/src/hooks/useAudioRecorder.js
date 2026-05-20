"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { speechApi } from '@/utils/api';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [transcribeError, setTranscribeError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
      chunksRef.current = [];
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setTranscribeError(null);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setTranscript("");

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(1000);
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
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

          // Check if any audio was actually captured
          if (audioBlob.size < 1000) {
            console.warn("Audio blob too small — likely silence");
            if (isMountedRef.current) {
              setTranscribeError("no_audio");
              setTranscript("");
            }
            resolve("");
            return;
          }

          const result = await speechApi.transcribe(audioBlob);
          const text = result.transcript || "";

          if (isMountedRef.current) {
            if (!text || text.trim() === "") {
              setTranscribeError("no_speech");
            } else {
              setTranscribeError(null);
            }
            setTranscript(text);
          }
          resolve(text);

        } catch (err) {
          console.error("Transcription error:", err);
          // Don't crash — just return empty and set error state
          if (isMountedRef.current) {
            setTranscribeError("server_error");
            setTranscript("");
          }
          resolve("");
        } finally {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
          }
          if (isMountedRef.current) {
            setIsRecording(false);
          }
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  const clearError = useCallback(() => {
    setTranscribeError(null);
  }, []);

  return {
    isRecording,
    transcript,
    transcribeError,
    clearError,
    startRecording,
    stopRecording,
  };
}