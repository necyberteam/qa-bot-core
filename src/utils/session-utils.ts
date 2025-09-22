import { v4 as uuidv4 } from 'uuid';

export const generateSessionId = (): string => {
  return `qa_bot_session_${uuidv4()}`;
};

export const getOrCreateSessionId = (): string => {
  const existingKey = Object.keys(localStorage).find(key => key.startsWith('qa_bot_session_'));
  if (existingKey) {
    const existingId = localStorage.getItem(existingKey);
    return existingId || generateSessionId();
  }

  const newSessionId = generateSessionId();
  localStorage.setItem(newSessionId, newSessionId);
  return newSessionId;
};