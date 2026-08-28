/**
 * Home3DScene.js
 * "Immersive 3D Examination World" — cinematic dark environment
 * with a boy and girl student, floating examination technology,
 * particles, and cinematic lighting.
 *
 * The entire scene is alive: characters breathe, objects float,
 * particles drift, lighting shifts, and the camera moves subtly.
 */
import * as THREE from "three";
import ThreeBackground from "./ThreeBackground.js";
import CharacterBuilder from "./CharacterBuilder.js";

export default class Home3DScene extends ThreeBackground {
  constructor(containerId = "three-bg") {
    super(containerId, {
      parallaxStrength: 0.4,
      scrollParallax: true,
    });
  }

  createFog() {
    return new THREE.FogExp2(0x050508, 0.018);
  }

  getCameraZ() {
    return 11;
  }

  setupLights() {
    // ── Ambient Light — soft dark blue base ──
    const ambient = new THREE.AmbientLight(0x0a1026, 1.2);
    this.scene.add(ambient);

    // ── Key Directional Light — Electric Blue from top-right ──
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    keyLight.position.set(6, 10, 8);
    this.scene.add(keyLight);

    // ── Fill Directional Light — Vibrant Cyan from left ──
    const fillLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    fillLight.position.set(-8, 2, 6);
    this.scene.add(fillLight);

    // ── Rim / Backlight — Glowing Violet/Indigo from behind ──
    const rimLight = new THREE.DirectionalLight(0x818cf8, 2.0);
    rimLight.position.set(0, -5, -6);
    this.scene.add(rimLight);

    // ── Central Point Lights for atmosphere ──
    const centerCyan = new THREE.PointLight(0x38bdf8, 1.5, 18);
    centerCyan.position.set(0, 1, 3);
    this.scene.add(centerCyan);

    const accentPurple = new THREE.PointLight(0xa855f7, 1.2, 15);
    accentPurple.position.set(4, 2, 0);
    this.scene.add(accentPurple);
  }

  buildScene() {
    // Dark cinematic environment
    this.scene.background = new THREE.Color(0x050508);

    // ── Characters (Boy & Girl) ─────────────────
    this.characters = [];
    this.createCharacters();

    // ── Central examination interface ───────────
    this.centralInterface = null;
    this.createCentralInterface();

    // ── Floating examination screens ─────────────
    this.examScreens = [];
    this.createExamScreens();

    // ── 3D question cards ───────────────────────
    this.questionCards = [];
    this.createQuestionCards();

    // ── Floating check marks ────────────────────
    this.checkMarks = [];
    this.createCheckMarks();

    // ── Exam timer ──────────────────────────────
    this.examTimers = [];
    this.createExamTimers();

    // ── Progress indicators ─────────────────────
    this.progressRings = [];
    this.createProgressRings();

    // ── 3D books ────────────────────────────────
    this.books = [];
    this.createBooks();

    // ── Floating documents ──────────────────────
    this.documents = [];
    this.createDocuments();

    // ── Abstract geometric structures ───────────
    this.geoStructures = [];
    this.createGeoStructures();

    // ── Glass panels ────────────────────────────
    this.glassPanels = [];
    this.createGlassPanels();

    // ── Metallic frames ─────────────────────────
    this.metalFrames = [];
    this.createMetalFrames();

    // ── Background structures ───────────────────
    this.backgroundStructures = [];
    this.createBackgroundStructures();

    // ── Particles ───────────────────────────────
    const texture = this.createParticleTexture();
    this.createParticles({
      count: this.quality === "high" ? 1200 : this.quality === "medium" ? 600 : 250,
      color: 0x8b9dc3,
      size: 0.06,
      opacity: 0.5,
      spread: { x: 18, y: 10, z: 14 },
      texture,
    });

    this.createParticles({
      count: this.quality === "high" ? 500 : this.quality === "medium" ? 250 : 100,
      color: 0xa78bfa,
      size: 0.04,
      opacity: 0.35,
      spread: { x: 14, y: 8, z: 10 },
      texture,
    });

    // ── Ground plane (subtle reflection) ────────
    this.createGround();

    // ── Scroll state ────────────────────────────
    this.scrollOffset = 0;
    this.scrollTarget = 0;
  }

  /* ──────────────────────────────────────────
   * CHARACTERS
   * ────────────────────────────────────────── */

