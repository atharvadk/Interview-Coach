'use client';
import { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useWebcamEmotion } from '@/hooks/useWebcamEmotion';

export default function WebcamFeed({ onEmotionUpdate, isActive = false }) {
  const webcamRef = useRef(null);

  const { startAnalysis, stopAnalysis } = useWebcamEmotion({
    webcamRef,
    onEmotionUpdate,
    intervalMs: 2000,
  });

  useEffect(() => {
    if (isActive) startAnalysis();
    else stopAnalysis();
    return () => stopAnalysis();
  }, [isActive]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Webcam box */}
      <div style={{
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.07)',
        background: '#0D0D14',
        aspectRatio: '4/3',
      }}>
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: 'user' }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          mirrored
        />

        {/* Live indicator */}
        {isActive && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: 6, padding: '4px 10px',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--crimson)',
              animation: 'recordPulse 1.5s ease infinite',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11, color: '#fff',
              letterSpacing: '0.05em',
            }}>
              LIVE
            </span>
          </div>
        )}
      </div>

    </div>
  );
}