import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import QABot from './components/QABot';
import reportWebVitals from './reportWebVitals';

function ExampleApp() {
  const [userLoggedIn, setUserLoggedIn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [email, setUserEmail] = useState('');
  const [name, setUserName] = useState('');
  const [messageToSend, setMessageToSend] = useState('Hello from the Chatbot');
  const botRef = useRef();

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
          <div className="demo-controls-section">
            <h2>Dynamic Props</h2>
            <div className="demo-controls">
              <div className="demo-section">
                <h3>State Controls</h3>
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

              <div className="demo-section">
                <h3>User Context</h3>
                <p className="demo-help">Pass user data for personalized interactions</p>

                <div className="demo-field">
                  <label htmlFor="user-email-react">
                    Email <code className="demo-prop-name">userEmail</code>
                  </label>
                  <input
                    id="user-email-react"
                    type="email"
                    value={email}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="demo-input"
                  />
                </div>

                <div className="demo-field">
                  <label htmlFor="user-name-react">
                    Name <code className="demo-prop-name">userName</code>
                  </label>
                  <input
                    id="user-name-react"
                    type="text"
                    value={name}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="John Doe"
                    className="demo-input"
                  />
                </div>
              </div>

              <div className="demo-message-section">
                <h3>Component API</h3>
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
      </div>

      <QABot
        ref={botRef}
        enabled={userLoggedIn}
        embedded={false}
        open={chatOpen}
        onOpenChange={setChatOpen}
        loginUrl="/login"
        apiKey={process.env.REACT_APP_API_KEY || null}
        welcome="What can I help you with?"
        userEmail={email || undefined}
        userName={name || undefined}
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
