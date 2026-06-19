@import "tailwindcss";

/* Tailwind CSS 4 Theme Configuration */
@theme {
  --font-display: "Playfair Display", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-vintage: "Cormorant Garamond", Georgia, serif;

  --color-velvet-red: #8B1E2D;
  --color-cream: #FFF5E6;
  --color-soft-beige: #EADCC6;
  --color-red-velvet: #B0303A;
  --color-dark-chocolate: #4A2C2A;
  --color-accent-primary: #8B1E2D;
  --color-accent-secondary: #C5A55A;
  --color-success: #3C6E47;
  --color-error: #A23B3B;
  --color-obsidian: #1E1E24;
  --color-gold: #C9A96E;
  --color-gold-dark: #B8954F;
  --color-rose: #B76D68;
  --color-sage-light: #A3B5A8;

  --animate-fade-in: fadeIn 0.8s ease-out forwards;
  --animate-slide-up: slideUp 0.8s ease-out forwards;
  --animate-scale-in: scaleIn 0.6s ease-out forwards;
  --animate-pulse-soft: pulseSoft 3s ease-in-out infinite;
  --animate-drawer-slide: drawerSlideIn 0.38s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  --animate-backdrop-fade: backdropFadeIn 0.3s ease-out forwards;
  --animate-coin-pulse: coinPulse 0.5s ease-out;
  --animate-check-draw: checkDraw 0.8s ease-out forwards;
  --animate-skeleton: skeleton 1.5s ease-in-out infinite;
  --animate-bounce-cart: bounceCart 0.4s ease-out;
  --animate-float-gentle: floatGentle 5s ease-in-out infinite;
}

/* Dark mode variant for class-based strategy */
@custom-variant dark (&:where(.dark, .dark *));

