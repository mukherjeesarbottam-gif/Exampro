/**
 * SplineHomeScene.js
 * Integrates and renders the Spline 3D scene (scene.splinecode)
 * into the Home page as a full-screen interactive 3D landing experience.
 *
 * Optimized for mobile performance with:
 * - Capped DPR / lower resolution on mobile
 * - Disabled post-processing on mobile
 * - Disabled shadows on mobile
 * - Aggressive filtering of Spline text/UI elements
 * - Mobile camera adjustments for narrow screens
 */
import { Application } from "@splinetool/runtime";

export default class SplineHomeScene {
  constructor(containerId = "three-bg", sceneUrl = "./scene.splinecode") {
    this.container = typeof containerId === "string" 
      ? document.getElementById(containerId) 
      : containerId;
    this.sceneUrl = sceneUrl;
    this.app = null;
    this.canvas = null;
    this.loadingIndicator = null;
    this.isLoaded = false;

    // Device detection
    this.isMobile = this.detectMobile();
    this.isLowPower = this.detectLowPower();
    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!this.container) {
      console.warn("[SplineHomeScene] Container not found:", containerId);
      return;
    }

    this.init();
  }

  detectMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || (navigator.maxTouchPoints > 0 && window.innerWidth < 900)
    );
  }

  detectLowPower() {
    const cores = navigator.hardwareConcurrency || 8;
    return cores <= 4;
  }

  async init() {
    try {
      // Clear any previous children in container
      this.container.innerHTML = "";
      this.container.classList.remove("fallback-gradient");

      // Create loading indicator
      this.createLoader();

      // Create full-screen canvas
      this.canvas = document.createElement("canvas");
      this.canvas.id = "spline-canvas";
      this.canvas.style.display = "block";
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.canvas.style.position = "absolute";
      this.canvas.style.top = "0";
      this.canvas.style.left = "0";
      this.canvas.style.opacity = "0";
      this.canvas.style.transition = "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
      this.container.appendChild(this.canvas);

      // Initialize Spline Application
      this.app = new Application(this.canvas);

      // Apply mobile performance settings BEFORE loading
      this.applyPerformanceSettings();

      // Load scene.splinecode
      console.log("[SplineHomeScene] Loading Spline scene:", this.sceneUrl);
      await this.app.load(this.sceneUrl);

      this.isLoaded = true;
      console.log("[SplineHomeScene] Spline scene loaded successfully.");

      // Inspect and filter objects in the Spline scene
      this.filterSplineTextObjects();

      // Apply mobile camera adjustments
      this.applyMobileCameraAdjustments();

      // Fade in canvas & remove loader
      this.canvas.style.opacity = "1";
      this.hideLoader();

      // Window resize listener
      this.handleResize = this.handleResize.bind(this);
      window.addEventListener("resize", this.handleResize);

    } catch (error) {
      console.error("[SplineHomeScene] Error loading Spline scene:", error);
      this.hideLoader();
      this.container.classList.add("fallback-gradient");
    }
  }

  /**
   * Apply performance optimizations for mobile devices.
   * Desktop keeps full quality — mobile gets capped DPR,
   * disabled post-processing, and disabled shadows.
   */
  applyPerformanceSettings() {
    if (!this.app) return;

    try {
      if (this.isMobile) {
        // Cap DPR to 1 on mobile to reduce GPU load
        const dpr = Math.min(window.devicePixelRatio || 1, 1);
        if (this.app.setPixelRatio) {
          this.app.setPixelRatio(dpr);
        }

        // Disable post-processing effects on mobile
        if (this.app._postProcessing) {
          try {
            this.app._postProcessing.enabled = false;
          } catch (e) {}
        }

        // Disable shadows on mobile
        if (this.app._scene) {
          try {
            this.app._scene.traverse((obj) => {
              if (obj.castShadow !== undefined) obj.castShadow = false;
              if (obj.receiveShadow !== undefined) obj.receiveShadow = false;
            });
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn("[SplineHomeScene] applyPerformanceSettings warning:", err);
    }
  }

  /**
   * Adjust camera for narrow mobile screens so the
   * important 3D objects remain visible.
   */
  applyMobileCameraAdjustments() {
    if (!this.isMobile || !this.app) return;

    try {
      if (this.app._camera) {
        // Slightly zoom out on mobile to keep 3D objects in frame
        if (this.app._camera.zoom) {
          this.app._camera.zoom = 0.85;
          if (this.app._camera.updateProjectionMatrix) {
            this.app._camera.updateProjectionMatrix();
          }
        }
      }
    } catch (err) {
      console.warn("[SplineHomeScene] applyMobileCameraAdjustments warning:", err);
    }
  }

  createLoader() {
    this.loadingIndicator = document.createElement("div");
    this.loadingIndicator.className = "spline-loader";
    this.loadingIndicator.innerHTML = `
      <div class="spline-spinner"></div>
      <span class="spline-loading-text">Loading 3D Experience...</span>
    `;
    this.container.appendChild(this.loadingIndicator);
  }

  hideLoader() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.opacity = "0";
      this.loadingIndicator.style.transition = "opacity 0.4s ease";
      setTimeout(() => {
        if (this.loadingIndicator && this.loadingIndicator.parentNode) {
          this.loadingIndicator.parentNode.removeChild(this.loadingIndicator);
        }
      }, 400);
    }
  }

  /**
   * Aggressively hide all Spline text/UI elements while
   * preserving the 3D objects, lighting, and environment.
   */
  filterSplineTextObjects() {
    try {
      if (!this.app) return;

      const hideUnwanted = (obj) => {
        if (!obj) return;
        const name = (obj.name || "").toLowerCase();
        const type = (obj.type || "").toLowerCase();
        const geomType = (obj.geometry?.type || "").toLowerCase();

        // Check for text value property (Spline text objects)
        const textValue = obj.textValue || obj.text || "";
        const hasTextValue = typeof textValue === "string" && textValue.trim().length > 0;

        // Check for 2D UI elements
        const is2DUI = 
          obj.isUI || 
          obj.is2D || 
          type.includes("frame") ||
          type.includes("ui") ||
          name.includes("ui scene") ||
          name.includes("frame") ||
          name.includes("2d");

        // Check for text geometry
        const isTextGeometry = geomType.includes("text");

        // Check for text material
        const isTextMaterial = 
          (obj.material?.name || "").toLowerCase().includes("text") ||
          (obj.material?.type || "").toLowerCase().includes("text");

        // Check for button-like objects (Rectangle + Text combos)
        const isButtonLike = 
          name.includes("button") ||
          name.includes("btn") ||
          name.includes("rectangle") ||
          name.includes("pill") ||
          name.includes("card");

        // Known Spline text content from the scene
        const knownTextContent = [
          "get sarted",
          "contact us",
          "crafting",
          "let's talk",
          "home",
          "cases",
          "library",
          "resources",
          "web3",
          "motion",
          "building",
          "cool experiences",
          "experience",
          "started"
        ];

        const hasKnownText = knownTextContent.some(t => 
          (typeof textValue === "string" && textValue.toLowerCase().includes(t)) ||
          name.includes(t)
        );

        const isTextOrUI =
          hasTextValue ||
          is2DUI ||
          isTextGeometry ||
          isTextMaterial ||
          isButtonLike ||
          hasKnownText ||
          obj.isText ||
          type.includes("text") ||
          type.includes("ui") ||
          name.includes("text") ||
          name.includes("title") ||
          name.includes("heading") ||
          name.includes("paragraph") ||
          name.includes("label") ||
          name.includes("menu") ||
          name.includes("nav");

        if (isTextOrUI) {
          obj.visible = false;
          // Also hide parent if it's a text/UI container
          if (obj.parent && (hasTextValue || is2DUI || isButtonLike || hasKnownText)) {
            obj.parent.visible = false;
          }
        }
      };

      // 1. Check getAllObjects
      if (typeof this.app.getAllObjects === "function") {
        this.app.getAllObjects().forEach(hideUnwanted);
      }

      // 2. Traverse Three.js scene inside Spline
      if (this.app._scene && typeof this.app._scene.traverse === "function") {
        this.app._scene.traverse(hideUnwanted);
      }

      // 3. Hide the entire UI Scene / Frame if accessible
      if (this.app._scene) {
        try {
          this.app._scene.traverse((obj) => {
            const n = (obj.name || "").toLowerCase();
            if (n.includes("ui scene") || n.includes("ui") || n.includes("frame")) {
              obj.visible = false;
            }
          });
        } catch (e) {}
      }

      // 4. Ensure camera view fits whole 3D model
      if (this.app._camera) {
        if (this.app._camera.zoom) {
          this.app._camera.zoom = 1.0;
          if (this.app._camera.updateProjectionMatrix) {
            this.app._camera.updateProjectionMatrix();
          }
        }
      }

      if (this.app.requestRender) {
        this.app.requestRender();
      }
    } catch (err) {
      console.warn("[SplineHomeScene] filterSplineTextObjects warning:", err);
    }
  }

  handleResize() {
    if (this.app && typeof this.app.setSize === "function") {
      this.app.setSize(window.innerWidth, window.innerHeight);
    }
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this.app && typeof this.app.dispose === "function") {
      this.app.dispose();
    }
    if (this.container) {
      this.container.innerHTML = "";
    }
    this.app = null;
    this.canvas = null;
  }
}