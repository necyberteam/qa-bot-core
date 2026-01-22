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
 * - Finds raw markdown link patterns [text](url) in rendered text
 * - Finds escaped HTML anchor tags that got text-escaped
 * - Replaces them with actual <a> elements
 *
 * Only used after history restoration, not during normal chat flow.
 */

/**
 * Fixes links in chat messages after they've been rendered.
 * Call this after replaceMessages() to convert link patterns to clickable links.
 *
 * Handles:
 * - Markdown links: [text](url)
 * - Escaped HTML anchors: &lt;a href="url"...&gt;text&lt;/a&gt;
 * - Plain text HTML anchors: <a href="url"...>text</a> (displayed as text)
 */
export const fixMarkdownLinksInDom = (): void => {
  // Wait for React to finish rendering the messages
  setTimeout(() => {
    const chatBody = document.querySelector('.rcb-chat-body-container');
    if (!chatBody) {
      return;
    }

    // Find all bot message bubbles and fix links in their text
    chatBody.querySelectorAll('.rcb-bot-message').forEach(bubble => {
      let html = bubble.innerHTML;
      let changed = false;

      // Fix markdown links: [text](url)
      if (html.includes('](')) {
        html = html.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        changed = true;
      }

      // Fix escaped HTML anchor tags: &lt;a href="url"...&gt;text&lt;/a&gt;
      // This happens when HTML anchor tags are stored as text and get escaped
      if (html.includes('&lt;a href=')) {
        html = html.replace(
          /&lt;a\s+href=["']([^"']+)["'][^&]*&gt;([^&]+)&lt;\/a&gt;/gi,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>'
        );
        changed = true;
      }

      // Fix plain text HTML anchors that weren't escaped but displayed as text
      // This catches: <a href="url" target="_blank">text</a> shown literally
      if (html.includes('&lt;a ') || (bubble.textContent?.includes('<a href='))) {
        // The text content has literal <a> tags - need to extract and convert
        const textContent = bubble.textContent || '';
        if (textContent.includes('<a href=')) {
          html = html.replace(
            /&lt;a\s+href="([^"]+)"[^&]*&gt;([^&]+)&lt;\/a&gt;/gi,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>'
          );
          changed = true;
        }
      }

      if (changed) {
        bubble.innerHTML = html;
      }
    });
  }, 50);
};
