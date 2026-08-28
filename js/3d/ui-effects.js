/**
 * ui-effects.js
 * Premium UI effects: scroll reveal animations,
 * magnetic buttons, mouse-follow glow cards,
 * and 3D button interactions.
 * Applied progressively — only enhances, never blocks.
 * Mobile-optimized: skips mouse-only effects on touch devices.
 */
import { init3DButtons } from "./3d-buttons.js";

export function initUiEffects() {
  initScrollReveal();
  initMagneticButtons();
  initGlowCards();
  init3DButtons();
}

/* ── Device detection ─────────────────────── */
function isTouchDevice() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || (navigator.maxTouchPoints > 0 && window.innerWidth < 900)
  );
}

/* ── Scroll reveal ─────────────────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  // Respect reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((el) => el.classList.add("visible"));
    return;
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    elements.forEach((el) => observer.observe(el));
  } else {
    // Fallback
    elements.forEach((el) => el.classList.add("visible"));
  }
}

/* ── Magnetic buttons (desktop only) ───────── */
function initMagneticButtons() {
  // Skip on touch devices — no mouse to track
  if (isTouchDevice()) return;

  const buttons = document.querySelectorAll(".magnetic-btn");
  if (!buttons.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  buttons.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const strength = 0.25;
      btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translate(0, 0)";
    });
  });
}

/* ── Mouse-follow glow cards (desktop only) ── */
function initGlowCards() {
  // Skip on touch devices — no mouse to track
  if (isTouchDevice()) return;

  const cards = document.querySelectorAll(".glow-card");
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mouse-x", `${x}%`);
      card.style.setProperty("--mouse-y", `${y}%`);
    });
  });
}

export default initUiEffects;