  createCharacters() {
    const isLow = this.quality === "low";

    // ── Boy (left side) ──────────────────────
    const boy = CharacterBuilder.build({
      gender: "boy",
      scale: isLow ? 0.85 : 1,
      colors: {
        shirt: 0x2c3e50,
        shirtAccent: 0x34495e,
        pants: 0x1a1a2e,
        hair: 0x2d1b0e,
        skin: 0xd4a574,
      },
    });
    boy.position.set(-3.2, 0, -1.5);
    boy.rotation.y = 0.25;
    CharacterBuilder.setBaseY(boy, 0);
    this.scene.add(boy);
    this.characters.push(boy);

    // ── Girl (right side) ────────────────────
    const girl = CharacterBuilder.build({
      gender: "girl",
      scale: isLow ? 0.85 : 1,
      colors: {
        shirt: 0x34495e,
        shirtAccent: 0x4a6fa5,
        pants: 0x2c3e50,
        hair: 0x1a1a2e,
        skin: 0xe8b88a,
      },
    });
    girl.position.set(3.2, 0, -1.5);
    girl.rotation.y = -0.25;
    CharacterBuilder.setBaseY(girl, 0);
    this.scene.add(girl);
    this.characters.push(girl);
  }

  /* ──────────────────────────────────────────
   * CENTRAL EXAMINATION INTERFACE
   * ────────────────────────────────────────── */

