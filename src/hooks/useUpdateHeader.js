import { useEffect } from 'react';

/**
 * Custom hook to update the chatbot header
 * This avoids relying on the beta useSettings hook from react-chatbotify
 * When this hook is stable, we can refactor to use it
 *
 * @param {boolean} enabled - Whether the bot is enabled
 * @param {React.RefObject} containerRef - Reference to the chatbot container
 */
const useUpdateHeader = (enabled, containerRef) => {
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    if (enabled) {
      containerRef.current.classList.add('bot-enabled');
    } else {
      containerRef.current.classList.remove('bot-enabled');
    }
  }, [enabled, containerRef]);
};

export default useUpdateHeader;