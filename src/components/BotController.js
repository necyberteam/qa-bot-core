import React, { useImperativeHandle, useEffect, useRef } from 'react';
import { useMessages, useChatWindow } from "react-chatbotify";

/**
 * BotController Component
 *
 * Handles the integration between react-chatbotify hooks and the imperative API.
 * This component must be rendered inside ChatBotProvider to access the hooks.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.embedded - Whether the bot is embedded (affects chat window controls)
 * @param {boolean} props.isBotLoggedIn - Current login state
 * @param {boolean} props.currentOpen - Current open state
 * @param {React.Ref} ref - The forwarded ref for the imperative API
 */
const BotController = React.forwardRef(({
  embedded,
  isBotLoggedIn,
  currentOpen
}, ref) => {
  // Get the chatbot hooks (must be inside ChatBotProvider)
  const messages = useMessages();
  const chatWindow = useChatWindow();

  const lastOpenRef = useRef(null); // Start with null to detect initial state
  const fromEventRef = useRef(false);

  // Sync open state with chat window when it changes (but not when change came from event)
  useEffect(() => {
    if (!embedded && chatWindow && chatWindow.toggleChatWindow) {
      // Handle initial state and subsequent changes
      if (lastOpenRef.current !== currentOpen && !fromEventRef.current) {

        // Use a small delay to ensure chatWindow is fully initialized
        setTimeout(() => {
          if (chatWindow && chatWindow.toggleChatWindow) {
            chatWindow.toggleChatWindow(currentOpen);
          }
        }, 0);
        lastOpenRef.current = currentOpen;
      }
      fromEventRef.current = false;
    }
  }, [currentOpen, embedded, chatWindow]);

  // Expose a method to mark that the next state change came from user interaction
  useEffect(() => {
    const markAsUserInteraction = () => {
      fromEventRef.current = true;
    };

    // Store the function on the ref so QABot can call it
    if (ref) {
      if (!ref.current) {
        ref.current = {};
      }
      ref.current._markAsUserInteraction = markAsUserInteraction;
    }
  });

  // An imperative method to add a message to bot
  // wrapping react-chatbotify `insertMessage`
  useImperativeHandle(ref, () => ({
    // Add a message to the chat
    addMessage: (message) => {
      if (messages && messages.injectMessage) {
        messages.injectMessage(message);
      }
    }
  }), [messages]);
  return null;
});

BotController.displayName = 'BotController';

export default BotController;