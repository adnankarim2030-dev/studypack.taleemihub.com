/* ============ FIREBASE INTEGRATION ============ */
let BOOKS = [];
let TOYS = [];
let STATIONERY = [];
let EBOOKS = [];
let COUPONS = [];
let CATEGORIES = [];
let BRANDS = [];

try {
    const firebaseConfig = {
        apiKey: "AIzaSyD3cl7bxjuLoILxck4di-w6fLw4aRXHb9M",
        authDomain: "study-pack-store.firebaseapp.com",
        projectId: "study-pack-store",
        storageBucket: "study-pack-store.firebasestorage.app",
        messagingSenderId: "346606609514",
        appId: "1:346606609514:web:31ca9e21967e6b1d4f5613"
    };
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    db.collection('products').onSnapshot(snapshot => {
        BOOKS = snapshot.docs.map(doc => doc.data());
        TOYS = BOOKS.filter(b => {
            const cat = String(b.category || b.cats || '').toLowerCase();
            const typ = String(b.type || '').toLowerCase();
            const subj = String(b.subj || '').toLowerCase();
            const title = String(b.title || '').toLowerCase();
            const cls = Array.isArray(b.cls) ? b.cls.join(' ').toLowerCase() : String(b.cls || '').toLowerCase();
            const str = cat + ' ' + typ + ' ' + subj + ' ' + title + ' ' + cls;
            return /(toy|super car)/i.test(str);
        });
        if (typeof SCRAPED_TOYS !== 'undefined') {
            TOYS = [...TOYS, ...SCRAPED_TOYS];
        }
        STATIONERY = BOOKS.filter(b => {
            const cat = String(b.category || b.cats || '').toLowerCase();
            const typ = String(b.type || '').toLowerCase();
            const subj = String(b.subj || '').toLowerCase();
            const title = String(b.title || '').toLowerCase();
            const cls = Array.isArray(b.cls) ? b.cls.join(' ').toLowerCase() : String(b.cls || '').toLowerCase();
            const str = cat + ' ' + typ + ' ' + subj + ' ' + title + ' ' + cls;
            return /((stationery|stationary))/i.test(str);
        });
        if (typeof SCRAPED_STATIONERY !== 'undefined') {
            STATIONERY = [...STATIONERY, ...SCRAPED_STATIONERY];
        }
        NOVELS = BOOKS.filter(b => String(b.category||b.cats||'').toLowerCase().includes('novel') || String(b.type||'').toLowerCase().includes('novel'));
        
        if (typeof SCRAPED_BOOKS !== 'undefined') {
            BOOKS = [...BOOKS, ...SCRAPED_BOOKS];
        }
        if (typeof SCRAPED_TOYS !== 'undefined') {
            BOOKS = [...BOOKS, ...SCRAPED_TOYS];
        }
        if (typeof SCRAPED_STATIONERY !== 'undefined') {
            BOOKS = [...BOOKS, ...SCRAPED_STATIONERY];
        }
        if (typeof SCRAPED_COURSES !== 'undefined') {
            BOOKS = [...BOOKS, ...SCRAPED_COURSES];
        }
        
        console.log('Firebase products loaded: ', BOOKS.length);
        
        // Dispatch event for other scripts
        window.dispatchEvent(new Event('firebaseProductsLoaded'));

        // Re-render UI based on page
        if(typeof applyFilters === 'function') applyFilters(); // books.html
        if(typeof renderCategories === 'function') renderCategories();
        if(typeof renderFeatured === 'function') renderFeatured(); // index.html
        if(typeof renderAll === 'function') renderAll();
        if(typeof renderProductDetails === 'function') renderProductDetails(); // book-details.html

        // Fade out preloader
        const pre = document.getElementById('preloader');
        if(pre) {
            pre.style.opacity = '0';
            setTimeout(() => pre.style.display = 'none', 500);
        }
    });
} catch(e) {
    console.error('Firebase error:', e);
}

function findItem(id){ return BOOKS.find(x=>x.id===id) || EBOOKS.find(x=>x.id===id) || STATIONERY.find(x=>x.id===id) || TOYS.find(x=>x.id===id); }

/* ================= ADVANCED 3D MAGNETIC HOVER ================= */
document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".cat-card");
    
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate rotation (max 12 degrees)
            const rotateX = ((y - centerY) / centerY) * -12;
            const rotateY = ((x - centerX) / centerX) * 12;
            
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
            card.style.setProperty("--rotateX", `${rotateX}deg`);
            card.style.setProperty("--rotateY", `${rotateY}deg`);
        });
        
        card.addEventListener("mouseenter", () => {
            card.classList.add("hover-active");
            setTimeout(() => { card.style.transition = "none"; }, 300);
        });
        
        card.addEventListener("mouseleave", () => {
            card.classList.remove("hover-active");
            card.style.transition = "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.5s ease";
            card.style.setProperty("--rotateX", "0deg");
            card.style.setProperty("--rotateY", "0deg");
        });
        
        // Ripple effect on click
        card.addEventListener("mousedown", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement("span");
            ripple.classList.add("ripple");
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            card.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});


/* ============ OVERRIDE WITH ADMIN LOCALSTORAGE ============ */
try {
    const adminProducts = JSON.parse(localStorage.getItem('edubooks_products'));
    if (adminProducts && adminProducts.books && adminProducts.books.length > 0) {
        BOOKS = adminProducts.books;
    }
} catch(e){}
