// src/components/MarkdownContent.tsx
import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

/**
 * Markdown renderer used by @rcb-plugins/markdown-renderer via its
 * `markdownComponent` config hook.
 *
 * The plugin's built-in wrapper renders react-markdown with NO remark plugins,
 * so GitHub-flavored markdown — most visibly tables — is left as raw pipe text.
 * This wrapper mirrors the plugin's default wrapper (the `whiteSpace: normal`
 * container, the per-element component overrides, and the string-guarded
 * children) and additionally:
 *   - enables `remark-gfm` so tables/strikethrough/task lists/autolinks parse;
 *   - styles tables to match the teal message bubble (transparent cells, white
 *     text, translucent borders) instead of a pasted-in light box.
 *
 * The string guard on `children` matters: react-chatbotify may hand the
 * wrapper a non-string for non-markdown messages, and react-markdown only
 * parses strings — passing a node through would render bold/links as literal
 * text. Falling back to "" keeps those messages out of the parser.
 */

// Subtle dark-translucent code styling that reads on the teal bubble.
const CODE_BG = 'rgba(0, 0, 0, 0.3)';

const components: Components = {
  p: ({ children }) => (
    <p style={{ margin: 0, marginBottom: '0.5em', lineHeight: 1.4, textAlign: 'left' }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: 'clamp(8px, 3.5vw, 16px)', margin: 0, listStylePosition: 'inside' }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: 'clamp(8px, 3.5vw, 16px)', margin: 0, listStylePosition: 'inside' }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '1px', lineHeight: 1.4 }}>{children}</li>
  ),
  code: ({ className, children }) => {
    // Block code carries a language-* class from the fenced ``` ; inline code
    // does not. Inline hugs its text; blocks are full-width with scroll.
    const isBlock = /\blanguage-/.test(className || '');
    if (isBlock) {
      return (
        <pre
          style={{
            backgroundColor: CODE_BG,
            padding: '8px',
            borderRadius: '4px',
            overflowX: 'auto',
            margin: '0.5em 0',
            whiteSpace: 'pre-wrap',
          }}
        >
          <code>{children}</code>
        </pre>
      );
    }
    return (
      <code
        style={{
          backgroundColor: CODE_BG,
          padding: '2px 4px',
          borderRadius: '4px',
          fontFamily: 'inherit',
          fontSize: '0.95em',
        }}
      >
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: 0,
        paddingLeft: '10px',
        borderLeft: '2px solid rgba(255, 255, 255, 0.4)',
        color: 'inherit',
        fontStyle: 'italic',
      }}
    >
      {children}
    </blockquote>
  ),
  // Links inherit the bubble's text color (white on the default dark bubble)
  // and are distinguished by an underline. This stays generic — it makes no
  // assumption about a brand link color — so it reads on any themed bubble
  // rather than falling back to the browser default blue (#0000ee). A
  // consuming app that wants a specific brand link color can override
  // `.rcb-bot-message a`. Anchors open in a new tab (matching fix-markdown-links).
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}
    >
      {children}
    </a>
  ),
  // Tables blend into the teal bubble: transparent cells, explicit white text
  // (cells don't reliably inherit the bubble's color), translucent-white
  // borders, and a slightly brighter header band. Enabled by remark-gfm.
  table: ({ children }) => (
    <table
      style={{
        borderCollapse: 'collapse',
        width: '100%',
        margin: '0.5em 0',
        fontSize: '0.95em',
        color: '#fff',
      }}
    >
      {children}
    </table>
  ),
  th: ({ children }) => (
    <th
      style={{
        border: '1px solid rgba(255, 255, 255, 0.4)',
        padding: '6px 10px',
        textAlign: 'left',
        verticalAlign: 'top',
        fontWeight: 600,
        color: '#fff',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        // The bubble defaults to overflow-wrap:anywhere, which breaks short
        // labels mid-word ("Resou/rce"). Only wrap at normal break points.
        overflowWrap: 'normal',
        wordBreak: 'normal',
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      style={{
        border: '1px solid rgba(255, 255, 255, 0.4)',
        padding: '6px 10px',
        textAlign: 'left',
        verticalAlign: 'top',
        color: '#fff',
        overflowWrap: 'normal',
        wordBreak: 'normal',
      }}
    >
      {children}
    </td>
  ),
};

const MarkdownContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ whiteSpace: 'normal' }}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {typeof children === 'string' ? children : ''}
      </Markdown>
    </div>
  );
};

export default MarkdownContent;
