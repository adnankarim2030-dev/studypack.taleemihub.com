import os

new_css = """
/* ============ ADVANCED 3D BENTO ANIMATION ============ */
.bento {
  perspective: 1200px;
}
.bento .cat-card {
  opacity: 0;
  transform: translateY(60px) rotateX(15deg) scale(0.9);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
  transform-style: preserve-3d;
}
.bento.reveal.in .cat-card {
  animation: bentoPopIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
.bento.reveal.in .cat-card:nth-child(1) { animation-delay: 0.1s; }
.bento.reveal.in .cat-card:nth-child(2) { animation-delay: 0.2s; }
.bento.reveal.in .cat-card:nth-child(3) { animation-delay: 0.3s; }
.bento.reveal.in .cat-card:nth-child(4) { animation-delay: 0.4s; }
.bento.reveal.in .cat-card:nth-child(5) { animation-delay: 0.5s; }
.bento.reveal.in .cat-card:nth-child(6) { animation-delay: 0.6s; }

@keyframes bentoPopIn {
  0% { opacity: 0; transform: translateY(60px) rotateX(15deg) scale(0.9); }
  100% { opacity: 1; transform: translateY(0) rotateX(0) scale(1); }
}

/* Override the standard hover for 3D effect */
.bento.reveal.in .cat-card:hover {
  transform: translateY(-10px) rotateX(4deg) rotateY(-4deg) scale(1.05);
  box-shadow: -10px 20px 40px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.3);
  z-index: 10;
}
"""

with open('assets/css/global.css', 'a', encoding='utf-8') as f:
    f.write(new_css)

print('Added advanced 3D animations to global.css')
