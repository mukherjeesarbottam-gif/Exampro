/**
 * ThreeBackground.js
 * Base class for all ExamPro 3D animated backgrounds.
 * Handles renderer setup, device detection, quality scaling,
 * resize handling, mouse parallax, and resource cleanup.
 */
import * as THREE from "three";

export default class ThreeBackground {
  constructor(containerId = "three-bg", options = {}) {
    this.containerId = containerId;
    this.options = options;

    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`[ThreeBackground] Container #${containerId} not found.`);
      return null;
    }

    // Device / quality detection
    this.isMobile = this.detectMobile();
    this.isLowPower = this.detectLowPower();
    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Quality settings
    this.quality = this.computeQuality();

    // WebGL support detection
    this.webglSupported = this.detectWebGL();
    if (!this.webglSupported) {
      this.applyFallback();
      return null;
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.particles = [];
    this.trees = [];   // Shared so subclasses may populate during buildScene()
    this.clouds = [];  // (class fields initialize AFTER super() — this is required)
    this.mouseTarget = { x: 0, y: 0 };
    this.mouseCurrent = { x: 0, y: 0 };
    this.isDisposed = false;
    this.animationId = null;

    this.init();
  }

  /* ──────────────────────────────────────────
   * DETECTION
   * ────────────────────────────────────────── */

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

  detectWebGL() {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  }

  computeQuality() {
    if (this.isMobile) return "low";
    if (this.isLowPower) return "medium";
    return "high";
  }

  applyFallback() {
    // Prevents exceptions on devices without WebGL.
    this.container.classList.add("fallback-gradient");
    // Let CSS handle the visual.
    console.warn("[ThreeBackground] WebGL not supported — using CSS fallback.");
  }

  /* ──────────────────────────────────────────
   * INIT
   * ────────────────────────────────────────── */

  init() {
    const { innerWidth, innerHeight } = window;
    const aspect = innerWidth / innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = this.createFog();

    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 200);
    this.camera.position.set(0, 0, this.getCameraZ());

    this.renderer = new THREE.WebGLRenderer({
      antialias: this.quality === "high",
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(this.getPixelRatio());

    // Ensure canvas sits behind content
    const canvas = this.renderer.domElement;
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "-1";
    canvas.style.pointerEvents = "none";
    this.container.appendChild(canvas);

    // Lights
    this.setupLights();

    // Scene content (overridden by subclasses)
    this.buildScene();

    // Events
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("mousemove", this.handleMouseMove);
    // Use a dynamic wrapper so subclass overrides of handleScroll are respected
    // (derived class fields initialize AFTER super() in the base constructor).
    window.addEventListener("scroll", this.scrollHandler, { passive: true });
    document.addEventListener("visibilitychange", this.handleVisibility);

    // Start animation
    if (!this.prefersReducedMotion) {
      this.animate();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /* ──────────────────────────────────────────
   * HOOKS – overridden by subclasses
   * ────────────────────────────────────────── */

  buildScene() {}
  createFog() { return new THREE.Fog(0x000000, 20, 60); }
  getCameraZ() { return 10; }
  setupLights() {}
  update(delta, elapsed) {} // eslint-disable-line no-unused-vars

  /* ──────────────────────────────────────────
   * PARTICLE HELPERS
   * ────────────────────────────────────────── */

  createParticles({ count, color, size = 0.05, opacity = 0.8, range = 15, spread = { x: 10, y: 6, z: 10 }, texture = null, sizeAttenuation = true }) {
    const safeCount = this.quality === "low" ? Math.floor(count * 0.35)
      : this.quality === "medium" ? Math.floor(count * 0.65)
      : count;

    const positions = new Float32Array(safeCount * 3);

    for (let i = 0; i < safeCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread.x * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread.y * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread.z * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: color,
      size: size,
      transparent: true,
      opacity: opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: sizeAttenuation,
    });

    if (texture) material.map = texture;

    const points = new THREE.Points(geometry, material);
    points.userData.range = range;
    points.userData.baseY = spread.y;
    this.particles.push(points);
    this.scene.add(points);
    return points;
  }

  createParticleTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.6)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  /* ──────────────────────────────────────────
   * RENDER LOOP
   * ────────────────────────────────────────── */

  animate = () => {
    if (this.isDisposed) return;

    this.animationId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.getElapsedTime();

    // Smooth mouse easing
    this.mouseCurrent.x += (this.mouseTarget.x - this.mouseCurrent.x) * 0.03;
    this.mouseCurrent.y += (this.mouseTarget.y - this.mouseCurrent.y) * 0.03;

    // Camera parallax
    this.camera.position.x = this.mouseCurrent.x * (this.options.parallaxStrength || 0.5);
    this.camera.position.y = -this.mouseCurrent.y * (this.options.parallaxStrength || 0.5);
    this.camera.lookAt(0, 0, 0);

    // NOTE: particle drift / rotation is delegated entirely to
    // subclass update() implementations, so they can animate
    // positions freely without conflicting with base-class motion.
    this.update(delta, elapsed);

    this.renderer.render(this.scene, this.camera);
  };

  /* ──────────────────────────────────────────
   * EVENTS
   * ────────────────────────────────────────── */

  handleResize = () => {
    const { innerWidth, innerHeight } = window;
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(this.getPixelRatio());
  };

  handleMouseMove = (event) => {
    // Normalized device coordinates (-1 to 1)
    this.mouseTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseTarget.y = (event.clientY / window.innerHeight) * 2 - 1;
  };

  // Wrapper allowing subclass overrides of handleScroll to be picked up
  // at event time, regardless of class-field initialization order.
  scrollHandler = () => {
    if (typeof this.handleScroll === "function") {
      this.handleScroll();
    }
  };

  handleScroll = () => {
    // Overridden in subclasses if needed
  };

  handleVisibility = () => {
    if (document.hidden) {
      this.clock.stop();
    } else {
      this.clock.start();
    }
  };

  /* ──────────────────────────────────────────
   * QUALITY HELPERS
   * ────────────────────────────────────────── */

  getPixelRatio() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (this.quality === "low") return Math.min(dpr, 1);
    if (this.quality === "medium") return Math.min(dpr, 1.5);
    return dpr;
  }

  /* ──────────────────────────────────────────
   * CLEANUP
   * ────────────────────────────────────────── */

  dispose() {
    this.isDisposed = true;

    if (this.animationId) cancelAnimationFrame(this.animationId);

    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("scroll", this.scrollHandler);
    document.removeEventListener("visibilitychange", this.handleVisibility);

    if (this.renderer) {
      this.renderer.dispose();

      // Traverse scene and dispose resources
      this.scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      const canvas = this.renderer.domElement;
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }

    if (!this.webglSupported && this.container) {
      // Keep the CSS fallback — don't strip the class
      return;
    }
    if (this.container) {
      this.container.classList.remove("fallback-gradient");
      this.container.innerHTML = "";
    }
  }
}