  createCentralInterface() {
    const group = new THREE.Group();

    // Main holographic screen
    const screenGeo = new THREE.PlaneGeometry(4.2, 2.8);
    const screenMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0a12,
      transparent: true,
      opacity: 0.75,
      metalness: 0.5,
      roughness: 0.2,
      depthWrite: false,
      side: THREE.DoubleSide,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      emissive: 0x0a0a1a,
      emissiveIntensity: 0.3,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    group.add(screen);

    // Screen border glow
    const borderGeo = new THREE.EdgesGeometry(screenGeo);
    const borderMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.6,
    });
    const border = new THREE.LineSegments(borderGeo, borderMat);
    group.add(border);

    // Screen content
    const content = this.createInterfaceContent();
    content.position.z = 0.02;
    group.add(content);

    // Floating header bar
    const headerGeo = new THREE.PlaneGeometry(4.2, 0.45);
    const headerMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.4,
      metalness: 0.3,
      transparent: true,
      opacity: 0.8,
      emissive: 0x1a1a3e,
      emissiveIntensity: 0.2,
    });
    const header = new THREE.Mesh(headerGeo, headerMat);
    header.position.y = 1.4;
    header.position.z = 0.01;
    group.add(header);

    // Header title line
    const titleLineGeo = new THREE.PlaneGeometry(1.8, 0.1);
    const titleLineMat = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.8,
    });
    const titleLine = new THREE.Mesh(titleLineGeo, titleLineMat);
    titleLine.position.y = 1.4;
    titleLine.position.z = 0.03;
    group.add(titleLine);

    // Position central interface — center of scene
    group.position.set(0, 0.3, -2.8);
    group.rotation.y = 0;

    group.userData = {
      floatSpeed: 0.2,
      floatPhase: 0,
      floatAmp: 0.12,
      rotSpeed: 0.05,
      basePos: group.position.clone(),
      baseRotY: group.rotation.y,
    };

    this.scene.add(group);
    this.centralInterface = group;
  }

  createInterfaceContent() {
    const group = new THREE.Group();

    // Question text lines
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0x8b9dc3,
      transparent: true,
      opacity: 0.5,
    });
    for (let i = 0; i < 3; i++) {
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2 - i * 0.4, 0.07),
        lineMat
      );
      line.position.y = 1.0 - i * 0.25;
      group.add(line);
    }

    // Answer option circles
    const optionMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.6,
    });
    const optionMatSelected = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.9,
    });
    for (let i = 0; i < 4; i++) {
      const circle = new THREE.Mesh(
        new THREE.CircleGeometry(0.1, 16),
        i === 1 ? optionMatSelected : optionMat
      );
      circle.position.set(-1.7, 0.1 - i * 0.28, 0);
      group.add(circle);

      // Option label line
      const optLine = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 0.06),
        lineMat
      );
      optLine.position.set(-0.4, 0.1 - i * 0.28, 0);
      group.add(optLine);
    }

    // Progress bar background
    const progressBg = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 0.12),
      new THREE.MeshBasicMaterial({
        color: 0x1a1a2e,
        transparent: true,
        opacity: 0.8,
      })
    );
    progressBg.position.set(0, -1.15, 0);
    group.add(progressBg);

    // Progress bar fill (partial)
    const progressFill = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 0.12),
      new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.8,
      })
    );
    progressFill.position.set(-0.7, -1.15, 0.01);
    group.add(progressFill);

    // Progress percentage text block
    const pctText = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.1),
      new THREE.MeshBasicMaterial({
        color: 0x8b9dc3,
        transparent: true,
        opacity: 0.7,
      })
    );
    pctText.position.set(1.8, -1.15, 0.01);
    group.add(pctText);

    return group;
  }

  /* ──────────────────────────────────────────
   * FLOATING EXAMINATION SCREENS
   * ────────────────────────────────────────── */

  createExamScreens() {
    const count = this.quality === "high" ? 5 : this.quality === "medium" ? 3 : 2;

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();

      // Screen panel
      const geo = new THREE.PlaneGeometry(1.4, 0.9);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a12,
        transparent: true,
        opacity: 0.6,
        metalness: 0.4,
        roughness: 0.2,
        depthWrite: false,
        side: THREE.DoubleSide,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        emissive: 0x0a0a1a,
        emissiveIntensity: 0.2,
      });
      const panel = new THREE.Mesh(geo, mat);
      group.add(panel);

      // Screen border
      const borderGeo = new THREE.EdgesGeometry(geo);
      const borderMat = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.4,
      });
      const border = new THREE.LineSegments(borderGeo, borderMat);
      group.add(border);

      // Screen content lines
      const lineMat = new THREE.MeshBasicMaterial({
        color: 0x8b9dc3,
        transparent: true,
        opacity: 0.4,
      });
      for (let j = 0; j < 3; j++) {
        const line = new THREE.Mesh(
          new THREE.PlaneGeometry(1.0 - j * 0.2, 0.04),
          lineMat
        );
        line.position.y = 0.2 - j * 0.12;
        line.position.z = 0.02;
        group.add(line);
      }

      // Position screens in a scattered arrangement
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 3.5 + Math.random() * 3;
      group.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 4,
        -3 - Math.random() * 3
      );
      group.rotation.y = Math.random() * Math.PI;
      group.rotation.z = (Math.random() - 0.5) * 0.3;

      group.userData = {
        floatSpeed: 0.3 + Math.random() * 0.3,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.2 + Math.random() * 0.3,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        basePos: group.position.clone(),
      };

      this.scene.add(group);
      this.examScreens.push(group);
    }
  }

  /* ──────────────────────────────────────────
   * 3D QUESTION CARDS
   * ────────────────────────────────────────── */

  createQuestionCards() {
    const count = this.quality === "high" ? 6 : this.quality === "medium" ? 4 : 2;
    const cardTexture = this.createCardTexture();

    for (let i = 0; i < count; i++) {
      const geo = new THREE.PlaneGeometry(1.1, 0.75);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.4,
        metalness: 0.2,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });
      if (cardTexture) mat.map = cardTexture;

      const card = new THREE.Mesh(geo, mat);
      const angle = (i / count) * Math.PI * 2 + 0.3;
      const radius = 2.5 + Math.random() * 2;
      card.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3.5,
        -2.5 - Math.random() * 3
      );
      card.rotation.y = Math.random() * Math.PI;
      card.rotation.x = (Math.random() - 0.5) * 0.4;

      // Card glow border
      const borderGeo = new THREE.EdgesGeometry(geo);
      const borderMat = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.5,
      });
      const border = new THREE.LineSegments(borderGeo, borderMat);
      card.add(border);

      card.userData = {
        floatSpeed: 0.35 + Math.random() * 0.25,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.2 + Math.random() * 0.25,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        basePos: card.position.clone(),
      };

      this.scene.add(card);
      this.questionCards.push(card);
    }
  }

  createCardTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 110;
    canvas.height = 75;
    const ctx = canvas.getContext("2d");

    // Card background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, 110, 75);

    // Question text lines
    ctx.strokeStyle = "rgba(139, 157, 195, 0.5)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(10, 12 + i * 10);
      ctx.lineTo(100, 12 + i * 10);
      ctx.stroke();
    }

    // Answer options
    ctx.fillStyle = "rgba(99, 102, 241, 0.4)";
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(18, 48 + i * 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  /* ──────────────────────────────────────────
   * FLOATING CHECK MARKS
   * ────────────────────────────────────────── */

  createCheckMarks() {
    const count = this.quality === "high" ? 5 : this.quality === "medium" ? 3 : 2;

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();

      // Check mark made of two lines
      const lineMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.8,
      });

      const line1Geo = new THREE.BoxGeometry(0.3, 0.05, 0.05);
      const line1 = new THREE.Mesh(line1Geo, lineMat);
      line1.position.set(-0.1, -0.04, 0);
      line1.rotation.z = 0.6;
      group.add(line1);

      const line2Geo = new THREE.BoxGeometry(0.45, 0.05, 0.05);
      const line2 = new THREE.Mesh(line2Geo, lineMat);
      line2.position.set(0.13, 0.1, 0);
      line2.rotation.z = -0.6;
      group.add(line2);

      // Glow ring around check
      const ringGeo = new THREE.TorusGeometry(0.3, 0.02, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.3,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      group.add(ring);

      const angle = (i / count) * Math.PI * 2 + 1;
      const radius = 2 + Math.random() * 3;
      group.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 4,
        -2 - Math.random() * 3
      );

      group.userData = {
        floatSpeed: 0.4 + Math.random() * 0.3,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.25 + Math.random() * 0.3,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        basePos: group.position.clone(),
      };

      this.scene.add(group);
      this.checkMarks.push(group);
    }
  }

  /* ──────────────────────────────────────────
   * EXAM TIMERS
   * ────────────────────────────────────────── */

  createExamTimers() {
    const count = this.quality === "high" ? 3 : this.quality === "medium" ? 2 : 1;

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();

      // Timer ring
      const ringGeo = new THREE.TorusGeometry(0.4, 0.04, 12, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        roughness: 0.3,
        metalness: 0.6,
        transparent: true,
        opacity: 0.7,
        emissive: 0x312e81,
        emissiveIntensity: 0.3,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      group.add(ring);

      // Timer arc (partial)
      const arcGeo = new THREE.TorusGeometry(0.4, 0.06, 12, 32, Math.PI * 1.3);
      const arcMat = new THREE.MeshStandardMaterial({
        color: 0xa78bfa,
        roughness: 0.3,
        metalness: 0.4,
        transparent: true,
        opacity: 0.8,
        emissive: 0x6d28d9,
        emissiveIntensity: 0.4,
      });
      const arc = new THREE.Mesh(arcGeo, arcMat);
      group.add(arc);

      // Center dot
      const dotGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0x8b9dc3,
        transparent: true,
        opacity: 0.8,
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      group.add(dot);

      const angle = (i / count) * Math.PI * 2 + 2;
      const radius = 3 + Math.random() * 2.5;
      group.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3.5,
        -3 - Math.random() * 3
      );

      group.userData = {
        floatSpeed: 0.3 + Math.random() * 0.2,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.2 + Math.random() * 0.25,
        rotSpeed: 0.3 + Math.random() * 0.3,
        basePos: group.position.clone(),
      };

      this.scene.add(group);
      this.examTimers.push(group);
    }
  }

  /* ──────────────────────────────────────────
   * PROGRESS INDICATORS
   * ────────────────────────────────────────── */

  createProgressRings() {
    const count = this.quality === "high" ? 4 : this.quality === "medium" ? 3 : 2;

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();

      // Main ring
      const ringGeo = new THREE.TorusGeometry(0.45, 0.04, 12, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        roughness: 0.3,
        metalness: 0.6,
        transparent: true,
        opacity: 0.7,
        emissive: 0x312e81,
        emissiveIntensity: 0.3,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      group.add(ring);

      // Inner fill segment (partial arc)
      const arcGeo = new THREE.TorusGeometry(0.45, 0.07, 12, 32, Math.PI * 1.5);
      const arcMat = new THREE.MeshStandardMaterial({
        color: 0x34d399,
        roughness: 0.3,
        metalness: 0.4,
        transparent: true,
        opacity: 0.8,
        emissive: 0x059669,
        emissiveIntensity: 0.4,
      });
      const arc = new THREE.Mesh(arcGeo, arcMat);
      group.add(arc);

      // Center dot
      const dotGeo = new THREE.SphereGeometry(0.07, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0x8b9dc3,
        transparent: true,
        opacity: 0.8,
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      group.add(dot);

      const angle = (i / count) * Math.PI * 2 + 2;
      const radius = 3 + Math.random() * 2.5;
      group.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3.5,
        -3 - Math.random() * 3
      );

      group.userData = {
        floatSpeed: 0.3 + Math.random() * 0.2,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.2 + Math.random() * 0.25,
        rotSpeed: 0.3 + Math.random() * 0.3,
        basePos: group.position.clone(),
      };

      this.scene.add(group);
      this.progressRings.push(group);
    }
  }

  /* ──────────────────────────────────────────
   * 3D BOOKS
   * ────────────────────────────────────────── */

  createBooks() {
    const count = this.quality === "high" ? 4 : this.quality === "medium" ? 3 : 2;

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();

      // Book cover
      const coverGeo = new THREE.BoxGeometry(0.7, 0.5, 0.15);
      const coverMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.5,
        metalness: 0.3,
        transparent: true,
        opacity: 0.9,
        emissive: 0x0a0a1a,
        emissiveIntensity: 0.2,
      });
      const cover = new THREE.Mesh(coverGeo, coverMat);
      group.add(cover);

      // Book pages
      const pageMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        roughness: 0.8,
        metalness: 0.05,
      });
      const page = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 0.05),
        pageMat
      );
      page.position.z = 0.1;
      group.add(page);

      // Book spine glow
      const spineGeo = new THREE.BoxGeometry(0.72, 0.52, 0.02);
      const spineMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.3,
      });
      const spine = new THREE.Mesh(spineGeo, spineMat);
      spine.position.z = -0.08;
      group.add(spine);

      const angle = (i / count) * Math.PI * 2 + 0.5;
      const radius = 2.5 + Math.random() * 2;
      group.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3,
        -2.5 - Math.random() * 3
      );
      group.rotation.y = Math.random() * Math.PI;
      group.rotation.z = (Math.random() - 0.5) * 0.3;

      group.userData = {
        floatSpeed: 0.25 + Math.random() * 0.2,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.2 + Math.random() * 0.2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        basePos: group.position.clone(),
      };

      this.scene.add(group);
      this.books.push(group);
    }
  }

  /* ──────────────────────────────────────────
   * FLOATING DOCUMENTS
   * ────────────────────────────────────────── */

  createDocuments() {
    const count = this.quality === "high" ? 5 : this.quality === "medium" ? 3 : 2;
    const docTexture = this.createDocumentTexture();

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();

      // Document plane
      const geo = new THREE.PlaneGeometry(1.2, 1.6);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.6,
        metalness: 0.05,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      if (docTexture) mat.map = docTexture;

      const doc = new THREE.Mesh(geo, mat);
      doc.rotation.x = -0.15;
      group.add(doc);

      // Document edge glow
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.3,
      });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      edges.rotation.x = -0.15;
      group.add(edges);

      // Position documents in a scattered arrangement
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 3.5 + Math.random() * 4;
      group.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 4,
        -4 - Math.random() * 4
      );
      group.rotation.y = Math.random() * Math.PI;
      group.rotation.z = (Math.random() - 0.5) * 0.3;

      group.userData = {
        floatSpeed: 0.3 + Math.random() * 0.3,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.2 + Math.random() * 0.3,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        basePos: group.position.clone(),
      };

      this.scene.add(group);
      this.documents.push(group);
    }
  }

  createDocumentTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 160;
    const ctx = canvas.getContext("2d");

    // Document background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, 120, 160);

    // Lines of text
    ctx.strokeStyle = "rgba(139, 157, 195, 0.3)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(15, 20 + i * 18);
      ctx.lineTo(105, 20 + i * 18);
      ctx.stroke();
    }

    // Question mark symbol
    ctx.fillStyle = "rgba(99, 102, 241, 0.4)";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("?", 60, 90);

    // Check mark
    ctx.strokeStyle = "rgba(52, 211, 153, 0.5)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(40, 120);
    ctx.lineTo(55, 135);
    ctx.lineTo(85, 100);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  /* ──────────────────────────────────────────
   * ABSTRACT GEOMETRIC STRUCTURES
   * ────────────────────────────────────────── */

  createGeoStructures() {
    const configs = [
      { geo: new THREE.IcosahedronGeometry(0.5, 0), pos: [-4.5, -1.5, -4], color: 0x6366f1, opacity: 0.5 },
      { geo: new THREE.OctahedronGeometry(0.4, 0), pos: [4.2, -2, -3.5], color: 0xa78bfa, opacity: 0.5 },
      { geo: new THREE.DodecahedronGeometry(0.4, 0), pos: [0.5, 3, -5], color: 0x34d399, opacity: 0.5 },
      { geo: new THREE.TetrahedronGeometry(0.45, 0), pos: [-2.5, 3.2, -4.5], color: 0x8b9dc3, opacity: 0.5 },
      { geo: new THREE.IcosahedronGeometry(0.35, 0), pos: [3.5, 2.5, -5.5], color: 0x6366f1, opacity: 0.4 },
      { geo: new THREE.OctahedronGeometry(0.3, 0), pos: [-3.5, 2.8, -5], color: 0xa78bfa, opacity: 0.4 },
    ];

    const filtered = this.quality === "low"
      ? configs.filter((_, i) => i % 2 === 0)
      : configs;

    for (const cfg of filtered) {
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.3,
        metalness: 0.5,
        transparent: true,
        opacity: cfg.opacity,
        emissive: cfg.color,
        emissiveIntensity: 0.15,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(cfg.geo, mat);
      mesh.position.set(...cfg.pos);

      mesh.userData = {
        floatSpeed: 0.3 + Math.random() * 0.3,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.2 + Math.random() * 0.25,
        rotSpeed: 0.4 + Math.random() * 0.5,
        basePos: mesh.position.clone(),
      };

      this.scene.add(mesh);
      this.geoStructures.push(mesh);
    }
  }

  /* ──────────────────────────────────────────
   * GLASS PANELS
   * ────────────────────────────────────────── */

  createGlassPanels() {
    const configs = [
      { w: 3.2, h: 2.0, pos: [-4.5, 1.5, -5], rotY: 0.3, opacity: 0.08 },
      { w: 2.4, h: 3.0, pos: [4.8, 0.5, -6], rotY: -0.4, opacity: 0.06 },
      { w: 2.0, h: 1.4, pos: [2.5, 2.8, -4], rotY: 0.6, opacity: 0.1 },
      { w: 1.8, h: 2.4, pos: [-2.8, -1.5, -3.5], rotY: -0.5, opacity: 0.08 },
    ];

    const filtered = this.quality === "low"
      ? configs.filter((_, i) => i % 2 === 0)
      : configs;

    for (const cfg of filtered) {
      const geo = new THREE.PlaneGeometry(cfg.w, cfg.h);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x8b9dc3,
        transparent: true,
        opacity: cfg.opacity,
        metalness: 0.3,
        roughness: 0.1,
        depthWrite: false,
        side: THREE.DoubleSide,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      });

      const panel = new THREE.Mesh(geo, mat);
      panel.position.set(...cfg.pos);
      panel.rotation.y = cfg.rotY;

      // Glass border
      const borderGeo = new THREE.EdgesGeometry(geo);
      const borderMat = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.2,
      });
      const border = new THREE.LineSegments(borderGeo, borderMat);
      panel.add(border);

      panel.userData = {
        floatSpeed: 0.2 + Math.random() * 0.2,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.15 + Math.random() * 0.2,
        basePos: panel.position.clone(),
      };

      this.scene.add(panel);
      this.glassPanels.push(panel);
    }
  }

  /* ──────────────────────────────────────────
   * METALLIC FRAMES
   * ────────────────────────────────────────── */

  createMetalFrames() {
    const count = this.quality === "high" ? 4 : this.quality === "medium" ? 3 : 2;

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();

      // Frame ring
      const ringGeo = new THREE.TorusGeometry(0.5, 0.03, 8, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.6,
        emissive: 0x1a1a2e,
        emissiveIntensity: 0.2,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      group.add(ring);

      // Inner glow ring
      const innerRingGeo = new THREE.TorusGeometry(0.45, 0.01, 8, 32);
      const innerRingMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.3,
      });
      const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
      group.add(innerRing);

      const angle = (i / count) * Math.PI * 2 + 1.5;
      const radius = 3.5 + Math.random() * 2.5;
      group.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3.5,
        -4 - Math.random() * 3
      );
      group.rotation.x = Math.random() * Math.PI;
      group.rotation.y = Math.random() * Math.PI;

      group.userData = {
        floatSpeed: 0.25 + Math.random() * 0.2,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.2 + Math.random() * 0.2,
        rotSpeed: 0.3 + Math.random() * 0.4,
        basePos: group.position.clone(),
      };

      this.scene.add(group);
      this.metalFrames.push(group);
    }
  }

  /* ──────────────────────────────────────────
   * BACKGROUND STRUCTURES
   * ────────────────────────────────────────── */

  createBackgroundStructures() {
    // Large dark geometric structures in the background
    const configs = [
      { geo: new THREE.BoxGeometry(8, 0.2, 6), pos: [0, -2.5, -8], color: 0x0a0a12, opacity: 0.8 },
      { geo: new THREE.BoxGeometry(6, 4, 0.2), pos: [-6, 1, -7], color: 0x0a0a12, opacity: 0.6 },
      { geo: new THREE.BoxGeometry(6, 4, 0.2), pos: [6, 1, -7], color: 0x0a0a12, opacity: 0.6 },
      { geo: new THREE.BoxGeometry(0.2, 6, 4), pos: [-7, 0, -5], color: 0x0a0a12, opacity: 0.5 },
      { geo: new THREE.BoxGeometry(0.2, 6, 4), pos: [7, 0, -5], color: 0x0a0a12, opacity: 0.5 },
    ];

    const filtered = this.quality === "low"
      ? configs.filter((_, i) => i % 2 === 0)
      : configs;

    for (const cfg of filtered) {
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.5,
        metalness: 0.3,
        transparent: true,
        opacity: cfg.opacity,
        emissive: 0x050508,
        emissiveIntensity: 0.1,
      });
      const mesh = new THREE.Mesh(cfg.geo, mat);
      mesh.position.set(...cfg.pos);

      this.scene.add(mesh);
      this.backgroundStructures.push(mesh);
    }
  }

  /* ──────────────────────────────────────────
   * GROUND
   * ────────────────────────────────────────── */

  createGround() {
    // Subtle reflective ground plane
    const geo = new THREE.PlaneGeometry(30, 20);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0a0a12,
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: 0.5,
      emissive: 0x050508,
      emissiveIntensity: 0.1,
    });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.2;
    ground.position.z = -2;
    this.scene.add(ground);
    this.ground = ground;
  }

  /* ──────────────────────────────────────────
   * LIGHTING
   * ────────────────────────────────────────── */

  setupLights() {
    // Ambient light — dark environment
    const ambient = new THREE.AmbientLight(0x1a1a2e, 0.6);
    this.scene.add(ambient);

    // Key light — soft white from upper left
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 8, 4);
    this.scene.add(keyLight);

    // Fill light — soft violet from right
    const fillLight = new THREE.DirectionalLight(0x8b9dc3, 0.5);
    fillLight.position.set(-4, 3, 2);
    this.scene.add(fillLight);

    // Rim light — violet from behind
    const rimLight = new THREE.DirectionalLight(0xa78bfa, 0.8);
    rimLight.position.set(0, 2, -6);
    this.scene.add(rimLight);

    // Secondary rim light — blue from behind right
    const rimLight2 = new THREE.DirectionalLight(0x6366f1, 0.4);
    rimLight2.position.set(4, 1, -5);
    this.scene.add(rimLight2);

    // Central interface glow
    const interfaceLight = new THREE.PointLight(0x6366f1, 0.8, 15);
    interfaceLight.position.set(0, 0.5, 1);
    this.scene.add(interfaceLight);

    // Character accent lights
    const boyLight = new THREE.PointLight(0x8b9dc3, 0.4, 8);
    boyLight.position.set(-3, 2, 0);
    this.scene.add(boyLight);

    const girlLight = new THREE.PointLight(0xa78bfa, 0.4, 8);
    girlLight.position.set(3, 2, 0);
    this.scene.add(girlLight);

    // Subtle ground glow
    const groundLight = new THREE.PointLight(0x6366f1, 0.3, 10);
    groundLight.position.set(0, -1, 0);
    this.scene.add(groundLight);

    this.animatedLights = [keyLight, fillLight, rimLight, interfaceLight, boyLight, girlLight];
  }

  /* ──────────────────────────────────────────
   * SCROLL HANDLING
   * ────────────────────────────────────────── */

  handleScroll = () => {
    const scrollY = window.scrollY || 0;
    const maxScroll = Math.max(window.innerHeight * 3, 1);
    this.scrollTarget = Math.min(scrollY / maxScroll, 1);
  };

  /* ──────────────────────────────────────────
   * UPDATE LOOP
   * ────────────────────────────────────────── */

  update(delta, elapsed) {
    // Smooth scroll offset
    this.scrollOffset += (this.scrollTarget - this.scrollOffset) * 0.05;

    // ── Camera movement ──────────────────────
    if (this.camera) {
      // Base cinematic drift
      const driftX = Math.sin(elapsed * 0.08) * 0.3;
      const driftY = Math.cos(elapsed * 0.06) * 0.15;
      const driftZ = Math.sin(elapsed * 0.05) * 0.2;

      // Mouse parallax
      const mouseX = this.mouseCurrent.x * 0.5;
      const mouseY = -this.mouseCurrent.y * 0.3;

      // Scroll-based camera movement
      const scrollZ = this.scrollOffset * 2.5;
      const scrollY = this.scrollOffset * 1.5;
      const scrollRotY = this.scrollOffset * 0.15;

      this.camera.position.x = mouseX + driftX;
      this.camera.position.y = mouseY + driftY - scrollY;
      this.camera.position.z = this.getCameraZ() + driftZ - scrollZ;

      // Camera look target shifts with scroll
      const lookTarget = new THREE.Vector3(
        mouseX * 0.3,
        -scrollY * 0.3,
        -2 - scrollRotY * 2
      );
      this.camera.lookAt(lookTarget);
    }

    // ── Characters animation ─────────────────
    for (const character of this.characters) {
      CharacterBuilder.update(character, elapsed, delta, this.mouseCurrent);
    }

    // ── Central interface animation ──────────
    if (this.centralInterface) {
      const ud = this.centralInterface.userData;
      this.centralInterface.position.y = ud.basePos.y +
        Math.sin(elapsed * ud.floatSpeed + ud.floatPhase) * ud.floatAmp;
      this.centralInterface.rotation.y = ud.baseRotY + Math.sin(elapsed * 0.1) * 0.05;
      this.centralInterface.rotation.z = Math.sin(elapsed * 0.12) * 0.02;
    }

    // ── Exam screens animation ───────────────
    for (const screen of this.examScreens) {
      screen.position.y = screen.userData.basePos.y +
        Math.sin(elapsed * screen.userData.floatSpeed + screen.userData.floatPhase) * screen.userData.floatAmp;
      screen.rotation.y += screen.userData.rotSpeed * delta;
      screen.rotation.z = Math.sin(elapsed * 0.2 + screen.userData.floatPhase) * 0.05;
    }

    // ── Question cards animation ─────────────
    for (const card of this.questionCards) {
      card.position.y = card.userData.basePos.y +
        Math.sin(elapsed * card.userData.floatSpeed + card.userData.floatPhase) * card.userData.floatAmp;
      card.rotation.y += card.userData.rotSpeed * delta;
    }

    // ── Check marks animation ────────────────
    for (const check of this.checkMarks) {
      check.position.y = check.userData.basePos.y +
        Math.sin(elapsed * check.userData.floatSpeed + check.userData.floatPhase) * check.userData.floatAmp;
      check.rotation.y += check.userData.rotSpeed * delta;
      check.rotation.z = Math.sin(elapsed * 0.3 + check.userData.floatPhase) * 0.1;
    }

    // ── Exam timers animation ────────────────
    for (const timer of this.examTimers) {
      timer.position.y = timer.userData.basePos.y +
        Math.sin(elapsed * timer.userData.floatSpeed + timer.userData.floatPhase) * timer.userData.floatAmp;
      timer.rotation.y += timer.userData.rotSpeed * delta;
      timer.rotation.x = Math.sin(elapsed * 0.2 + timer.userData.floatPhase) * 0.2;
    }

    // ── Progress rings animation ─────────────
    for (const ring of this.progressRings) {
      ring.position.y = ring.userData.basePos.y +
        Math.sin(elapsed * ring.userData.floatSpeed + ring.userData.floatPhase) * ring.userData.floatAmp;
      ring.rotation.y += ring.userData.rotSpeed * delta;
      ring.rotation.x = Math.sin(elapsed * 0.2 + ring.userData.floatPhase) * 0.2;
    }

    // ── Books animation ──────────────────────
    for (const book of this.books) {
      book.position.y = book.userData.basePos.y +
        Math.sin(elapsed * book.userData.floatSpeed + book.userData.floatPhase) * book.userData.floatAmp;
      book.rotation.y += book.userData.rotSpeed * delta;
      book.rotation.z = Math.sin(elapsed * 0.15 + book.userData.floatPhase) * 0.05;
    }

    // ── Documents animation ──────────────────
    for (const doc of this.documents) {
      doc.position.y = doc.userData.basePos.y +
        Math.sin(elapsed * doc.userData.floatSpeed + doc.userData.floatPhase) * doc.userData.floatAmp;
      doc.rotation.y += doc.userData.rotSpeed * delta;
      doc.rotation.z = Math.sin(elapsed * 0.2 + doc.userData.floatPhase) * 0.05;
    }

    // ── Geometric structures animation ───────
    for (const obj of this.geoStructures) {
      obj.position.y = obj.userData.basePos.y +
        Math.sin(elapsed * obj.userData.floatSpeed + obj.userData.floatPhase) * obj.userData.floatAmp;
      obj.rotation.y += obj.userData.rotSpeed * delta;
      obj.rotation.x += obj.userData.rotSpeed * 0.3 * delta;
    }

    // ── Glass panels animation ───────────────
    for (const panel of this.glassPanels) {
      panel.position.y = panel.userData.basePos.y +
        Math.sin(elapsed * panel.userData.floatSpeed + panel.userData.floatPhase) * panel.userData.floatAmp;
      panel.rotation.z = Math.sin(elapsed * 0.15 + panel.userData.floatPhase) * 0.03;
    }

    // ── Metal frames animation ───────────────
    for (const frame of this.metalFrames) {
      frame.position.y = frame.userData.basePos.y +
        Math.sin(elapsed * frame.userData.floatSpeed + frame.userData.floatPhase) * frame.userData.floatAmp;
      frame.rotation.y += frame.userData.rotSpeed * delta;
      frame.rotation.x += frame.userData.rotSpeed * 0.5 * delta;
    }

    // ── Animated lights ──────────────────────
    if (this.animatedLights) {
      // Key light subtle intensity change
      this.animatedLights[0].intensity = 1.2 + Math.sin(elapsed * 0.2) * 0.15;
      // Fill light subtle change
      this.animatedLights[1].intensity = 0.5 + Math.sin(elapsed * 0.35) * 0.1;
      // Rim light movement
      this.animatedLights[2].position.x = Math.sin(elapsed * 0.15) * 1.5;
      this.animatedLights[2].position.y = 2 + Math.cos(elapsed * 0.1) * 0.5;
      // Interface light pulse
      this.animatedLights[3].intensity = 0.8 + Math.sin(elapsed * 0.5) * 0.2;
      // Character lights subtle movement
      if (this.animatedLights[4]) {
        this.animatedLights[4].position.x = -3 + Math.sin(elapsed * 0.2) * 0.3;
      }
      if (this.animatedLights[5]) {
        this.animatedLights[5].position.x = 3 + Math.cos(elapsed * 0.2) * 0.3;
      }
    }

    // ── Particles drift ──────────────────────
    for (let i = 0; i < this.particles.length; i++) {
      const particles = this.particles[i];
      particles.rotation.y = elapsed * (0.003 + i * 0.001);
      particles.position.y = Math.sin(elapsed * 0.15 + i * 2) * 0.3;
      // Mouse reaction
      particles.position.x = this.mouseCurrent.x * (0.1 + i * 0.05);
    }

    // ─ Ground subtle movement ────────────────
    if (this.ground) {
      this.ground.position.y = -2.2 + Math.sin(elapsed * 0.1) * 0.05;
    }
  }
}