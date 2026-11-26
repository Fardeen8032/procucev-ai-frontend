import { useCallback, useRef, useState } from 'react';
import { useSocket } from '../hooks/useSocket.js';
import { useAudioCapture } from '../hooks/useAudioCapture.js';

export default function RecorderPage() {
  const socketRef = useSocket();
  const { start, stop } = useAudioCapture();
  const [isRecording, setIsRecording] = useState(false);
  const [partialText, setPartialText] = useState('');
  const [finalSegments, setFinalSegments] = useState([]);
  const [error, setError] = useState(null);
  const [savedRecord, setSavedRecord] = useState(null);
  const listenersAttached = useRef(false);

  const attachListeners = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || listenersAttached.current) return;
    listenersAttached.current = true;

    socket.on('transcript:partial', ({ text }) => setPartialText(text));
    socket.on('transcript:final', ({ text }) => {
      setFinalSegments((prev) => [...prev, text]);
      setPartialText('');
    });
    socket.on('session:error', ({ message }) => setError(message));
    socket.on('session:saved', (record) => setSavedRecord(record));
  }, [socketRef]);

  const handleStart = async () => {
    setError(null);
    setSavedRecord(null);
    setFinalSegments([]);
    setPartialText('');
    attachListeners();
    const socket = socketRef.current;
    socket.emit('session:start');

    try {
      const response = await start((chunk) => {
        socket.emit('audio:chunk', chunk);
      });
      setIsRecording(true);
    } catch (err) {
      setError(err.message || 'Could not access microphone.');
    }
  };

  const handleStop = () => {
    stop();
    socketRef.current?.emit('session:stop');
    setIsRecording(false);
  };

  return (
    <div className="recorder-page">
      <p className="hint">
        Speak naturally — mixed-language sentences (e.g. Hindi &amp; English) are supported.
      </p>

      <div className="controls">
        {!isRecording ? (
          <button className="btn btn-primary" onClick={handleStart}>
            Start Recording
          </button>
        ) : (
          <button className="btn btn-danger" onClick={handleStop}>
            Stop Recording
          </button>
        )}
        {isRecording && <span className="recording-dot" aria-label="recording" />}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="transcript-panel">
        <h2>Live Transcript</h2>
        <div className="transcript-box">
          {finalSegments.map((segment, idx) => (
            <p key={idx} className="segment-final">
              {segment}
            </p>
          ))}
          {partialText && <p className="segment-partial">{partialText}</p>}
          {!finalSegments.length && !partialText && (
            <p className="placeholder">Transcript will appear here in real time…</p>
          )}
        </div>
      </section>

      {savedRecord && (
        <div className="alert alert-success">
          Saved to history (session {savedRecord.sessionId.slice(0, 8)}…).
        </div>
      )}
    </div>
  );
}
