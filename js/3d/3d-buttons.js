/**
 * 3d-buttons.js
 * Premium 3D button system with three distinct visual treatments:
 * - Home: "Educational" — rounded extruded buttons with soft glow
 * - Login: "Metallic/Glass" — sharp-edged metallic buttons with cursor response
 * - Register: "Cosmic/Orb" — pill-shaped glowing buttons with scale interaction
 *
 * Each button has: depth, hover elevation, press-down animation, glow, and smooth transitions.
 */
export function init3DButtons() {
  const body = document.body;

  // Detect page type
  const pageType = body.classList.contains("login-page")
    ? "login"
    : body.classList.contains("register-page")
    ? "register"
    : "home";

  // Apply page-specific class to all 3D buttons
  // (skip nav buttons so they keep consistent styling across pages)
  document.querySelectorAll(".btn-3d").forEach((btn) => {
    if (btn.classList.contains("btn-auth-nav")) return;
    btn.classList.add(`btn-3d-${pageType}`);
  });

  // Respect reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  // Initialize all 3D buttons
  document.querySelectorAll(".btn-3d").forEach((btn) => {
    initButton(btn, pageType);
  });
}

function initButton(btn, pageType) {
  // Nav buttons always use home-style parallax interaction
  const isNavBtn = btn.classList.contains("btn-auth-nav");
  const effectiveType = isNavBtn ? "home" : pageType;

  // ── Hover: rise / tilt / glow ──────────────────────
  btn.addEventListener("mouseenter", () => {
    btn.classList.add("btn-3d-hover");
  });

  btn.addEventListener("mouseleave", () => {
    btn.classList.remove("btn-3d-hover", "btn-3d-active");
    btn.style.transform = "";
    btn.style.boxShadow = "";
  });

  // ── Press down animation ───────────────────────────
  btn.addEventListener("mousedown", () => {
    btn.classList.add("btn-3d-active");
  });

  btn.addEventListener("mouseup", () => {
    btn.classList.remove("btn-3d-active");
  });

  // ── Cursor-follow response (Login metallic buttons) ──
  if (effectiveType === "login") {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      // Subtle perspective tilt toward cursor
      const tiltX = y * -6;
      const tiltY = x * 8;

      btn.style.setProperty("--tilt-x", `${tiltX}deg`);
      btn.style.setProperty("--tilt-y", `${tiltY}deg`);

      // Metallic sheen follows cursor
      btn.style.setProperty("--sheen-x", `${(x + 0.5) * 100}%`);
      btn.style.setProperty("--sheen-y", `${(y + 0.5) * 100}%`);
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.setProperty("--tilt-x", "0deg");
      btn.style.setProperty("--tilt-y", "0deg");
    });
  }

  // ── Register: scale interaction ────────────────────
  if (effectiveType === "register") {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      // Orb glow follows cursor
      btn.style.setProperty("--orb-x", `${(x + 0.5) * 100}%`);
      btn.style.setProperty("--orb-y", `${(y + 0.5) * 100}%`);
    });
  }

  // ── Home: subtle parallax + tilt ──────────────────
  if (effectiveType === "home") {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      btn.style.setProperty("--parallax-x", `${x * 4}px`);
      btn.style.setProperty("--parallax-y", `${y * 4}px`);

      // Add subtle 3D tilt for Start Exam buttons
      if (btn.classList.contains("btn-start-exam")) {
        const tiltX = y * -3;
        const tiltY = x * 4;
        btn.style.setProperty("--tilt-x", `${tiltX}deg`);
        btn.style.setProperty("--tilt-y", `${tiltY}deg`);
        btn.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px) translateX(${x * 4}px) translateY(${y * 4}px)`;
      }
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.setProperty("--parallax-x", "0px");
      btn.style.setProperty("--parallax-y", "0px");
      btn.style.setProperty("--tilt-x", "0deg");
      btn.style.setProperty("--tilt-y", "0deg");
      btn.style.transform = "";
    });
  }

  // ── Touch support: tap press ───────────────────────
  btn.addEventListener("touchstart", () => {
    btn.classList.add("btn-3d-active");
  }, { passive: true });

  btn.addEventListener("touchend", () => {
    btn.classList.remove("btn-3d-active");
  }, { passive: true });
}

export default init3DButtons;