import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';

const SESSION_MESSAGES_KEY = 'qa_bot_session_messages';
const RCB_HISTORY_KEY = 'qa_bot_rcb_history';

// Maximum total messages across all sessions
// Must stay under RCB's maxEntries (100) to ensure messages are still available when restoring
const MAX_TOTAL_MESSAGES = 80;

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


/**
 * Get the session messages store from localStorage
 */
export const getSessionMessagesStore = (): SessionMessagesStore => {
  try {
    const stored = localStorage.getItem(SESSION_MESSAGES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    // Silently fail - corrupted storage shouldn't break the app
    return {};
  }
};

/**
 * Save the session messages store to localStorage, evicting oldest sessions if over message limit
 */
const saveSessionMessagesStore = (store: SessionMessagesStore): void => {
  // Count total messages across all sessions
  const getTotalMessages = () =>
    Object.values(store).reduce((sum, session) => sum + session.messageIds.length, 0);

  // Evict oldest sessions until we're under the message limit
  while (getTotalMessages() > MAX_TOTAL_MESSAGES && Object.keys(store).length > 1) {
    // Find oldest session
    const oldestSessionId = Object.entries(store)
      .sort(([, a], [, b]) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())[0]?.[0];

    if (oldestSessionId) {
      delete store[oldestSessionId];
    } else {
      break;
    }
  }
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
  const isNewSession = !store[sessionId];
  if (isNewSession) {
    store[sessionId] = {
      messageIds: [],
      startedAt: new Date().toISOString(),
      preview: ''
    };
    logger.history('NEW session created', { sessionId: sessionId.slice(-12) });
  }

  // Add message ID if not already present
  const isDuplicate = store[sessionId].messageIds.includes(messageId);
  if (isDuplicate) {
    logger.history('DUPLICATE message skipped', {
      sessionId: sessionId.slice(-12),
      messageId: messageId.slice(-8),
      sender
    });
    return;
  }

  store[sessionId].messageIds.push(messageId);
  logger.history('MESSAGE added', {
    sessionId: sessionId.slice(-12),
    messageId: messageId.slice(-8),
    sender,
    totalInSession: store[sessionId].messageIds.length
  });

  // Set preview from first user message
  if (!store[sessionId].preview && sender?.toLowerCase() === 'user' && messageContent) {
    const preview = typeof messageContent === 'string'
      ? messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : '')
      : '[Message]';
    store[sessionId].preview = preview;
  }

  saveSessionMessagesStore(store);

  // Log localStorage state after save
  const rcbHistory = localStorage.getItem(RCB_HISTORY_KEY);
  const rcbMessageCount = rcbHistory ? JSON.parse(rcbHistory).length : 0;
  logger.history('STORAGE state', {
    ourSessions: Object.keys(store).length,
    ourTotalMessages: Object.values(store).reduce((sum, s) => sum + s.messageIds.length, 0),
    rcbMessages: rcbMessageCount
  });
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