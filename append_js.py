import os

js_code = """
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
"""

with open('assets/js/main.js', 'a', encoding='utf-8') as f:
    f.write(js_code)

print("Injected magnetic JS")
