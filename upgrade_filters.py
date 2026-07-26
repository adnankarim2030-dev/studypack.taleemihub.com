import re

html_replacement = """<aside class="filter-card reveal" id="filterCard" style="background: rgba(255,255,255,0.4); border: none; padding: 0;">
        <div class="fc-head" style="padding: 24px 24px 10px 24px;">
          <h4 style="margin: 0; font-size: 22px; font-weight: 700; color: var(--navy);">Filters</h4>
          <button class="icon-btn" id="closeFilterMobile" style="display: none;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
        </div>
        
        <div style="padding: 0 24px;">
          <div class="fc-search">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
             <input type="text" id="filterSearch" placeholder="Search subjects...">
          </div>

          <div class="accordion-item active">
            <div class="acc-head">Class / Level <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="acc-arrow"><path d="m6 9 6 6 6-6"/></svg></div>
            <div class="acc-body">
              <label class="glass-check"><input type="checkbox" class="f-cls" value="all" checked> <span class="chk-box"></span> All Levels</label>
              <label class="glass-check"><input type="checkbox" class="f-cls" value="Class"> <span class="chk-box"></span> School (Class 1-10)</label>
              <label class="glass-check"><input type="checkbox" class="f-cls" value="FSC"> <span class="chk-box"></span> FSC / Intermediate</label>
              <label class="glass-check"><input type="checkbox" class="f-cls" value="Level"> <span class="chk-box"></span> O &amp; A Level</label>
              <label class="glass-check"><input type="checkbox" class="f-cls" value="Entry"> <span class="chk-box"></span> Entry Test</label>
            </div>
          </div>

          <div class="accordion-item">
            <div class="acc-head">Oxford Books <span class="acc-badge">0</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="acc-arrow"><path d="m6 9 6 6 6-6"/></svg></div>
            <div class="acc-body">
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Oxford Math"> <span class="chk-box"></span> Math</label>
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Oxford English"> <span class="chk-box"></span> English</label>
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Oxford Science"> <span class="chk-box"></span> Science</label>
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Oxford Urdu"> <span class="chk-box"></span> Urdu</label>
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Oxford Islamiyat"> <span class="chk-box"></span> Islamiyat</label>
            </div>
          </div>

          <div class="accordion-item">
            <div class="acc-head">Cambridge Books <span class="acc-badge">0</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="acc-arrow"><path d="m6 9 6 6 6-6"/></svg></div>
            <div class="acc-body">
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Cambridge Math"> <span class="chk-box"></span> Math</label>
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Cambridge English"> <span class="chk-box"></span> English</label>
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Cambridge Science"> <span class="chk-box"></span> Science</label>
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Cambridge Urdu"> <span class="chk-box"></span> Urdu</label>
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Cambridge Islamiyat"> <span class="chk-box"></span> Islamiyat</label>
            </div>
          </div>

          <div class="accordion-item">
            <div class="acc-head">Paramount Books <span class="acc-badge">0</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="acc-arrow"><path d="m6 9 6 6 6-6"/></svg></div>
            <div class="acc-body">
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Paramount Math"> <span class="chk-box"></span> Math</label>
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Paramount English"> <span class="chk-box"></span> English</label>
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Paramount Science"> <span class="chk-box"></span> Science</label>
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Paramount Urdu"> <span class="chk-box"></span> Urdu</label>
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Paramount Islamiyat"> <span class="chk-box"></span> Islamiyat</label>
              <label class="glass-check"><input type="checkbox" class="f-subj" value="Paramount Computer"> <span class="chk-box"></span> Computer</label>
            </div>
          </div>

          <div class="accordion-item">
            <div class="acc-head">Price Range <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="acc-arrow"><path d="m6 9 6 6 6-6"/></svg></div>
            <div class="acc-body">
              <div class="price-range"><input type="range" id="priceRange" min="500" max="3000" step="50" value="3000"></div>
              <div class="price-range-vals"><span>Rs 500</span><span id="priceVal">Rs 3,000</span></div>
            </div>
          </div>

          <div class="accordion-item">
            <div class="acc-head">Availability <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="acc-arrow"><path d="m6 9 6 6 6-6"/></svg></div>
            <div class="acc-body">
              <label class="glass-check"><input type="checkbox" id="inStockOnly"> <span class="chk-box"></span> In Stock Only</label>
            </div>
          </div>
        </div>

        <div style="padding: 10px 24px 24px 24px;">
          <button class="btn-clear-filter" id="clearFilters" style="width: 100%; margin-top: 10px;">Clear All Filters</button>
        </div>
      </aside>"""

