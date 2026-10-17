/* UDYAM SARTHI AI Digital Business Companion Assistant View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { getIcon } from '../../components/IconLibrary.js';
import { store } from '../../store.js';
import { aiService } from '../../services/aiService.js';
import { renderAssistantMessageHtml, escapeHtml } from '../../components/ChatMessageRenderer.js';

function renderUserBubble(text, businessName) {
  return `
    <div class="chat-bubble chat-bubble-user">
      <div class="flex items-center gap-2 mb-1" style="font-weight: 600; font-size: 0.75rem; opacity: 0.85;">
        ${getIcon('user', 14)} You (${escapeHtml(businessName || 'Business')})
      </div>
      <div style="white-space: pre-wrap; word-break: break-word;">${escapeHtml(text)}</div>
    </div>
  `;
}

function renderAiBubble(text) {
  return `
    <div class="chat-bubble chat-bubble-ai">
      <div class="flex items-center gap-2 mb-1" style="font-weight: 600; font-size: 0.75rem; opacity: 0.85;">
        ${getIcon('bot', 14)} Udyam Sarthi Companion
      </div>
      <div class="chat-message-content">${renderAssistantMessageHtml(text)}</div>
    </div>
  `;
}

function renderTypingIndicator() {
  return `
    <div class="chat-bubble chat-bubble-ai chat-typing-bubble" id="chat-typing-indicator">
      <div class="flex items-center gap-2 mb-1" style="font-weight: 600; font-size: 0.75rem; opacity: 0.85;">
        ${getIcon('bot', 14)} Udyam Sarthi Companion is analyzing operations...
      </div>
      <div class="flex items-center gap-1.5 py-1">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>
  `;
}

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

      if (inputEl) {
        inputEl.value = '';
        inputEl.disabled = true;
      }
      if (sendBtn) sendBtn.disabled = true;

      // 1. User Message: append to DOM & store
      store.addChatMessage(text, 'user');
      if (messagesContainer) {
        messagesContainer.insertAdjacentHTML('beforeend', renderUserBubble(text, business?.name));
        messagesContainer.insertAdjacentHTML('beforeend', renderTypingIndicator());
        scrollToBottom();
      }

      try {
        // 2. Generate AI response
        const aiReply = await aiService.generateResponse(text);

        // Remove typing indicator
        const typingEl = document.getElementById('chat-typing-indicator');
        if (typingEl) typingEl.remove();

        // 3. AI Message: append to DOM & store
        store.addChatMessage(aiReply, 'ai');
        if (messagesContainer) {
          messagesContainer.insertAdjacentHTML('beforeend', renderAiBubble(aiReply));
          scrollToBottom();
        }
      } catch (err) {
        console.error("AI Companion generation error:", err);
        const typingEl = document.getElementById('chat-typing-indicator');
        if (typingEl) typingEl.remove();
        if (messagesContainer) {
          messagesContainer.insertAdjacentHTML('beforeend', `
            <div class="chat-bubble chat-bubble-ai">
              <div class="text-danger text-sm">Unable to process operational query at this time. Please try again.</div>
            </div>
          `);
          scrollToBottom();
        }
      } finally {
        if (inputEl) {
          inputEl.disabled = false;
          inputEl.focus();
        }
        if (sendBtn) sendBtn.disabled = false;
      }
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
        const query = e.currentTarget.getAttribute('data-query') || e.currentTarget.textContent.trim();
        handleSend(query);
      });
    });
  }, 0);

  const suggestedQuestions = [
    { label: "Why is Machine A underperforming?", query: "Why is Machine A underperforming?" },
    { label: "Compare Machine A, B and C", query: "Compare Machine A, B and C." },
    { label: "How can I reduce scrap?", query: "How can I reduce scrap?" },
    { label: "Which machine needs maintenance?", query: "Which machine needs maintenance?" },
    { label: "What data is missing to diagnose Machine A?", query: "What data is missing to diagnose Machine A?" },
    { label: "Diagnose scrap rate & causes", query: "My material scrap rate has increased this week. Based on the available operational data, identify the likely cause, provide the relevant KPI values, and suggest three practical actions. If the data is insufficient, tell me what information is missing." }
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
              ${chatMessages.map(msg => msg.sender === 'user' ? renderUserBubble(msg.text, business.name) : renderAiBubble(msg.text)).join('')}
            </div>

            <!-- Suggested Prompt Chips -->
            <div class="chat-suggestions">
              ${suggestedQuestions.map(q => `<button class="suggestion-chip" data-query="${escapeHtml(q.query)}">${escapeHtml(q.label)}</button>`).join('')}
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