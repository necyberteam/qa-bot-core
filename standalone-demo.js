/* global qaBotCore */

let botController;

// Initialize the bot when page loads
window.addEventListener('load', function() {
    if (typeof qaBotCore !== 'undefined') {
        botController = qaBotCore({
            target: document.getElementById('qa-bot-container'),
            // Simple props only - demonstrating the simplified architecture
            apiKey: 'demo-api-key',
            endpoints: {
                qa: 'https://api.example.com/chat'
            },
            userEmail: 'demo@example.com',
            userName: 'Demo User',
            welcomeMessage: "Hello! How can I help you today?",
            branding: {
                primaryColor: '#24292e',     // GitHub dark gray
                secondaryColor: '#586069',   // GitHub medium gray
                primaryFont: 'Arial, sans-serif',
                botName: 'Demo Assistant',
                logo: 'https://github.com/github.png'
            },
            messages: {
                welcome: "Hi there! Ask me anything.",
                placeholder: "Type your message here...",
                error: "Sorry, something went wrong",
                disabled: "Chat is currently disabled"
            },
            embedded: false,  // Floating bot
            enabled: true,
            defaultOpen: false,
            loginUrl: '/login'
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
        botController.addMessage('Hello! This is a test message from the demo.');
    }
}

// Expose functions to global scope for onclick handlers
window.openChat = openChat;
window.closeChat = closeChat;
window.toggleChat = toggleChat;
window.sendTestMessage = sendTestMessage;
