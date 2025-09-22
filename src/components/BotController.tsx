import React, { useImperativeHandle, useEffect, useRef, forwardRef } from 'react';
import { useMessages, useChatWindow } from "react-chatbotify";
import type { BotControllerHandle } from '../config';

interface BotControllerProps {
  embedded: boolean;
  currentOpen?: boolean;
}

/**
 * BotController Component
 *
 * Handles the integration between react-chatbotify hooks and the imperative API.
 * This component must be rendered inside ChatBotProvider to access the hooks.
 */
const BotController = forwardRef<BotControllerHandle, BotControllerProps>(({
  embedded,
  currentOpen
}, ref) => {
  // Get the chatbot hooks (must be inside ChatBotProvider)
  const messages = useMessages();
  const chatWindow = useChatWindow();

  const lastOpenRef = useRef<boolean | null>(null); // Start with null to detect initial state
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

    // Listen for user interactions with the chat window
    window.addEventListener('rcb-toggle-chat-window', markAsUserInteraction);
    return () => window.removeEventListener('rcb-toggle-chat-window', markAsUserInteraction);
  });


  useImperativeHandle(ref, () => ({
    // An imperative method to add a message to bot
    addMessage: (message: string) => {
      if (messages && messages.injectMessage) {
        messages.injectMessage(message);
      }
    },
    openChat: () => {
      if (!embedded && chatWindow && chatWindow.toggleChatWindow) {
        chatWindow.toggleChatWindow(true);
      }
    },
    closeChat: () => {
      if (!embedded && chatWindow && chatWindow.toggleChatWindow) {
        chatWindow.toggleChatWindow(false);
      }
    },
    toggleChat: () => {
      if (!embedded && chatWindow && chatWindow.toggleChatWindow) {
        chatWindow.toggleChatWindow();
      }
    },
    setBotEnabled: (enabled: boolean) => {
      // This could be extended to handle bot state if needed
      console.log('Bot enabled state:', enabled);
    }
  }), [messages, chatWindow, embedded]);
  return null;
});

BotController.displayName = 'BotController';

export default BotController;