/* global qaBotCore */

let botController;

// Initialize the bot with user-provided configuration
function initializeBot() {
    const apiKey = document.getElementById('api-key-input').value.trim();
    const qaEndpoint = document.getElementById('qa-endpoint-input').value.trim();
    const ratingEndpoint = document.getElementById('rating-endpoint-input').value.trim();
    const backendId = document.getElementById('backend-id-input').value.trim();
    const turnstileSiteKey = document.getElementById('turnstile-site-key-input').value.trim();
    const allowAnonAccess = document.getElementById('allow-anon-input').checked;

    if (!apiKey) {
        updateStatus('Please enter an API key', 'error');
        return;
    }

    if (!qaEndpoint) {
        updateStatus('Please enter a Q&A endpoint URL', 'error');
        return;
    }

    // Destroy existing bot if present
    if (botController) {
        botController.destroy();
        botController = null;
    }

    if (typeof qaBotCore !== 'undefined') {
        try {
            const config = {
                target: document.getElementById('qa-bot-container'),
                apiKey: apiKey,
                qaEndpoint: qaEndpoint,
                welcomeMessage: "Hello! How can I help you today?",
                primaryColor: '#24292e',
                secondaryColor: '#586069',
                botName: 'Demo Assistant',
                logo: 'https://github.com/github.png',
                placeholder: "Type your message here...",
                errorMessage: "Sorry, something went wrong",
                tooltipText: "Need help? Click here to chat!",
                embedded: false,
                enabled: true,
                defaultOpen: false,
                allowAnonAccess: allowAnonAccess,
                isLoggedIn: !allowAnonAccess,
                onAnalyticsEvent: (event) => {
                    console.log('[analytics]', event.type, event);
                },
            };
            if (ratingEndpoint) config.ratingEndpoint = ratingEndpoint;
            if (backendId) config.backendId = backendId;
            if (turnstileSiteKey) config.turnstileSiteKey = turnstileSiteKey;

            botController = qaBotCore(config);

            updateStatus('Bot initialized successfully', 'success');
            console.log('QA Bot initialized successfully with API key');

            // Enable control buttons
            document.querySelectorAll('.bot-control').forEach(btn => btn.disabled = false);

        } catch (error) {
            updateStatus('Failed to initialize bot: ' + error.message, 'error');
            console.error('Bot initialization failed:', error);
        }
    } else {
        updateStatus('qaBotCore not loaded. Make sure the script is built and available.', 'error');
    }
}

// Update status message
function updateStatus(message, type) {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = 'status ' + type;
    statusEl.style.display = 'block';
}

// Initialize on page load
window.addEventListener('load', function() {
    // No pre-populated values — fill in your own endpoints and keys.
    // See the README for guidance on proxy routing, Turnstile keys, etc.

    // Focus API key input
    document.getElementById('api-key-input').focus();

    // Handle Enter key in any input field
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                initializeBot();
            }
        });
    });
});

// Utility functions for demo controls
function openChat() {
    if (botController) {
        botController.openChat();
    } else {
        updateStatus('Please initialize the bot first', 'error');
    }
}

function closeChat() {
    if (botController) {
        botController.closeChat();
    } else {
        updateStatus('Please initialize the bot first', 'error');
    }
}

function toggleChat() {
    if (botController) {
        botController.toggleChat();
    } else {
        updateStatus('Please initialize the bot first', 'error');
    }
}

function sendTestMessage() {
    if (botController) {
        botController.addMessage('Hello! This is a test message from the demo.');
    } else {
        updateStatus('Please initialize the bot first', 'error');
    }
}

// Expose functions to global scope for onclick handlers
window.initializeBot = initializeBot;
window.openChat = openChat;
window.closeChat = closeChat;
window.toggleChat = toggleChat;
window.sendTestMessage = sendTestMessage;
