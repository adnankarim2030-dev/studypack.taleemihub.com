/* ========================================================
   STUDY PACK SMART AI + LIVE AGENT HYBRID CHATBOT
   ======================================================== */

(function() {
  'use strict';

  let currentChatSessionId = localStorage.getItem('sp_chat_session_id') || null;
  let isLiveAgentMode = false;
  let customerInfo = JSON.parse(localStorage.getItem('sp_customer_info') || '{}');
  let unsubscribeLiveMessages = null;

  document.addEventListener('DOMContentLoaded', function() {
    initChatbot();
  });

  function initChatbot() {
    if (document.getElementById('spChatWidget')) return;

    const widget = document.createElement('div');
    widget.id = 'spChatWidget';
    widget.className = 'sp-chat-widget';

    widget.innerHTML = `
      <div class="sp-chat-window" id="spChatWindow">
        <div class="sp-chat-header">
          <div class="sp-chat-header-info">
            <div class="sp-chat-avatar" id="spChatAvatar">
              <svg viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-8 8c0 2.5 1.1 4.7 3 6.2V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3.8c1.9-1.5 3-3.7 3-6.2a8 8 0 0 0-8-8z"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/><path d="M10 14h4"/></svg>
            </div>
            <div class="sp-chat-title">
              <h4 id="spChatHeaderTitle">Study Pack Assistant</h4>
              <span id="spChatStatus">Online • Ready to help</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <button id="spSwitchModeBtn" title="Switch between AI and Human Agent" style="background:rgba(255,255,255,0.15); border:none; color:#fff; font-size:11px; font-weight:700; padding:4px 8px; border-radius:12px; cursor:pointer;">
              👤 Agent
            </button>
            <button class="sp-chat-close-btn" id="spChatClose" title="Close Chat">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div class="sp-chat-body" id="spChatBody">
          <div class="sp-msg bot">
            <div class="sp-bubble">
              Assalam-o-Alaikum! 👋 Main Study Pack ka Virtual Assistant hoon. Aap books search kar sakte hain ya direct <strong>Human Agent</strong> se baat kar sakte hain!
            </div>
            <span class="sp-msg-time">Just now</span>
          </div>

          <div class="sp-chat-chips" id="spChatChips">
            <button class="sp-chip" onclick="handleChipClick('Connect with Agent')">👤 Talk to Live Agent</button>
            <button class="sp-chip" onclick="handleChipClick('Oxford Countdown')">📚 Oxford Books</button>
            <button class="sp-chip" onclick="handleChipClick('Delivery Charges')">🚚 Delivery &amp; COD Rates</button>
            <button class="sp-chip" onclick="handleChipClick('Science Books')">🔬 Science &amp; Maths</button>
            <button class="sp-chip" onclick="handleChipClick('WhatsApp Support')">💬 WhatsApp Helpline</button>
          </div>
        </div>

        <form class="sp-chat-footer" id="spChatForm">
          <input type="text" id="spChatInput" class="sp-chat-input" placeholder="Apna sawal ya message likhein..." autocomplete="off">
          <button type="submit" class="sp-chat-send-btn" id="spChatSend">
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>

      <button class="sp-chat-trigger" id="spChatTrigger" title="Chat with Us">
        <span class="sp-chat-badge"></span>
        <svg id="spTriggerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>
    `;

    document.body.appendChild(widget);

    const trigger = document.getElementById('spChatTrigger');
    const windowEl = document.getElementById('spChatWindow');
    const closeBtn = document.getElementById('spChatClose');
    const form = document.getElementById('spChatForm');
    const input = document.getElementById('spChatInput');
    const modeBtn = document.getElementById('spSwitchModeBtn');

    trigger.addEventListener('click', () => {
      windowEl.classList.toggle('open');
      if (windowEl.classList.contains('open')) {
        input.focus();
      }
    });

    closeBtn.addEventListener('click', () => {
      windowEl.classList.remove('open');
    });

    modeBtn.addEventListener('click', () => {
      if (!isLiveAgentMode) {
        startLiveAgentFlow();
      } else {
        switchToAiMode();
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      
      input.value = '';
      if (isLiveAgentMode) {
        sendLiveMessage(query);
      } else {
        addUserMessage(query);
        processUserQuery(query);
      }
    });

    window.handleChipClick = function(text) {
      if (text === 'Connect with Agent' || text === 'Talk to Live Agent') {
        startLiveAgentFlow();
      } else {
        addUserMessage(text);
        processUserQuery(text);
      }
    };
  }

  function startLiveAgentFlow() {
    if (!customerInfo.name || !customerInfo.phone) {
      addBotMessage(`
        <strong>👤 Live Agent Support:</strong><br>
        Real Support Agent se baat karne ke liye baraye meharbani apna Naam aur Phone Number enter karein:<br><br>
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
          <input type="text" id="spCustNameInput" placeholder="Aapka Naam" style="padding:6px 10px; border-radius:6px; border:1px solid #CBD5E1; font-size:12px;" value="${escapeHtml(customerInfo.name || '')}">
          <input type="tel" id="spCustPhoneInput" placeholder="Phone # (e.g. 03XX-XXXXXXX)" style="padding:6px 10px; border-radius:6px; border:1px solid #CBD5E1; font-size:12px;" value="${escapeHtml(customerInfo.phone || '')}">
          <button onclick="confirmLiveAgentConnect()" style="padding:7px 12px; background:#1565C0; color:#fff; border:none; border-radius:6px; font-weight:700; font-size:12px; cursor:pointer;">
            Connect with Live Agent 🚀
          </button>
        </div>
      `);
    } else {
      connectToLiveAgent();
    }
  }

  window.confirmLiveAgentConnect = function() {
    const nameEl = document.getElementById('spCustNameInput');
    const phoneEl = document.getElementById('spCustPhoneInput');
    const name = nameEl ? nameEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';

    if (!name || !phone) {
      alert("Baraye meharbani apna naam aur phone number likhein.");
      return;
    }

    customerInfo = { name: name, phone: phone };
    localStorage.setItem('sp_customer_info', JSON.stringify(customerInfo));
    connectToLiveAgent();
  };

  async function connectToLiveAgent() {
    isLiveAgentMode = true;
    document.getElementById('spChatHeaderTitle').textContent = 'Live Agent (Support)';
    document.getElementById('spChatStatus').textContent = 'Connecting with agent...';
    document.getElementById('spSwitchModeBtn').textContent = '🤖 AI Bot';

    if (!currentChatSessionId) {
      currentChatSessionId = 'chat_' + Math.floor(100000 + Math.random() * 900000);
      localStorage.setItem('sp_chat_session_id', currentChatSessionId);
    }

    addBotMessage(`
      ✅ <strong>Connected with Support Desk!</strong><br>
      Aapka session create ho gaya hai. Hamara agent jald hi aapke message ka live reply dega. Aap apna sawal yahan type kar sakte hain.
    `);

    // Register / Update Firestore chat session
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      const db = firebase.firestore();
      try {
        await db.collection('live_chats').doc(currentChatSessionId).set({
          id: currentChatSessionId,
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          status: 'active',
          unreadByAdmin: true,
          lastUpdated: Date.now(),
          lastMessage: 'Customer connected to live agent'
        }, { merge: true });

        // Listen for agent replies
        if (unsubscribeLiveMessages) unsubscribeLiveMessages();
        unsubscribeLiveMessages = db.collection('live_chats').doc(currentChatSessionId)
          .collection('messages').orderBy('timestamp', 'asc')
          .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
              if (change.type === 'added') {
                const msg = change.doc.data();
                if (msg.sender === 'agent' || msg.sender === 'admin') {
                  const agentName = msg.agentName ? `👤 ${escapeHtml(msg.agentName)}` : '👤 Support Agent';
                  addBotMessage(`<strong>${agentName}:</strong><br>${escapeHtml(msg.text)}`);
                  document.getElementById('spChatStatus').textContent = `${escapeHtml(msg.agentName || 'Agent')} is chatting with you`;
                }
              }
            });
          });

      } catch (err) {
        console.error("Firestore connect error:", err);
      }
    }
  }

  function switchToAiMode() {
    isLiveAgentMode = false;
    document.getElementById('spChatHeaderTitle').textContent = 'Study Pack Assistant';
    document.getElementById('spChatStatus').textContent = 'Online • Ready to help';
    document.getElementById('spSwitchModeBtn').textContent = '👤 Agent';
    if (unsubscribeLiveMessages) unsubscribeLiveMessages();
    addBotMessage("Switched back to <strong>AI Virtual Assistant</strong> mode. Main aapki kya madad kar sakta hoon?");
  }

  async function sendLiveMessage(text) {
    addUserMessage(text);

    if (typeof firebase !== 'undefined' && firebase.firestore && currentChatSessionId) {
      const db = firebase.firestore();
      try {
        await db.collection('live_chats').doc(currentChatSessionId).collection('messages').add({
          text: text,
          sender: 'customer',
          customerName: customerInfo.name || 'Customer',
          timestamp: Date.now()
        });

        await db.collection('live_chats').doc(currentChatSessionId).update({
          lastMessage: text,
          lastSender: 'customer',
          lastUpdated: Date.now(),
          unreadByAdmin: true
        });
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
  }

  function addUserMessage(text) {
    const body = document.getElementById('spChatBody');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = document.createElement('div');
    msg.className = 'sp-msg user';
    msg.innerHTML = `<div class="sp-bubble">${escapeHtml(text)}</div><span class="sp-msg-time">${time}</span>`;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  function addBotMessage(htmlContent) {
    const body = document.getElementById('spChatBody');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = document.createElement('div');
    msg.className = 'sp-msg bot';
    msg.innerHTML = `<div class="sp-bubble">${htmlContent}</div><span class="sp-msg-time">${time}</span>`;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  function showTypingIndicator() {
    const body = document.getElementById('spChatBody');
    const typing = document.createElement('div');
    typing.id = 'spTyping';
    typing.className = 'sp-typing-indicator';
    typing.innerHTML = `<div class="sp-typing-dot"></div><div class="sp-typing-dot"></div><div class="sp-typing-dot"></div>`;
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('spTyping');
    if (el) el.remove();
  }

  function processUserQuery(query) {
    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      const q = query.toLowerCase().trim();

      if (q.includes('agent') || q.includes('human') || q.includes('adnan') || q.includes('talk to') || q.includes('insan') || q.includes('real chat')) {
        startLiveAgentFlow();
        return;
      }

      if (q.includes('delivery') || q.includes('shipping') || q.includes('charges') || q.includes('wazan') || q.includes('weight') || q.includes('cod')) {
        addBotMessage(`
          <strong>🚚 Delivery &amp; Payment Info:</strong><br>
          • <strong>Delivery Charges:</strong> Kitabon ke actual parcel weight (wazan) ke mutabiq courier rate par calculate hotay hain.<br>
          • <strong>COD Charges:</strong> Cash on Delivery par 4% courier transfer fee lagti hai.<br>
          • <strong>Live Agent:</strong> Kisi khas order ke delivery charges maloom karne ke liye <strong>👤 Talk to Live Agent</strong> par click karein.
        `);
        return;
      }

      if (q.includes('whatsapp') || q.includes('contact') || q.includes('helpline') || q.includes('phone')) {
        addBotMessage(`
          <strong>💬 Live WhatsApp Support:</strong><br>
          <a href="https://wa.me/923000000000" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:#25D366; color:#fff; padding:8px 14px; border-radius:20px; font-weight:700; text-decoration:none; font-size:12.5px;">
            📱 Chat on WhatsApp
          </a>
        `);
        return;
      }

      const catalog = typeof BOOKS !== 'undefined' ? BOOKS : (typeof SCRAPED_BOOKS !== 'undefined' ? SCRAPED_BOOKS : []);
      const ignoreWords = ['ki', 'ka', 'ke', 'ko', 'mai', 'in', 'of', 'for', 'book', 'books', 'the', 'a', 'an', 'kitab', 'kitabein', 'chahiye', 'hai'];
      const keywords = q.split(' ').filter(w => w.length > 1 && !ignoreWords.includes(w));
      
      let matched = [];
      if (keywords.length > 0) {
        matched = catalog.filter(b => {
          const str = `${b.title || ''} ${b.author || ''} ${b.pub || ''} ${b.cls || ''} ${b.subj || ''}`.toLowerCase();
          return keywords.some(k => str.includes(k));
        });
      }

      if (matched.length > 0) {
        let cardsHtml = `Maine aapke liye <strong>${matched.length}</strong> items talaash kiye hain:<br>`;
        matched.slice(0, 3).forEach(b => {
          const priceStr = typeof money === 'function' ? money(b.price) : 'Rs ' + b.price;
          const img = b.img || 'assets/images/logo.png';
          cardsHtml += `
            <div class="sp-chat-product-card">
              <img src="${img}" alt="${escapeHtml(b.title)}" onerror="this.src='assets/images/logo.png'">
              <div class="info">
                <div class="title" title="${escapeHtml(b.title)}">${escapeHtml(b.title)}</div>
                <div class="price">${priceStr}</div>
              </div>
              <button class="btn-add" onclick="addToCart('${b.id}'); showToast('Cart mein add ho gayi');">Add to Cart</button>
            </div>
          `;
        });
        cardsHtml += `<div style="margin-top:8px;"><button onclick="startLiveAgentFlow()" class="sp-chip" style="background:#1565C0; color:#fff; border:none;">👤 Talk to Live Agent for details</button></div>`;
        addBotMessage(cardsHtml);
      } else {
        addBotMessage(`
          Aapki talash ke mutabiq direct result nahi mila. Aap hamare <strong>Live Agent</strong> se baat kar sakte hain ya catalog search kar sakte hain:<br><br>
          <button onclick="startLiveAgentFlow()" class="sp-chip" style="background:#1565C0; color:#fff; border:none; margin-bottom:6px;">👤 Connect with Live Agent</button><br>
          <a href="books.html?q=${encodeURIComponent(query)}" style="color:#1565C0; font-weight:700; font-size:12.5px;">🔍 Search in Books Catalog</a>
        `);
      }
    }, 400);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

})();
