import { v4 as uuidv4 } from 'uuid';

const SESSION_MESSAGES_KEY = 'qa_bot_session_messages';

/**
 * Session message tracking structure
 */
export interface SessionMessageData {
  messageIds: string[];
  startedAt: string;
  preview: string;
}

export interface SessionMessagesStore {
  [sessionId: string]: SessionMessageData;
}

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

/**
 * Get the session messages store from localStorage
 */
export const getSessionMessagesStore = (): SessionMessagesStore => {
  try {
    const stored = localStorage.getItem(SESSION_MESSAGES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    console.error('[session-utils] Failed to parse session messages store');
    return {};
  }
};

/**
 * Save the session messages store to localStorage
 */
const saveSessionMessagesStore = (store: SessionMessagesStore): void => {
  localStorage.setItem(SESSION_MESSAGES_KEY, JSON.stringify(store));
};

/**
 * Add a message ID to a session's tracking list
 * Called when RcbPostInjectMessageEvent fires
 */
export const addMessageToSession = (
  sessionId: string,
  messageId: string,
  messageContent?: string,
  sender?: string
): void => {
  const store = getSessionMessagesStore();

  // Initialize session if it doesn't exist
  if (!store[sessionId]) {
    store[sessionId] = {
      messageIds: [],
      startedAt: new Date().toISOString(),
      preview: ''
    };
    console.log(`%c[Session]%c NEW session initialized in store`,
      'background: #1a5b6e; color: white; padding: 2px 6px; border-radius: 3px;', '',
      sessionId.slice(-12));
  }

  // Add message ID if not already present
  if (!store[sessionId].messageIds.includes(messageId)) {
    store[sessionId].messageIds.push(messageId);

    // Set preview from first user message
    if (!store[sessionId].preview && sender?.toLowerCase() === 'user' && messageContent) {
      const preview = typeof messageContent === 'string'
        ? messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : '')
        : '[Message]';
      store[sessionId].preview = preview;
    }

    saveSessionMessagesStore(store);
    console.log(`%c[Session]%c Message tracked`,
      'background: #1a5b6e; color: white; padding: 2px 6px; border-radius: 3px;', '',
      { sessionId: sessionId.slice(-12), messageId: messageId.slice(-8), total: store[sessionId].messageIds.length });
  }
};

/**
 * Get all sessions with their metadata (for history display)
 */
export const getAllSessions = (): Array<{ sessionId: string } & SessionMessageData> => {
  const store = getSessionMessagesStore();
  return Object.entries(store)
    .map(([sessionId, data]) => ({ sessionId, ...data }))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
};

/**
 * Get message IDs for a specific session
 */
export const getSessionMessageIds = (sessionId: string): string[] => {
  const store = getSessionMessagesStore();
  return store[sessionId]?.messageIds || [];
};