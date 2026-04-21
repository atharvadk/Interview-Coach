'use client';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

export default function AnswerInput({ onChunkTranscribed, transcript, onSubmit, disabled }) {
  const { isRecording, formattedTime, startRecording, stopRecording } =
    useAudioRecorder({ onChunkTranscribed });

  const handleRecordToggle = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Transcript box */}
      <div>
        <p style={{
          fontSize: 11, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.05em', marginBottom: 8,
        }}>
          TRANSCRIPT
        </p>
        <div style={{
          minHeight: 100, maxHeight: 160,
          overflowY: 'auto',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: 8, padding: '12px 14px',
          fontSize: 14, lineHeight: 1.6,
          color: transcript ? 'var(--text-primary)' : 'var(--text-muted)',
        }}>
          {transcript || 'Your answer will appear here as you speak...'}
        </div>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Record button */}
        <button
          onClick={handleRecordToggle}
          disabled={disabled}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
            background: isRecording ? 'var(--crimson)' : 'rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, transition: 'all 0.2s',
            ...(isRecording ? { animation: 'recordPulse 1.5s ease infinite' } : {}),
          }}
        >
          {isRecording ? '⏹' : '🎙'}
        </button>

        {/* Timer */}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 14, color: isRecording ? 'var(--crimson)' : 'var(--text-muted)',
        }}>
          {isRecording ? `⏱ ${formattedTime}` : '⏱ 00:00'}
        </span>

        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {isRecording ? 'Recording... click to stop' : 'Click mic to start recording'}
        </span>

        {/* Submit button */}
        <button
          onClick={onSubmit}
          disabled={disabled || !transcript || isRecording}
          className="btn-primary"
          style={{ marginLeft: 'auto', padding: '10px 24px', fontSize: 14 }}
        >
          Submit Answer →
        </button>

      </div>

    </div>
  );
}