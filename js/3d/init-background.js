/**
 * init-background.js
 * Bootstraps the correct 3D scene for each page.
 * Detects which page is loaded via body class and
 * lazily imports Three.js + the scene module.
 */
export default async function initBackground() {
  const container = document.getElementById("three-bg");
  if (!container) return;

  const body = document.body;
  let SceneClass = null;
  let module = null;

  try {
    if (body.classList.contains("login-page")) {
      module = await import("./Login3DScene.js");
      SceneClass = module.default;
    } else if (body.classList.contains("register-page")) {
      module = await import("./Register3DScene.js");
      SceneClass = module.default;
    } else if (body.classList.contains("home-page")) {
      module = await import("./SplineHomeScene.js");
      SceneClass = module.default;
    }

    if (SceneClass) {
      // Store instance for potential cleanup
      window.ExamPro = window.ExamPro || {};
      window.ExamPro.ThreeScene = new SceneClass("three-bg");
    }
  } catch (error) {
    console.error("[3D Background] Failed to initialize:", error);
    container.classList.add("fallback-gradient");
  }
}