css_patch = """
/* Glass Accordion Filter Panel */
.fc-head { display: flex; align-items: center; justify-content: space-between; }
@media (max-width: 900px) { #closeFilterMobile { display: flex !important; } }

.fc-search {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.7); backdrop-filter: blur(8px);
  border: 1px solid rgba(0,0,0,0.08); border-radius: 12px;
  padding: 12px 14px; margin-bottom: 24px;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.03);
}
.fc-search svg { width: 18px; height: 18px; color: #888; }
.fc-search input { border: none; background: transparent; outline: none; flex: 1; font-family: var(--ff-body); font-size: 14px;}

.accordion-item {
  background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 14px;
  margin-bottom: 14px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,1);
  overflow: hidden; transition: all 0.3s ease;
}
.accordion-item:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,1);
  transform: translateY(-1px);
}
.acc-head {
  padding: 14px 16px; cursor: pointer; font-weight: 600; color: var(--navy);
  display: flex; align-items: center; justify-content: space-between;
  user-select: none; position: relative; z-index: 2; font-size: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
}
.acc-badge {
  background: var(--blue); color: #fff; font-size: 11px; padding: 2px 7px;
  border-radius: 10px; font-weight: 700; opacity: 0; transition: 0.3s;
  margin-left: auto; margin-right: 8px;
}
.acc-badge.show { opacity: 1; }
.acc-arrow { width: 18px; height: 18px; transition: 0.3s; color: #666; }
.accordion-item.active .acc-arrow { transform: rotate(180deg); color: var(--blue); }

.acc-body {
  padding: 0 16px; max-height: 0; opacity: 0; visibility: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.accordion-item.active .acc-body {
  padding: 0 16px 16px 16px; max-height: 500px; opacity: 1; visibility: visible;
}

/* Glass Checkboxes */
.glass-check {
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  padding: 8px 10px; margin-bottom: 4px; border-radius: 8px;
  transition: 0.3s; font-size: 13.5px; color: var(--ink);
}
.glass-check:hover { background: rgba(25, 118, 210, 0.05); color: var(--blue); }
.glass-check input { display: none; }
.chk-box {
  width: 18px; height: 18px; border-radius: 5px; flex-shrink:0;
  border: 1.5px solid #c2c9d6; background: rgba(255,255,255,0.9);
  display: flex; align-items: center; justify-content: center;
  transition: 0.3s; position: relative;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}
.glass-check input:checked + .chk-box {
  background: var(--blue); border-color: var(--blue);
  box-shadow: 0 0 10px rgba(25,118,210,0.4);
}
.glass-check input:checked + .chk-box::after {
  content: ''; width: 4px; height: 8px; border: solid white;
  border-width: 0 2px 2px 0; transform: rotate(45deg); margin-bottom: 2px;
}
"""

js_patch = """
<!-- Accordion JS -->
<script>
document.addEventListener("DOMContentLoaded", function() {
  const accHeads = document.querySelectorAll(".acc-head");
  accHeads.forEach(head => {
    head.addEventListener("click", function() {
      const parent = this.parentElement;
      parent.classList.toggle("active");
    });
  });

  const filterSearch = document.getElementById("filterSearch");
  if(filterSearch) {
    filterSearch.addEventListener("input", function(e) {
      const val = e.target.value.toLowerCase();
      const labels = document.querySelectorAll(".acc-body .glass-check");
      labels.forEach(label => {
        if(label.innerText.toLowerCase().includes(val)) {
          label.style.display = "flex";
        } else {
          label.style.display = "none";
        }
      });
    });
  }
  
  const checkBoxes = document.querySelectorAll(".glass-check input");
  checkBoxes.forEach(cb => {
    cb.addEventListener("change", function() {
      const parentAcc = this.closest(".accordion-item");
      if(parentAcc) {
        const badge = parentAcc.querySelector(".acc-badge");
        if(badge) {
          const checkedCount = parentAcc.querySelectorAll("input:checked:not([value='all'])").length;
          badge.innerText = checkedCount;
          if(checkedCount > 0) badge.classList.add("show");
          else badge.classList.remove("show");
        }
      }
    });
  });
  
  const closeFilterMobile = document.getElementById("closeFilterMobile");
  if(closeFilterMobile) {
    closeFilterMobile.addEventListener("click", () => {
      const card = document.getElementById("filterCard");
      if(card) card.classList.remove("show");
    });
  }
});
</script>
"""

with open("books.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace aside filterCard
content = re.sub(r'<aside class="filter-card reveal" id="filterCard">.*?</aside>', html_replacement, content, flags=re.DOTALL)

# Insert JS before </body>
content = content.replace("</body>", js_patch + "\\n</body>")

with open("books.html", "w", encoding="utf-8") as f:
    f.write(content)

with open("assets/css/global.css", "a", encoding="utf-8") as f:
    f.write("\\n" + css_patch + "\\n")

print("Filter panel successfully upgraded.")
