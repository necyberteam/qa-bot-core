import { useEffect } from 'react';

/**
 * Hook to make the send button focusable and keyboard accessible
 */
const useFocusableSendButton = (): void => {
  useEffect(() => {
    const makeSendButtonAccessible = () => {
      const chatWindow = document.querySelector('.rcb-chat-window');
      if (!chatWindow) return;
      
      const sendButton = chatWindow.querySelector('.rcb-send-button');
      if (!sendButton) return;
      
      // Make send button focusable
      if (!sendButton.hasAttribute('tabindex')) {
        sendButton.setAttribute('tabindex', '0');
      }
      
      // Add keyboard support if not already added
      if (!sendButton.hasAttribute('data-keyboard-enabled')) {
        sendButton.setAttribute('data-keyboard-enabled', 'true');
        
        sendButton.addEventListener('keydown', (event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            
            // Call the React onMouseDown handler directly
            const reactPropsKey = sendButton && Object.keys(sendButton as any).find(key => key.startsWith('__reactProps'));
            if (reactPropsKey) {
              const reactProps = (sendButton as any)[reactPropsKey];
              const onMouseDown = reactProps?.onMouseDown;
              if (onMouseDown && typeof onMouseDown === 'function') {
                onMouseDown(event);
                return;
              }
            }
            
            // Fallback to dispatching a mousedown event
            const mouseDownEvent = new MouseEvent('mousedown', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            sendButton.dispatchEvent(mouseDownEvent);
          }
        });
      }
    };

    // Check periodically in case the send button is recreated
    const interval = setInterval(makeSendButtonAccessible, 1000);
    
    // Run immediately
    makeSendButtonAccessible();
    
    return () => clearInterval(interval);
  }, []);
};

export default useFocusableSendButton;