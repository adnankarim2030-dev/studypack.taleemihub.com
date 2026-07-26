import os

advanced_css = """
/* ================= ULTRA PREMIUM 3D BENTO OVERHAUL ================= */
.bento {
  perspective: 1500px;
  transform-style: preserve-3d;
}

/* Reset previous simple 3D */
.bento.reveal.in .cat-card:hover {
  transform: none; box-shadow: none; z-index: initial;
}
.bento.reveal.in .cat-card:hover::after { background: none; }

.cat-card {
  --mouse-x: 50%;
  --mouse-y: 50%;
  --rotateX: 0deg;
  --rotateY: 0deg;
  position: relative;
  border-radius: var(--radius);
  padding: 0;
  color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s ease;
  transform: perspective(1500px) rotateX(var(--rotateX)) rotateY(var(--rotateY)) scale3d(1, 1, 1);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3);
  background: transparent !important; /* Move background to border/glare layers */
  z-index: 1;
}

/* Magnetic Hover Active State */
.cat-card.hover-active {
  transform: perspective(1500px) rotateX(var(--rotateX)) rotateY(var(--rotateY)) scale3d(1.04, 1.04, 1.04);
  box-shadow: 0 30px 60px -15px rgba(0,0,0,0.4), 0 20px 40px -20px rgba(0,0,0,0.3);
  z-index: 10;
}

/* Card Backgrounds applied to the border layer */
.cat-card .card-border {
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  z-index: -2;
  transition: opacity 0.4s ease;
}
.cat-card.c1 .card-border { background: linear-gradient(150deg, #1e88e5, var(--blue-dark)); }
.cat-card.c2 .card-border { background: linear-gradient(150deg, var(--orange), #c94e00); }
.cat-card.c3 .card-border { background: linear-gradient(150deg, #26a69a, #00695c); }
.cat-card.c4 .card-border { background: linear-gradient(150deg, var(--gold), #e08e00); }
.cat-card.c5 .card-border { background: linear-gradient(150deg, #8e63e0, #5e35b1); }
.cat-card.c6 .card-border { background: linear-gradient(150deg, #ec407a, #ad1457); }
.cat-card.c7 .card-border { background: linear-gradient(150deg, #42a5f5, #1565c0); }
.cat-card.c8 .card-border { background: linear-gradient(150deg, #455a64, var(--navy)); }
.cat-card.c9 .card-border { background: linear-gradient(150deg, #ff8a65, #e64a19); }

/* Dynamic Border Glow */
.cat-card .card-border::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: calc(var(--radius) + 2px);
  background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.6), transparent 40%);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s;
}
.cat-card.hover-active .card-border::before {
  opacity: 1;
}

/* Internal Inner Background for Glassmorphism */
.cat-card .card-border::after {
  content: "";
  position: absolute;
  inset: 1px; /* create a 1px border */
  border-radius: calc(var(--radius) - 1px);
  background: inherit;
  z-index: 0;
}

/* Glare Layer */
.cat-card .card-glare {
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.4), transparent 40%);
  opacity: 0;
  z-index: -1;
  mix-blend-mode: overlay;
  transition: opacity 0.4s;
}
.cat-card.hover-active .card-glare {
  opacity: 1;
}

/* Card Content Parallax */
.cat-card .card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  pointer-events: none;
  transform: translateZ(30px);
  transition: transform 0.4s ease;
}
.cat-card.hover-active .card-content {
  transform: translateZ(50px);
}

/* Animated Arrow */
.cat-card .card-arrow {
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translate(-10px, 10px) scale(0.8);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.cat-card.hover-active .card-arrow {
  opacity: 1;
  transform: translate(0, 0) scale(1);
}
.cat-card .card-arrow svg {
  width: 16px;
  height: 16px;
  color: #fff;
}
.cat-card.c4 .card-arrow svg { color: var(--navy); }

/* Icon Morph & Bounce */
.cat-card .ic {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center center;
}
.cat-card.hover-active .ic {
  transform: scale(1.15) rotate(-5deg);
  background: rgba(255,255,255,0.3);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}
.cat-card.c4.hover-active .ic { background: rgba(11,18,32,0.2); }

/* Ripple Effect */
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  transform: scale(0);
  animation: rippleAnim 0.6s linear;
  pointer-events: none;
  width: 100px;
  height: 100px;
  margin-top: -50px;
  margin-left: -50px;
  z-index: 5;
}
@keyframes rippleAnim {
  to { transform: scale(4); opacity: 0; }
}

/* Override existing entrance animations */
.bento.reveal.in .cat-card {
  animation: bentoPremiumPop 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes bentoPremiumPop {
  0% { opacity: 0; transform: translateY(80px) rotateX(20deg) scale(0.8); box-shadow: none; }
  100% { opacity: 1; transform: translateY(0) rotateX(0deg) scale(1); }
}

/* Stagger adjustments */
.bento.reveal.in .cat-card:nth-child(1) { animation-delay: 0.1s; }
.bento.reveal.in .cat-card:nth-child(2) { animation-delay: 0.2s; }
.bento.reveal.in .cat-card:nth-child(3) { animation-delay: 0.3s; }
.bento.reveal.in .cat-card:nth-child(4) { animation-delay: 0.4s; }
.bento.reveal.in .cat-card:nth-child(5) { animation-delay: 0.5s; }
.bento.reveal.in .cat-card:nth-child(6) { animation-delay: 0.6s; }

/* Desktop-only constraint for heavy 3D */
@media (max-width: 768px) {
  .cat-card {
    transform: none !important;
  }
  .cat-card .card-content {
    transform: none !important;
  }
}
"""

with open('assets/css/global.css', 'a', encoding='utf-8') as f:
    f.write(advanced_css)
print("Injected ultra premium CSS")