/* Keyframes */
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes pulseSoft {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes drawerSlideIn {
  0% { opacity: 0; transform: translateX(-100%); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes backdropFadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes coinPulse {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes checkDraw {
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
}

@keyframes skeleton {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes bounceCart {
  0% { transform: scale(1); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); }
}

@keyframes floatGentle {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes slideOut {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-100%); }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes cartSlideIn {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes loaderBounce {
  0%, 80%, 100% { transform: scale(0.3); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

@keyframes floatUp {
  0% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
  20% { opacity: 0.35; }
  80% { opacity: 0.3; }
  100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
}

@keyframes sparkleDrift {
  0% { transform: translate(0, 0) scale(0.2); opacity: 0; }
  10% { opacity: 0.8; transform: translate(2vw, -2vh) scale(1); }
  50% { opacity: 1; transform: translate(10vw, -15vh) scale(1.2); }
  90% { opacity: 0.3; transform: translate(20vw, -25vh) scale(0.7); }
  100% { transform: translate(30vw, -35vh) scale(0); opacity: 0; }
}

@keyframes checkCircle {
  from { stroke-dashoffset: 166; }
  to { stroke-dashoffset: 0; }
}

@keyframes checkCheck {
  from { stroke-dashoffset: 48; }
  to { stroke-dashoffset: 0; }
}

/* Base styles */
* {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  transition: background-color 0.5s, color 0.5s;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

.font-display {
  font-family: 'Playfair Display', Georgia, serif;
}

/* Glass effects */
.glass {
  background: rgba(255, 245, 230, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 245, 230, 0.6);
}

.dark .glass {
  background: rgba(74, 44, 42, 0.7);
  border: 1px solid rgba(234, 220, 198, 0.15);
}

.glass-card {
  background: rgba(255, 245, 230, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 245, 230, 0.4);
  transition: all 0.4s;
}

.dark .glass-card {
  background: rgba(74, 44, 42, 0.6);
  border: 1px solid rgba(234, 220, 198, 0.15);
}

.glass-card:hover {
  background: rgba(255, 245, 230, 0.8);
  transform: translateY(-4px);
}

/* Masonry grid */
.masonry-grid {
  column-count: 3;
  column-gap: 1.5rem;
}

@media (max-width: 1024px) {
  .masonry-grid {
    column-count: 2;
  }
}

@media (max-width: 640px) {
  .masonry-grid {
    column-count: 1;
  }
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 1.5rem;
}

/* Image hover zoom */
.image-hover-zoom {
  overflow: hidden;
}

.image-hover-zoom img {
  transition: transform 0.7s;
}

.image-hover-zoom:hover img {
  transform: scale(1.08);
}

/* Loading screen */
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s;
}

.loading-screen.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.loader-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #B0303A;
  animation: loaderBounce 1.4s infinite;
}

.loader-dot:nth-child(1) { animation-delay: -0.32s; }
.loader-dot:nth-child(2) { animation-delay: -0.16s; }

/* Floating items */
.floating-item {
  position: fixed;
  bottom: -40px;
  font-size: 2.5rem;
  opacity: 0.25;
  pointer-events: none;
  z-index: 0;
  animation: floatUp 8s infinite linear;
  color: #8B1E2D;
}

.dark .floating-item {
  opacity: 0.15;
  color: #C5A55A;
}

/* Matte glossy background */
.matte-glossy-bg {
  background: radial-gradient(circle at 30% 40%, #3a1e1c 0%, #0d0707 45%, #000000 100%);
}

/* Sparkle dot */
.sparkle-dot {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #8B1E2D 0%, #4A2C2A 80%);
  box-shadow: 0 0 6px rgba(176, 48, 58, 0.5);
  opacity: 0;
  animation: sparkleDrift 8s infinite;
  pointer-events: none;
}

/* Custom cursor */
.custom-cursor {
  position: fixed;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #8B1E2D;
  mix-blend-mode: difference;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: transform 0.1s;
}

.custom-cursor.hover {
  transform: translate(-50%, -50%) scale(1.5);
}

@media (hover: none) and (pointer: coarse) {
  .custom-cursor {
    display: none;
  }
}

/* Category tag */
.category-tag {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Menu item */
.menu-item-bar {
  background-color: #FAF9F6;
  transition: background 0.2s;
}

.dark .menu-item-bar {
  background-color: #2d221f;
}

/* Add to cart button */
.add-to-cart-btn {
  background-color: #FAF9F6 !important;
  color: #4A2C2A !important;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.add-to-cart-btn:hover {
  background-color: #e9e5da !important;
  transform: scale(0.96);
}

.dark .add-to-cart-btn {
  background-color: #3e2e2a !important;
  color: #FAF9F6 !important;
  border-color: #5a3e38;
}

/* Menu item title */
.menu-item-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 700;
  font-size: 1.2rem;
}

/* Drawer animations */
.drawer-enter {
  animation: drawerSlideIn 0.38s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}

.drawer-exit {
  animation: slideOut 0.28s ease-in forwards;
}

.backdrop-enter {
  animation: backdropFadeIn 0.3s ease-out forwards;
}

.backdrop-exit {
  animation: fadeOut 0.25s ease-in forwards;
}

.cart-drawer-enter {
  animation: cartSlideIn 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
}

/* Spinner */
.spinner {
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

/* Cart text styles */
.cart-hd-text {
  font-weight: 600;
  letter-spacing: -0.01em;
}

.cart-total-hd {
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* Hamburger */
.hamburger-icon {
  width: 24px;
  height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
}

.hamburger-line {
  width: 100%;
  height: 2px;
  background-color: currentColor;
  border-radius: 2px;
  transition: all 0.2s;
}

/* Slim sidebar */
.slim-sidebar {
  width: 280px;
  max-width: 85vw;
}

/* Testimonials */
.testimonial-track {
  display: flex;
  transition: transform 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}

.testimonial-slide {
  flex: 0 0 100%;
  padding: 0 1rem;
}

/* Dots */
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #EADCC6;
  transition: all 0.3s;
  cursor: pointer;
}

.dot.active {
  background: #8B1E2D;
  width: 32px;
}

.dark .dot {
  background: #5a4a42;
}

.dark .dot.active {
  background: #C5A55A;
}

/* Checkmark animation */
.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: checkCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: checkCheck 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
}

/* Float frame */
.float-frame {
  animation: floatGentle 5s ease-in-out infinite;
}

/* Hero text shadow */
.hero-text-shadow {
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
}

/* Skeleton loading */
.skeleton-box {
  background: linear-gradient(90deg, #f0e6d3 25%, #fff 50%, #f0e6d3 75%);
  background-size: 200% 100%;
  animation: skeleton 1.5s infinite;
}

.dark .skeleton-box {
  background: linear-gradient(90deg, #2d221f 25%, #4a2c2a 50%, #2d221f 75%);
  background-size: 200% 100%;
}

.confirm-check-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
