/* UDYAM SARTHI AI Digital Business Companion Assistant View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { getIcon } from '../../components/IconLibrary.js';
import { store } from '../../store.js';
import { aiService } from '../../services/aiService.js';

export const AssistantView = () => {
  const { chatMessages, business } = store.getState();

  setTimeout(() => {
    const inputEl = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    const messagesContainer = document.getElementById('chat-messages-box');

    const scrollToBottom = () => {
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    };

    scrollToBottom();

    const handleSend = async (userText) => {
      const text = userText || (inputEl ? inputEl.value.trim() : '');
      if (!text) return;

      if (inputEl) inputEl.value = '';

      // User Message
      store.addChatMessage(text, 'user');
      window.location.hash = '#/assistant'; // re-render view with new user message

      // Generate AI response
      const aiReply = await aiService.generateResponse(text);
      store.addChatMessage(aiReply, 'ai');
      window.location.hash = '#/assistant';
    };

    if (sendBtn) {
      sendBtn.addEventListener('click', () => handleSend());
    }

    if (inputEl) {
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }

    // Suggested Questions Chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const question = e.currentTarget.textContent.trim();
        handleSend(question);
      });
    });
  }, 0);

  const suggestedQuestions = [
    "Why did my production fall this week?",
    "Which machine is performing worst?",
    "What can I do to reduce downtime?",
    "Why is Machine A showing an alert?",
    "What government schemes may help my business?"
  ];

  return `
    <div class="app-layout">
      ${renderSidebar('/assistant')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">AI Digital Business Companion</h1>
              <p class="page-subtitle">Ask questions about your plant operations, machine performance, downtime, and government schemes.</p>
            </div>
          </div>

          <div class="chat-container">
            <!-- Messages Scroll Box -->
            <div class="chat-messages" id="chat-messages-box">
              ${chatMessages.map(msg => `
                <div class="chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}">
                  <div class="flex items-center gap-2 mb-1" style="font-weight: 600; font-size: 0.75rem; opacity: 0.8;">
                    ${msg.sender === 'user' ? `${getIcon('user', 14)} You (${business.name})` : `${getIcon('bot', 14)} Udyam Sarthi Companion`}
                  </div>
                  <div>${msg.text.replace(/\n/g, '<br/>')}</div>
                </div>
              `).join('')}
            </div>

            <!-- Suggested Prompt Chips -->
            <div class="chat-suggestions">
              ${suggestedQuestions.map(q => `<button class="suggestion-chip">${q}</button>`).join('')}
            </div>

            <!-- Input Bar -->
            <div class="chat-input-area">
              <input type="text" id="chat-input" class="form-input" placeholder="Ask your business companion anything about your plant..." />
              <button class="btn btn-primary" id="send-chat-btn">
                <span>Send</span>
                ${getIcon('chevronRight', 16)}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;
};