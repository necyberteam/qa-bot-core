import { useEffect } from 'react';

/**
 * Custom hook to update the chatbot header based on login state
 * Adds/removes the 'bot-logged-in' CSS class to control visibility of login button vs user icon
 *
 * @param isLoggedIn - Whether the user is logged in
 * @param containerRef - Reference to the chatbot container element
 */
const useUpdateHeader = (
  isLoggedIn: boolean,
  containerRef: React.RefObject<HTMLDivElement>
): void => {
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    if (isLoggedIn) {
      containerRef.current.classList.add('bot-logged-in');
    } else {
      containerRef.current.classList.remove('bot-logged-in');
    }
  }, [isLoggedIn, containerRef]);
};

export default useUpdateHeader;
