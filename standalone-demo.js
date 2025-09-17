/* global qaBotCore */

let botController;

// Initialize the bot when page loads
window.addEventListener('load', function() {
    if (typeof qaBotCore !== 'undefined') {
        botController = qaBotCore({
            target: document.getElementById('qa-bot-container'),
            embedded: false,  // Floating bot
            enabled: true,
            defaultOpen: false,
            welcome: "Hello! How can I help you today?",
            apiKey: 'demo-key',
            loginUrl: '/login'  // Optional login URL for demo
        });

        console.log('QA Bot initialized successfully');
    } else {
        console.error('qaBotCore not loaded. Make sure the script is built and available.');
    }
});

// Utility functions for demo controls
function openChat() {
    if (botController) {
        botController.openChat();
    }
}

function closeChat() {
    if (botController) {
        botController.closeChat();
    }
}

function toggleChat() {
    if (botController) {
        botController.toggleChat();
    }
}

function sendTestMessage() {
    if (botController) {
        botController.addMessage('Hello from the demo!');
    }
}

// Expose functions to global scope for onclick handlers
window.openChat = openChat;
window.closeChat = closeChat;
window.toggleChat = toggleChat;
window.sendTestMessage = sendTestMessage;
