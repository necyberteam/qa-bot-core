import { useEffect } from 'react';

/**
 * Custom hook for keyboard navigation in chatbot options
 * Provides arrow key navigation, Enter/Space selection, and accessibility features
 */
const useKeyboardNavigation = () => {
  useEffect(() => {
    // Dedicated checkbox navigation handler
    const handleCheckboxNavigation = (event, elements) => {
      event.preventDefault();

      let currentIndex = -1;

      // Find currently focused element
      for (let i = 0; i < elements.length; i++) {
        if (elements[i] === document.activeElement || elements[i].contains(document.activeElement)) {
          currentIndex = i;
          break;
        }
      }

      // If no element is focused, start with first one
      if (currentIndex === -1) {
        currentIndex = 0;
      }

      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          newIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1;
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = elements.length - 1;
          break;
        case 'Enter':
        case ' ': {
          // Handle different types of elements
          const currentElement = elements[currentIndex];
          const mouseDownEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          currentElement.dispatchEvent(mouseDownEvent);
          return;
        }
        default:
          // No action needed for other keys
          return;
      }

      // Focus the new element
      elements[newIndex].focus();
      elements[newIndex].setAttribute('tabindex', '0');
      elements[newIndex].classList.add('keyboard-focused');

      // Remove tabindex and focus class from other elements
      elements.forEach((element, index) => {
        if (index !== newIndex) {
          element.setAttribute('tabindex', '-1');
          element.classList.remove('keyboard-focused');
        }
      });
    };

    const handleKeyboardNavigation = (event) => {
      // Only handle arrow keys and Enter/Space
      if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Home', 'End'].includes(event.key)) {
        return;
      }

      // Don't interfere with typing in input fields
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true' ||
        activeElement.classList.contains('rcb-chat-input-textarea')
      )) {
        return;
      }

      const chatWindow = document.querySelector('.rcb-chat-window');
      if (!chatWindow) return;

      // Special handling for checkboxes - but only if they're in the most recent message
      const allMessages = Array.from(chatWindow.querySelectorAll('.rcb-message-container, .rcb-bot-message-container, .rcb-user-message-container'))
        .filter(el => el.offsetParent !== null);

      if (allMessages.length > 0) {
        const lastMessage = allMessages[allMessages.length - 1];
        const checkboxContainer = lastMessage.querySelector('.rcb-checkbox-container');

        if (checkboxContainer && checkboxContainer.offsetParent !== null) {
          const checkboxes = Array.from(checkboxContainer.querySelectorAll('.rcb-checkbox-row-container'));
          const nextButton = checkboxContainer.querySelector('.rcb-checkbox-next-button');

          if (checkboxes.length > 0) {
            // Include next button in navigable elements
            const allElements = [...checkboxes];
            if (nextButton) {
              allElements.push(nextButton);
            }
            handleCheckboxNavigation(event, allElements);
            return;
          }
        }
      }

      // Check if chat window is visible and if there are options available - only in the most recent message

      let options = [];
      if (allMessages.length > 0) {
        const lastMessage = allMessages[allMessages.length - 1];
        const optionsContainers = Array.from(lastMessage.querySelectorAll('.rcb-options-container'))
          .filter(el => el.offsetParent !== null);

        if (optionsContainers.length > 0) {
          const lastContainer = optionsContainers[optionsContainers.length - 1];
          options = Array.from(lastContainer.querySelectorAll('.rcb-options'));
        }
      }

      if (options.length === 0) return;

      const currentIndex = options.findIndex(option => option === document.activeElement);

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight': {
          event.preventDefault();
          let nextIndex;
          if (currentIndex < options.length - 1) {
            nextIndex = currentIndex + 1;
          } else {
            // Wrap to first option
            nextIndex = 0;
          }

          // Make sure the element is focusable
          options[nextIndex].setAttribute('tabindex', '0');
          options.forEach((opt, i) => {
            if (i !== nextIndex) {
              opt.setAttribute('tabindex', '-1');
              opt.classList.remove('keyboard-focused');
            }
          });

          options[nextIndex].classList.add('keyboard-focused');
          options[nextIndex].focus();
          break;
        }

        case 'ArrowUp':
        case 'ArrowLeft': {
          event.preventDefault();
          let prevIndex;
          if (currentIndex > 0) {
            prevIndex = currentIndex - 1;
          } else {
            // Wrap to last option
            prevIndex = options.length - 1;
          }

          // Make sure the element is focusable
          options[prevIndex].setAttribute('tabindex', '0');
          options.forEach((opt, i) => {
            if (i !== prevIndex) {
              opt.setAttribute('tabindex', '-1');
              opt.classList.remove('keyboard-focused');
            }
          });

          options[prevIndex].classList.add('keyboard-focused');
          options[prevIndex].focus();
          break;
        }

        case 'Enter':
        case ' ': // Space key
          event.preventDefault();
          if (document.activeElement && options.includes(document.activeElement)) {
            const activeElement = document.activeElement;

            // Handle checkboxes differently
            if (activeElement.classList.contains('rcb-checkbox-row-container') || activeElement.closest('.rcb-checkbox-row-container')) {
              // For checkboxes, trigger a mousedown event (React ChatBotify standard)
              const mouseDownEvent = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              activeElement.dispatchEvent(mouseDownEvent);

              // Announce checkbox state
              const labelElement = activeElement.querySelector('.rcb-checkbox-label');
              const selectedText = labelElement ? labelElement.textContent : (activeElement.textContent || 'checkbox');
              const checkboxMark = activeElement.querySelector('.rcb-checkbox-mark');
              const isChecked = checkboxMark && checkboxMark.style.backgroundColor ? 'checked' : 'unchecked';
              announceToScreenReader(`${selectedText} ${isChecked}`);
            } else {
              // For regular options, use mousedown
              const mouseDownEvent = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              activeElement.dispatchEvent(mouseDownEvent);

              // Announce selection to screen readers
              const selectedText = activeElement.textContent || activeElement.innerText;
              announceToScreenReader(`Selected: ${selectedText}`);
            }
          }
          break;

        case 'Home':
          event.preventDefault();
          if (options.length > 0) {
            options[0].setAttribute('tabindex', '0');
            options.forEach((opt, i) => {
              if (i !== 0) {
                opt.setAttribute('tabindex', '-1');
                opt.classList.remove('keyboard-focused');
              }
            });
            options[0].classList.add('keyboard-focused');
            options[0].focus();
          }
          break;

        case 'End':
          event.preventDefault();
          if (options.length > 0) {
            const lastIndex = options.length - 1;
            options[lastIndex].setAttribute('tabindex', '0');
            options.forEach((opt, i) => {
              if (i !== lastIndex) {
                opt.setAttribute('tabindex', '-1');
                opt.classList.remove('keyboard-focused');
              }
            });
            options[lastIndex].classList.add('keyboard-focused');
            options[lastIndex].focus();
          }
          break;
        default:
          // No action needed for other keys
          break;
      }
    };


    // Screen reader announcement helper
    const announceToScreenReader = (message) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    };

    // Auto-focus first option when new options appear
    const handleNewOptions = (targetContainer = null) => {
      let chatWindow = targetContainer;

      // If no specific container provided, try to find one
      if (!chatWindow) {
        chatWindow = document.querySelector('.rcb-chat-window');
        if (!chatWindow) {
          chatWindow = document.querySelector('[class*="rcb-chat"]');
        }
        if (!chatWindow) {
          chatWindow = document.querySelector('.qa-bot');
        }
      }

      if (!chatWindow) return;

      // Check if this is an embedded bot to prevent auto-scroll
      const isEmbeddedBot = chatWindow.closest('.embedded-qa-bot') !== null;

      // Get all messages to ensure we only focus options in the most recent message
      const allMessages = Array.from(chatWindow.querySelectorAll('.rcb-message-container, .rcb-bot-message-container, .rcb-user-message-container'))
        .filter(el => el.offsetParent !== null);

      if (allMessages.length === 0) return;

      const lastMessage = allMessages[allMessages.length - 1];

      // Get options containers only from the last message
      const optionsContainers = Array.from(lastMessage.querySelectorAll('.rcb-options-container'))
        .filter(el => el.offsetParent !== null);

      let options = [];
      const optionType = 'regular';

      // Look for regular options first - but only in the last message
      if (optionsContainers.length > 0) {
        const lastContainer = optionsContainers[optionsContainers.length - 1];
        options = Array.from(lastContainer.querySelectorAll('.rcb-options'));
      }

      // If no regular options, look for checkboxes and set them up
      if (options.length === 0) {
        // First try to find checkbox container in last message, but fallback to chatWindow if not found
        let checkboxContainer = lastMessage.querySelector('.rcb-checkbox-container');
        if (!checkboxContainer && chatWindow) {
          checkboxContainer = chatWindow.querySelector('.rcb-checkbox-container');
        }

        if (checkboxContainer && checkboxContainer.offsetParent !== null) {
          const checkboxElements = Array.from(checkboxContainer.querySelectorAll('.rcb-checkbox-row-container'))
            .filter(el => el.offsetParent !== null && el.style.display !== 'none');

          if (checkboxElements.length > 0) {
            // Include next button in navigable elements
            const nextButton = checkboxContainer.querySelector('.rcb-checkbox-next-button');
            const allElements = [...checkboxElements];
            if (nextButton && nextButton.offsetParent !== null) {
              allElements.push(nextButton);
            }

            // Set up checkboxes for keyboard navigation
            allElements.forEach((element, index) => {
              element.setAttribute('tabindex', index === 0 ? '0' : '-1');
              if (index === 0) {
                element.classList.add('keyboard-focused');
              } else {
                element.classList.remove('keyboard-focused');
              }
            });

            // Add keyboard navigation hint for checkboxes if there are multiple elements
            if (checkboxElements.length > 1) {
              // Remove any existing hints first
              const existingHints = checkboxContainer.querySelectorAll('.keyboard-nav-hint');
              existingHints.forEach(hint => hint.remove());

              // Add new hint
              const hintElement = document.createElement('div');
              hintElement.className = 'keyboard-nav-hint';
              hintElement.textContent = 'Use arrow keys ↕ to navigate, Enter to select/deselect, or click any option';
              hintElement.style.cssText = 'font-size: 12px !important; color: #666 !important; margin-bottom: 8px !important; font-style: italic !important; display: block !important;';
              checkboxContainer.insertBefore(hintElement, checkboxContainer.firstChild);
            }

            // Focus first element (skip for embedded bots to prevent auto-scroll)
            setTimeout(() => {
              if (allElements[0] && allElements[0].offsetParent !== null && !isEmbeddedBot) {
                allElements[0].focus();
              }
            }, 150);

            return; // Don't process as regular options
          }
        }
      }

      if (options.length > 0) {
        // Set tabindex and ARIA attributes for keyboard navigation
        options.forEach((option, index) => {
          const tabindex = index === 0 ? '0' : '-1';
          option.setAttribute('tabindex', tabindex);
          option.setAttribute('role', 'option');
          option.setAttribute('aria-posinset', index + 1);
          option.setAttribute('aria-setsize', options.length);
          // Add visual focus class to first option
          if (index === 0) {
            option.classList.add('keyboard-focused');
          } else {
            option.classList.remove('keyboard-focused');
          }
        });

        // Add keyboard navigation hint only for multiple options
        if (options.length > 1 && optionType === 'regular') {
          // Only add hints for regular options, and only if we have a container
          const lastContainer = optionsContainers.length > 0 ? optionsContainers[optionsContainers.length - 1] : null;
          if (lastContainer) {
            // Remove any existing hint first
            const existingHints = lastContainer.querySelectorAll('.keyboard-nav-hint');
            existingHints.forEach(hint => hint.remove());

            // Add new hint
            const hintElement = document.createElement('div');
            hintElement.className = 'keyboard-nav-hint';
            hintElement.textContent = 'Use arrow keys ↕ to navigate, Enter to select, or click any option';
            hintElement.style.cssText = 'font-size: 12px !important; color: #666 !important; margin-bottom: 8px !important; font-style: italic !important; display: block !important;';
            lastContainer.insertBefore(hintElement, lastContainer.firstChild);
          }
        } else if (optionType === 'regular') {
          // Remove hints for single options, but only for regular options
          const lastContainer = optionsContainers.length > 0 ? optionsContainers[optionsContainers.length - 1] : null;
          if (lastContainer) {
            const existingHints = lastContainer.querySelectorAll('.keyboard-nav-hint');
            existingHints.forEach(hint => hint.remove());
          }
        }

        // Focus first option after a short delay to allow rendering (skip for embedded bots to prevent auto-scroll)
        setTimeout(() => {
          if (options[0] && options[0].offsetParent !== null && !isEmbeddedBot) {
            options[0].focus();
            if (options.length > 1) {
              announceToScreenReader(`${options.length} options available. Use arrow keys to navigate.`);
            }
          }
        }, 200);
      }
    };

    // Set up mutation observer to watch for new options
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);

          const hasNewOptions = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.classList?.contains('rcb-options-container') ||
             node.classList?.contains('rcb-options') ||
             node.querySelector?.('.rcb-options-container') ||
             node.querySelector?.('.rcb-options'))
          );

          const hasNewCheckboxes = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.classList?.contains('rcb-checkbox-container') ||
             node.querySelector?.('.rcb-checkbox-container'))
          );


          if (hasNewOptions || hasNewCheckboxes) {
            // Find which bot container this mutation occurred in
            let botContainer = mutation.target;
            while (botContainer && !botContainer.classList?.contains('qa-bot') && !botContainer.classList?.contains('rcb-chat-window')) {
              botContainer = botContainer.parentElement;
            }

            // If we found a bot container, scope operations to it; otherwise fallback to global
            const scopeElement = botContainer || document;

            // Clear tabindex from existing elements within this bot
            scopeElement.querySelectorAll('.rcb-options[tabindex], .rcb-checkbox-row-container[tabindex], .rcb-checkbox-next-button[tabindex]').forEach(el => {
              el.setAttribute('tabindex', '-1');
              el.classList.remove('keyboard-focused');
            });

            // Handle new options for this specific bot
            setTimeout(() => handleNewOptions(botContainer), 100);
          }
        }
      });
    });

    // Start observing the document body for changes in any bot
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Add keyboard event listener to document only
    document.addEventListener('keydown', handleKeyboardNavigation);

    // Check for existing options on mount
    handleNewOptions();


    // Periodic check as backup to catch any missed options and checkboxes
    const periodicCheck = setInterval(() => {
      // Check each bot container individually
      document.querySelectorAll('.qa-bot').forEach(botContainer => {
        const hasVisibleOptions = botContainer.querySelectorAll('.rcb-options-container .rcb-options').length > 0;
        const hasVisibleCheckboxes = botContainer.querySelectorAll('.rcb-checkbox-row-container').length > 0;

        if (hasVisibleOptions) {
          const lastProcessedOptions = botContainer.querySelectorAll('.rcb-options[tabindex]').length;
          const currentOptions = botContainer.querySelectorAll('.rcb-options').length;

          if (currentOptions > lastProcessedOptions) {
            handleNewOptions(botContainer);
          }
        }

        if (hasVisibleCheckboxes) {
          const lastProcessedCheckboxes = botContainer.querySelectorAll('.rcb-checkbox-row-container[tabindex]').length;
          const currentCheckboxes = botContainer.querySelectorAll('.rcb-checkbox-row-container').length;

          if (currentCheckboxes > lastProcessedCheckboxes) {
            handleNewOptions(botContainer);
          }
        }
      });
    }, 1000);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
      observer.disconnect();
      clearInterval(periodicCheck);
    };
  }, []);

  return null; // This hook doesn't return anything, just sets up event handlers
};

export default useKeyboardNavigation;