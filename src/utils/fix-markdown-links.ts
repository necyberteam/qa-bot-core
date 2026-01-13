/**
 * fix-markdown-links.ts
 * 
 * PRAGMATIC HACK: This file exists because react-chatbotify's MarkdownRenderer plugin
 * doesn't process messages injected via replaceMessages() (used for history restoration).
 * 
 * After trying several "proper" approaches (tag manipulation, JSX conversion, HTML strings),
 * none worked without breaking message bubble styling. This DOM post-processing approach
 * is a pragmatic solution that:
 * - Preserves all message styling (bubbles render correctly first)
 * - Simply finds raw markdown link patterns [text](url) in rendered text
 * - Replaces them with actual <a> elements
 * 
 * Only used after history restoration, not during normal chat flow.
 */

/**
 * Fixes markdown links in chat messages after they've been rendered.
 * Call this after replaceMessages() to convert [text](url) patterns to clickable links.
 */
export const fixMarkdownLinksInDom = (): void => {
  // Wait for React to finish rendering the messages
  setTimeout(() => {
    const chatBody = document.querySelector('.rcb-chat-body-container');
    if (!chatBody) {
      return;
    }

    // Find all bot message bubbles and fix markdown links in their text
    chatBody.querySelectorAll('.rcb-bot-message').forEach(bubble => {
      if (bubble.innerHTML.includes('](')) {
        bubble.innerHTML = bubble.innerHTML.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );
      }
    });
  }, 50);
};
