/**
 * card-parallax.js
 * Subtle 3D mouse-movement parallax for the login card.
 * - Horizontal mouse movement rotates the card on Y-axis
 * - Vertical mouse movement rotates it on X-axis
 * - Extremely subtle, smooth easing via requestAnimationFrame
 * - Returns smoothly to rest on mouse leave
 * - Desktop-only: disabled on touch devices & reduced-motion
 */
export function initCardParallax() {
  const card =
    document.querySelector(".login-card") ||
    document.querySelector(".register-card");
  if (!card) return;

  // Skip on touch devices — no mouse to track
  const isTouch =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || (navigator.maxTouchPoints > 0 && window.innerWidth < 900);
  if (isTouch) return;

  // Respect reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const container =
    document.querySelector(".login-container") ||
    document.querySelector(".register-container");
  if (!container) return;

  // ── Parallax state ──────────────────────────
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let isHovering = false;
  let rafId = null;
  let isRunning = false;

  // Base tilt from CSS (matches .login-card transform)
  const BASE_ROT_X = 1;
  // Max additional rotation (subtle!)
  const MAX_ROT_X = 3;
  const MAX_ROT_Y = 5;

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 → 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    targetRotY = x * MAX_ROT_Y * 2;
    targetRotX = -y * MAX_ROT_X * 2;
    isHovering = true;

    card.classList.add("parallax-active");

    if (!isRunning) {
      isRunning = true;
      rafId = requestAnimationFrame(animate);
    }
  }

  function onMouseLeave() {
    targetRotX = 0;
    targetRotY = 0;
    isHovering = false;

    if (!isRunning) {
      isRunning = true;
      rafId = requestAnimationFrame(animate);
    }
  }

  function animate() {
    // Smooth exponential easing
    currentRotX += (targetRotX - currentRotX) * 0.07;
    currentRotY += (targetRotY - currentRotY) * 0.07;

    // If settled back to rest, reset to CSS default
    if (
      !isHovering &&
      Math.abs(currentRotX) < 0.05 &&
      Math.abs(currentRotY) < 0.05
    ) {
      card.style.transform = "";
      card.classList.remove("parallax-active");
      isRunning = false;
      return;
    }

    card.style.transform =
      `perspective(1200px) rotateX(${BASE_ROT_X + currentRotX}deg) ` +
      `rotateY(${currentRotY}deg)`;

    rafId = requestAnimationFrame(animate);
  }

  container.addEventListener("mousemove", onMouseMove);
  container.addEventListener("mouseleave", onMouseLeave);

  // ── Cleanup ─────────────────────────────────
  return function cleanup() {
    container.removeEventListener("mousemove", onMouseMove);
    container.removeEventListener("mouseleave", onMouseLeave);
    if (rafId) cancelAnimationFrame(rafId);
    card.style.transform = "";
    card.classList.remove("parallax-active");
  };
}

export default initCardParallax;