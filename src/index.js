import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import QABot from './components/QABot';
import reportWebVitals from './reportWebVitals';

function ExampleApp() {
  const [userLoggedIn, setUserLoggedIn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messageToSend, setMessageToSend] = useState('Hello from the Chatbot');
  const botRef = useRef();

  // Read from environment variables
  const apiKey = process.env.REACT_APP_API_KEY || null;
  const qaEndpoint = process.env.REACT_APP_QA_ENDPOINT || null;
  const ratingEndpoint = process.env.REACT_APP_RATING_ENDPOINT || null;

  // Environment variables are now used directly

  const handleSendMessage = () => {
    if (botRef.current && messageToSend.trim()) {
      botRef.current.addMessage(messageToSend);
      setMessageToSend('');
    }
  };

  return (
    <div>
      <div className="demo-container">
        <div className="demo-header">
          <div className="demo-title">
            QA Bot Core: React Component Demo
          </div>
        </div>

        <div className="demo-main">
          <div className="demo-columns">
            {/* Column 1: Configuration Status */}
            <div className="demo-column">
              <h2>Configuration Status</h2>
              <div className="config-item">
                <div className="config-prop">API Key</div>
                <div className="config-value">
                  {apiKey ? '✓ Configured' : '✗ Not set'}
                </div>
                <div className="config-desc">REACT_APP_API_KEY</div>
              </div>

              <div className="config-item">
                <div className="config-prop">Q&A Endpoint</div>
                <div className="config-value">
                  {qaEndpoint ? '✓ Configured' : '✗ Not set'}
                </div>
                <div className="config-desc">
                  REACT_APP_QA_ENDPOINT
                  {qaEndpoint && <div style={{fontSize: '0.8em', marginTop: '4px', wordBreak: 'break-all'}}>{qaEndpoint}</div>}
                </div>
              </div>

              <div className="config-item">
                <div className="config-prop">Rating Endpoint</div>
                <div className="config-value">
                  {ratingEndpoint ? '✓ Configured' : '✗ Not set'}
                </div>
                <div className="config-desc">
                  REACT_APP_RATING_ENDPOINT (optional)
                  {ratingEndpoint && <div style={{fontSize: '0.8em', marginTop: '4px', wordBreak: 'break-all'}}>{ratingEndpoint}</div>}
                </div>
              </div>
            </div>

            {/* Column 2: Dynamic Props */}
            <div className="demo-column">
              <h2>Dynamic Props</h2>
              <p className="demo-help">Control bot visibility and availability via props</p>

              <label className="demo-checkbox">
                <input
                  type="checkbox"
                  checked={userLoggedIn}
                  onChange={(e) => setUserLoggedIn(e.target.checked)}
                />
                <span>Bot is enabled</span>
                <code className="demo-prop-name">enabled</code>
              </label>

              <label className="demo-checkbox">
                <input
                  type="checkbox"
                  checked={chatOpen}
                  onChange={(e) => setChatOpen(e.target.checked)}
                />
                <span>Chat window open</span>
                <code className="demo-prop-name">open</code>
              </label>
            </div>

            {/* Column 3: Component API */}
            <div className="demo-column">
              <h2>Component API</h2>
              <p className="demo-help">Use imperative methods to inject messages</p>
              <div className="demo-method-signature">
                <code>addMessage(message: string)</code>
              </div>

              <div className="demo-field">
                <label htmlFor="message-input">Message:</label>
                <input
                  id="message-input"
                  type="text"
                  value={messageToSend}
                  onChange={(e) => setMessageToSend(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="demo-input"
                />
              </div>
              <button
                onClick={handleSendMessage}
                className="demo-send-button"
                disabled={!messageToSend.trim()}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>

      <QABot
        ref={botRef}
        apiKey={apiKey}
        qaEndpoint={qaEndpoint}
        ratingEndpoint={ratingEndpoint}
        welcomeMessage="What can I help you with?"
        botName="Q&A Assistant"
        placeholder="Type your question here..."
        tooltipText="Click to chat with our Q&A assistant!"
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ExampleApp />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
