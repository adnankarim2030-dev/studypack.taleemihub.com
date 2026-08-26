/* ========================================================
   STUDY PACK SMART AI CHATBOT ASSISTANT
   ======================================================== */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initChatbot();
  });

  function initChatbot() {
    if (document.getElementById('spChatWidget')) return;

    // Create Widget Container
    const widget = document.createElement('div');
    widget.id = 'spChatWidget';
    widget.className = 'sp-chat-widget';

    widget.innerHTML = `
      <div class="sp-chat-window" id="spChatWindow">
        <div class="sp-chat-header">
          <div class="sp-chat-header-info">
            <div class="sp-chat-avatar">
              <svg viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-8 8c0 2.5 1.1 4.7 3 6.2V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3.8c1.9-1.5 3-3.7 3-6.2a8 8 0 0 0-8-8z"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/><path d="M10 14h4"/></svg>
            </div>
            <div class="sp-chat-title">
              <h4>Study Pack AI Assistant</h4>
              <span>Online • Ready to help</span>
            </div>
          </div>
          <button class="sp-chat-close-btn" id="spChatClose" title="Close Chat">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="sp-chat-body" id="spChatBody">
          <div class="sp-msg bot">
            <div class="sp-bubble">
              Assalam-o-Alaikum! 👋 Main Study Pack ka Virtual Assistant hoon. Main aapki kya madad kar sakta hoon?
            </div>
            <span class="sp-msg-time">Just now</span>
          </div>

          <div class="sp-chat-chips" id="spChatChips">
            <button class="sp-chip" onclick="handleChipClick('Oxford Countdown')">📚 Oxford Books</button>
            <button class="sp-chip" onclick="handleChipClick('Delivery Charges')">🚚 Delivery & COD Rates</button>
            <button class="sp-chip" onclick="handleChipClick('Science Books')">🔬 Science & Maths</button>
            <button class="sp-chip" onclick="handleChipClick('Stationery')">✏️ Stationery Supplies</button>
            <button class="sp-chip" onclick="handleChipClick('WhatsApp Support')">💬 WhatsApp Helpline</button>
          </div>
        </div>

        <form class="sp-chat-footer" id="spChatForm">
          <input type="text" id="spChatInput" class="sp-chat-input" placeholder="Apna sawal ya book ka naam likhein..." autocomplete="off">
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

    // Toggle Chat Window
    const trigger = document.getElementById('spChatTrigger');
    const windowEl = document.getElementById('spChatWindow');
    const closeBtn = document.getElementById('spChatClose');
    const form = document.getElementById('spChatForm');
    const input = document.getElementById('spChatInput');

    trigger.addEventListener('click', () => {
      windowEl.classList.toggle('open');
      if (windowEl.classList.contains('open')) {
        input.focus();
      }
    });

    closeBtn.addEventListener('click', () => {
      windowEl.classList.remove('open');
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      
      addUserMessage(query);
      input.value = '';
      processUserQuery(query);
    });

    window.handleChipClick = function(text) {
      addUserMessage(text);
      processUserQuery(text);
    };
  }

  function addUserMessage(text) {
    const body = document.getElementById('spChatBody');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const msg = document.createElement('div');
    msg.className = 'sp-msg user';
    msg.innerHTML = `
      <div class="sp-bubble">${escapeHtml(text)}</div>
      <span class="sp-msg-time">${time}</span>
    `;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  function addBotMessage(htmlContent) {
    const body = document.getElementById('spChatBody');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const msg = document.createElement('div');
    msg.className = 'sp-msg bot';
    msg.innerHTML = `
      <div class="sp-bubble">${htmlContent}</div>
      <span class="sp-msg-time">${time}</span>
    `;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  function showTypingIndicator() {
    const body = document.getElementById('spChatBody');
    const typing = document.createElement('div');
    typing.id = 'spTyping';
    typing.className = 'sp-typing-indicator';
    typing.innerHTML = `
      <div class="sp-typing-dot"></div>
      <div class="sp-typing-dot"></div>
      <div class="sp-typing-dot"></div>
    `;
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

      // 1. Delivery / Shipping / COD queries
      if (q.includes('delivery') || q.includes('shipping') || q.includes('charges') || q.includes('wazan') || q.includes('weight') || q.includes('cod') || q.includes('cash on delivery')) {
        addBotMessage(`
          <strong>🚚 Delivery & Payment Info:</strong><br>
          • <strong>Delivery Charges:</strong> Kitabon ke actual parcel weight (wazan) ke mutabiq courier rate par calculate hotay hain.<br>
          • <strong>COD Charges:</strong> Cash on Delivery par 4% courier transfer fee final invoice par lagti hai.<br>
          • <strong>Delivery Time:</strong> Karachi mein 1-2 din, aur pure Pakistan mein 2-4 working days mein parcel mil jata hai.
        `);
        return;
      }

      // 2. WhatsApp / Contact / Helpline
      if (q.includes('whatsapp') || q.includes('contact') || q.includes('number') || q.includes('call') || q.includes('helpline') || q.includes('phone') || q.includes('rabta')) {
        addBotMessage(`
          <strong>💬 Live WhatsApp Support:</strong><br>
          Aap hamare WhatsApp par direct order confirm kar sakte hain ya kisi bhi book ki maloomat le sakte hain:<br><br>
          <a href="https://wa.me/923000000000?text=Assalam-o-Alaikum%20StudyPack%20I%20need%20help" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:#25D366; color:#fff; padding:8px 14px; border-radius:20px; font-weight:700; text-decoration:none; font-size:12.5px;">
            📱 Chat on WhatsApp
          </a>
        `);
        return;
      }

      // 3. School syllabus / Courses
      if (q.includes('school') || q.includes('syllabus') || q.includes('course') || q.includes('educators') || q.includes('beaconhouse') || q.includes('city school') || q.includes('fps')) {
        addBotMessage(`
          <strong>🎒 School Course Syllabi:</strong><br>
          Hamare paas tamam major schools (The Educators, Beaconhouse, City School, Foundation Public, Next School waghaira) ke mukammal book packs dastiyab hain.<br><br>
          👉 <a href="courses.html" style="color:#1565C0; font-weight:700;">Courses & School Syllabi Dekhein</a>
        `);
        return;
      }

      // 4. Search within Catalog (Books, Toys, Stationery)
      const catalog = typeof BOOKS !== 'undefined' ? BOOKS : (typeof SCRAPED_BOOKS !== 'undefined' ? SCRAPED_BOOKS : []);
      const ignoreWords = ['ki', 'ka', 'ke', 'ko', 'mai', 'in', 'of', 'for', 'book', 'books', 'the', 'a', 'an', 'kitab', 'kitabein', 'chahiye', 'hai', 'kahan'];
      const keywords = q.split(' ').filter(w => w.length > 1 && !ignoreWords.includes(w));
      
      let matched = [];
      if (keywords.length > 0) {
        matched = catalog.filter(b => {
          const str = `${b.title || ''} ${b.author || ''} ${b.pub || ''} ${b.cls || ''} ${b.subj || ''} ${b.category || ''}`.toLowerCase();
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

        if (matched.length > 3) {
          cardsHtml += `<div style="margin-top:8px; text-align:center;"><a href="books.html?q=${encodeURIComponent(keywords.join(' '))}" style="font-size:12px; color:#1565C0; font-weight:700;">+ Aur ${matched.length - 3} items dekhein</a></div>`;
        }

        addBotMessage(cardsHtml);
      } else {
        // Fallback default message
        addBotMessage(`
          Aapki talash ke mutabiq <strong>"${escapeHtml(query)}"</strong> ki direct matching nahi mili. Aap hamare Catalog mein search kar sakte hain ya direct WhatsApp par rabta kar sakte hain:<br><br>
          <a href="books.html?q=${encodeURIComponent(query)}" style="color:#1565C0; font-weight:700; font-size:12.5px;">🔍 Search in Books Catalog</a> | 
          <a href="https://wa.me/923000000000" target="_blank" style="color:#25D366; font-weight:700; font-size:12.5px;">💬 WhatsApp Helpline</a>
        `);
      }

    }, 450);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

})();
