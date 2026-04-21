'use client';
import { useRef, useState, useCallback } from 'react';
import { speechAPI } from '@/utils/api';

export function useAudioRecorder({ onChunkTranscribed }) {
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const intervalRef      = useRef(null);
  const timerRef         = useRef(null);

  const [isRecording, setIsRecording]       = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const sendChunk = useCallback(async () => {
    if (chunksRef.current.length === 0) return;
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    chunksRef.current = [];
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'chunk.webm');
      const { data } = await speechAPI.transcribe(formData);
      if (data.transcript && onChunkTranscribed) {
        onChunkTranscribed(data.transcript);
      }
    } catch (err) {
      console.error('Transcription error:', err);
    }
  }, [onChunkTranscribed]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.start(1000);
      setIsRecording(true);
      setElapsedSeconds(0);

      // Increment timer every second
      timerRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);

      // Send chunk to backend every 30 seconds
      intervalRef.current = setInterval(sendChunk, 30000);

    } catch (err) {
      console.error('Microphone access error:', err);
    }
  }, [sendChunk]);

  const stopRecording = useCallback(async () => {
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
    }

    setIsRecording(false);
    await sendChunk(); // send any remaining audio
  }, [sendChunk]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return {
    isRecording,
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    startRecording,
    stopRecording,
  };
}