import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 90000
});

export const getQuestion    = (payload)           => api.post("/questions/generate", payload);
export const transcribeAudio = (blob, sessionId)  => {
  const form = new FormData();
  form.append("audio", blob, "answer.webm");
  form.append("session_id", sessionId);
  return api.post("/speech/transcribe", form);
};
export const evaluateAnswer  = (payload)          => api.post("/evaluate", payload);
export const analyzeFrame    = (blob, sessionId)  => {
  const form = new FormData();
  form.append("frame", blob, "frame.jpg");
  form.append("session_id", sessionId);
  return api.post("/face/analyze", form);
};
export const generateReport  = (sessionId)        => api.get(`/report/${sessionId}`);

export default api;