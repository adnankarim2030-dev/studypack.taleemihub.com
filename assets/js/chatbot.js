/* ========================================================
   STUDY PACK SMART AI + LIVE AGENT HYBRID CHATBOT
   Natural Conversational AI Engine (Roman Urdu & English)
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
            <img src="assets/images/studypack_logo.png" class="sp-chat-avatar-logo" alt="Study Pack Logo" onerror="this.src='assets/images/logo.png'">
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
              Assalam-o-Alaikum! 👋 Welcome to <strong>Study Pack</strong>.<br>
              Main aapka virtual book consultant hoon. Main aapko school syllabus, Oxford/Paramount/Spectrum books talaash karne aur order place karne mein mukammal madad kar sakta hoon!
            </div>
            <span class="sp-msg-time">Just now</span>
          </div>

          <div class="sp-chat-chips" id="spChatChips">
            <button class="sp-chip" onclick="handleChipClick('Oxford Countdown')">📚 Oxford Books</button>
            <button class="sp-chip" onclick="handleChipClick('Order kaise karein?')">🛒 Order kaise karein?</button>
            <button class="sp-chip" onclick="handleChipClick('Delivery Charges & COD')">🚚 Delivery &amp; COD Rates</button>
            <button class="sp-chip" onclick="handleChipClick('Class 5 Course')">🎒 School Syllabi</button>
            <button class="sp-chip" onclick="handleChipClick('Connect with Agent')">👤 Talk to Live Agent</button>
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
        <strong>👤 Live Agent Desk:</strong><br>
        Hum aapko real support agent se connect kar rahe hain. Baraye meharbani apna Naam aur Phone Number likhein:<br><br>
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
      Aapka session create ho gaya hai. Hamara agent jald hi aapke message ka live reply dega.
    `);

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
    addBotMessage("Switched back to <strong>AI Virtual Assistant</strong> mode. Ji batayein, main aapki kya madad kar sakta hoon?");
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

  // ========================================================
  // NATURAL CONVERSATIONAL AI ENGINE
  // ========================================================
  function processUserQuery(query) {
    showTypingIndicator();
    
    // Simulate realistic human reading & typing delay
    const delay = Math.min(800, Math.max(350, query.length * 20));

    setTimeout(() => {
      removeTypingIndicator();
      const q = query.toLowerCase().trim();

      // 1. Greetings & Pleasantries
      if (q.match(/^(salam|assalam|aoa|hi|hello|hey|kia hal|kese ho|kaise ho|good morning|good evening)/i)) {
        addBotMessage(`
          Walaikum Assalam! 😊 Umeed hai aap khairiyat se honge.<br>
          Aapko aaj kis school, class ya subject ki kitabein ya stationery chahiye? Aap book ka naam likhein, main foran nikaal kar deta hoon!
        `);
        return;
      }

      // 2. Appreciation & Thanks
      if (q.match(/^(shukriya|thanks|thank you|jazakallah|meharbani|bohat shukriya|nice|great|good)/i)) {
        addBotMessage(`
          Aapka bohat shukriya! ❤️ Study Pack par khidmat karna hamara farz hai. Agar mazeed koi bhi kitab chahiye ho to bila-jhijhak batayein!
        `);
        return;
      }

      // 3. Human Agent switch request
      if (q.includes('agent') || q.includes('human') || q.includes('adnan') || q.includes('talk to') || q.includes('insan') || q.includes('real chat') || q.includes('representative')) {
        startLiveAgentFlow();
        return;
      }

      // 4. How to Order / Buying steps
      if (q.includes('order kaise') || q.includes('kaise khareed') || q.includes('how to order') || q.includes('order process') || q.includes('buy kaise')) {
        addBotMessage(`
          <strong>🛒 Order Place Karne Ka Asaan Tareeqa:</strong><br><br>
          1️⃣ Jo book ya item chahiye, us par <strong>"Add to Cart"</strong> dabayein.<br>
          2️⃣ Upar Cart Drawer khol kar <strong>"Checkout"</strong> par click karein.<br>
          3️⃣ Apna delivery address aur phone number enter kar ke <strong>"Place Order"</strong> kar dein.<br><br>
          📦 <em>Aapka order receive hotay hi hum parcel ka actual weight check kar ke final delivery charges WhatsApp par confirm kar denge!</em>
        `);
        return;
      }

      // 5. Delivery Charges & COD Fees
      if (q.includes('delivery') || q.includes('shipping') || q.includes('charges') || q.includes('wazan') || q.includes('weight') || q.includes('cod') || q.includes('kitne din') || q.includes('kab milega')) {
        addBotMessage(`
          <strong>🚚 Delivery &amp; Payment Details:</strong><br><br>
          • <strong>Courier Charges:</strong> Kitabon ke actual parcel weight (wazan) ke mutabiq courier company ke standard rate par lagte hain.<br>
          • <strong>COD Fee:</strong> Cash on Delivery par 4% courier collection fee final bill mein add hoti hai.<br>
          • <strong>Delivery Time:</strong> Karachi mein 1-2 din, aur baqi tamam cities mein 2-4 working days mein deliver ho jata hai.<br><br>
          👉 Kisi specific order ke charges confirm karne ke liye aap <strong>👤 Talk to Live Agent</strong> bhi kar sakte hain.
        `);
        return;
      }

      // 6. WhatsApp & Contact Helpline
      if (q.includes('whatsapp') || q.includes('contact') || q.includes('helpline') || q.includes('phone') || q.includes('number') || q.includes('rabta') || q.includes('call')) {
        addBotMessage(`
          <strong>💬 Live WhatsApp Helpline:</strong><br>
          Aap direct hamare WhatsApp support par rabta kar ke bhi order place ya confirm kar sakte hain:<br><br>
          <a href="https://wa.me/923331310234?text=Assalam-o-Alaikum%20StudyPack%20I%20need%20help" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:#25D366; color:#fff; padding:8px 14px; border-radius:20px; font-weight:700; text-decoration:none; font-size:12.5px;">
            📱 Chat on WhatsApp
          </a>
        `);
        return;
      }

      // 7. School Courses & Syllabi
      if (q.includes('school') || q.includes('syllabus') || q.includes('course') || q.includes('educators') || q.includes('beaconhouse') || q.includes('city school') || q.includes('fps') || q.includes('karachi public')) {
        addBotMessage(`
          <strong>🎒 School Course Packs &amp; Syllabi:</strong><br>
          Hamare paas tamam top schools (The Educators, Beaconhouse, City School, Foundation Public, Habib Girls, Head Start, AMI waghaira) ke official course packs dastiyab hain.<br><br>
          👉 <a href="courses.html" style="color:#1565C0; font-weight:700;">Tamam School Course Packs Dekhein</a>
        `);
        return;
      }

      // 8. Search Catalog for Books, Toys, Stationery
      const catalog = typeof BOOKS !== 'undefined' ? BOOKS : (typeof SCRAPED_BOOKS !== 'undefined' ? SCRAPED_BOOKS : []);
      const ignoreWords = ['ki', 'ka', 'ke', 'ko', 'mai', 'in', 'of', 'for', 'book', 'books', 'the', 'a', 'an', 'kitab', 'kitabein', 'chahiye', 'hai', 'kahan', 'batao', 'dikhayein', 'dikhao', 'mujhe', 'karo'];
      const keywords = q.split(' ').filter(w => w.length > 1 && !ignoreWords.includes(w));
      
      let matched = [];
      if (keywords.length > 0) {
        matched = catalog.filter(b => {
          const str = `${b.title || ''} ${b.author || ''} ${b.pub || ''} ${b.cls || ''} ${b.subj || ''} ${b.category || ''}`.toLowerCase();
          return keywords.some(k => str.includes(k));
        });
      }

      if (matched.length > 0) {
        let cardsHtml = `Maine aapke liye <strong>${matched.length}</strong> items talaash kiye hain. Aap yahan se direct Cart mein add kar sakte hain:<br>`;
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

        if (matched.length > 3) {
          cardsHtml += `<div style="margin-top:8px; display:flex; justify-content:space-between; align-items:center;"><a href="books.html?q=${encodeURIComponent(keywords.join(' '))}" style="font-size:12px; color:#1565C0; font-weight:700;">🔍 Aur ${matched.length - 3} results dekhein</a> <button onclick="startLiveAgentFlow()" class="sp-chip" style="background:#1565C0; color:#fff; border:none; padding:4px 8px; font-size:11px;">👤 Live Agent</button></div>`;
        }

        addBotMessage(cardsHtml);
      } else {
        // Natural Conversational Fallback
        addBotMessage(`
          Main aapki baat samajh raha hoon, lekin exact matching product nikaalne ke liye thoda mazeed batayein (jaise class, subject ya publisher ka naam):<br><br>
          • Maslan: <em>"Oxford Countdown Class 5"</em> ya <em>"Grade 8 Science"</em><br><br>
          Ya aap hamare <strong>Live Agent</strong> se direct baat kar sakte hain:<br>
          <button onclick="startLiveAgentFlow()" class="sp-chip" style="background:#1565C0; color:#fff; border:none; margin-top:6px;">👤 Connect with Live Agent</button>
        `);
      }

    }, delay);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

})();
