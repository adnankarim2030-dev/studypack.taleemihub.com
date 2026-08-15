document.addEventListener('DOMContentLoaded', () => {
    // Auth is handled by index.html loginScreen now
    
    // Initialize Data
    initFirebaseListeners();

    // Theme Toggle
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        // Check saved theme
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeBtn.innerHTML = '<i data-lucide="sun"></i>';
        }

        themeBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            if (current === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeBtn.innerHTML = '<i data-lucide="moon"></i>';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeBtn.innerHTML = '<i data-lucide="sun"></i>';
            }
            lucide.createIcons();
            // Re-render charts for dark mode colors
            if (window.renderCharts) window.renderCharts();
        });
    }

    // Sidebar Toggle (Mobile)
    const menuBtn = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Navigation Routing
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    function switchView(viewId) {
        navItems.forEach(n => n.classList.remove('active'));
        viewSections.forEach(v => v.classList.remove('active'));
        
        const targetNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        if (targetNav) targetNav.classList.add('active');
        
        const targetView = document.getElementById(viewId);
        if (targetView) targetView.classList.add('active');
        
        // Mobile close sidebar
        if (window.innerWidth <= 1024 && sidebar) {
            sidebar.classList.remove('open');
        }

        // Trigger view-specific renders
        if (viewId === 'dashboard' && window.updateDashboardStats) window.updateDashboardStats();
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(item.dataset.view);
        });
    });

    // Initialize Icons
    lucide.createIcons();
});

// Helper for formatting money
window.money = (n) => 'PKR ' + Number(n||0).toLocaleString();
