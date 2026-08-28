/**
 * Login3DScene.js
 * "Futuristic Exam Pro Login" — deep black space environment with
 * purple neon lighting and floating metallic/crystal 3D objects.
 * Communicates: Premium + Technology + Examination.
 */
import * as THREE from "three";
import ThreeBackground from "./ThreeBackground.js";

export default class Login3DScene extends ThreeBackground {
  constructor(containerId = "three-bg") {
    super(containerId, {
      parallaxStrength: 0.35,
    });
  }

  createFog() {
    return new THREE.FogExp2(0x020208, 0.032);
  }

  getCameraZ() {
    return 11;
  }

  buildScene() {
    // Deep black space background
    this.scene.background = new THREE.Color(0x020208);

    // Particle sprite texture
    const texture = this.createParticleTexture();

    // ── Tiny glowing stars ──────────────────────────
    this.createParticles({
      count: this.quality === "high" ? 1600 : 550,
      color: 0xffffff,
      size: 0.05,
      opacity: 0.85,
      spread: { x: 18, y: 11, z: 16 },
      texture,
    });

    // Purple star field
    this.createParticles({
      count: this.quality === "high" ? 900 : 320,
      color: 0xa855f7,
      size: 0.06,
      opacity: 0.6,
      spread: { x: 15, y: 10, z: 13 },
      texture,
    });

    // Blue-violet atmospheric particles
    this.createParticles({
      count: this.quality === "high" ? 500 : 180,
      color: 0x6366f1,
      size: 0.04,
      opacity: 0.5,
      spread: { x: 13, y: 9, z: 11 },
      texture,
    });

    // ── Larger blurred glowing particles (nebula dust) ──
    // Desktop only — expensive on mobile
    if (this.quality !== "low") {
      this.createParticles({
        count: this.quality === "high" ? 40 : 18,
        color: 0xa855f7,
        size: 0.9,
        opacity: 0.12,
        spread: { x: 14, y: 9, z: 8 },
        texture,
      });

      this.createParticles({
        count: this.quality === "high" ? 30 : 12,
        color: 0x6366f1,
        size: 1.2,
        opacity: 0.08,
        spread: { x: 12, y: 8, z: 7 },
        texture,
      });
    }

    // ── Floating 3D objects ─────────────────────────
    this.floatingObjects = [];
    this.createFloatingObjects();
  }

  setupLights() {
    // Ambient base — dark space
    const ambient = new THREE.AmbientLight(0x1e1b4b, 0.55);
    this.scene.add(ambient);

    // Key light — electric violet from above
    const keyLight = new THREE.DirectionalLight(0xa855f7, 1.3);
    keyLight.position.set(4, 7, 5);
    this.scene.add(keyLight);

    // Rim light — blue-violet from behind
    const rimLight = new THREE.DirectionalLight(0x6366f1, 0.9);
    rimLight.position.set(-5, 3, -5);
    this.scene.add(rimLight);

    // Pulsing purple point light (center)
    const pointLight = new THREE.PointLight(0xa855f7, 1.1, 32);
    pointLight.position.set(0, 0, 3);
    this.scene.add(pointLight);

    // Blue accent light (lower right)
    const blueLight = new THREE.PointLight(0x6366f1, 0.55, 26);
    blueLight.position.set(3.5, -2, 2);
    this.scene.add(blueLight);

    // Soft white fill from top
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillLight.position.set(0, 6, 2);
    this.scene.add(fillLight);

    // ── Cinematic purple nebula glow (desktop only) ──
    if (this.quality !== "low") {
      // Warm purple glow from behind the card area
      const nebulaLight = new THREE.PointLight(0x7c3aed, 0.8, 40);
      nebulaLight.position.set(0, 0, -6);
      this.scene.add(nebulaLight);

      // Cool blue-violet accent from upper-left
      const coolLight = new THREE.PointLight(0x6366f1, 0.4, 30);
      coolLight.position.set(-4, 4, -3);
      this.scene.add(coolLight);

      this.animatedLights = [pointLight, blueLight, nebulaLight];
    } else {
      this.animatedLights = [pointLight, blueLight];
    }
  }

  /* ── Floating 3D objects ───────────────────────── */
  createFloatingObjects() {
    const configs = this.buildObjectConfigs();

    const filtered = this.quality === "low"
      ? configs.filter((_, i) => i % 2 === 0)
      : configs;

    for (const cfg of filtered) {
      const obj = this.buildObject(cfg);
      if (obj) {
        this.scene.add(obj);
        this.floatingObjects.push(obj);
      }
    }
  }

  buildObjectConfigs() {
    return [
      // ── LEFT SIDE ────────────────────────────────
      // Graduation cap — education symbol (upper-left)
      {
        type: "gradCap",
        size: 0.55,
        pos: [-5.2, 3.4, -4.5],
        rotSpeed: 0.2,
        floatAmp: 0.3,
        floatSpeed: 0.45,
      },
      // Black metallic cube with purple edge (upper-left)
      {
        type: "edgeCube",
        size: 0.9,
        pos: [-4.6, 2.4, -3.5],
        rotSpeed: 0.25,
        floatAmp: 0.35,
        floatSpeed: 0.5,
      },
      // Large wireframe sphere (middle-left)
      {
        type: "wireSphere",
        radius: 1.5,
        pos: [-4.8, 0.2, -4.5],
        rotSpeed: 0.12,
        floatAmp: 0.3,
        floatSpeed: 0.4,
      },
      // Small floating metallic spheres (left)
      {
        type: "sphere",
        radius: 0.22,
        pos: [-3.6, 1.6, -2.5],
        rotSpeed: 0.3,
        floatAmp: 0.45,
        floatSpeed: 0.6,
      },
      {
        type: "sphere",
        radius: 0.15,
        pos: [-3.2, -0.6, -2.2],
        rotSpeed: 0.35,
        floatAmp: 0.5,
        floatSpeed: 0.7,
      },
      // Curved metallic ring (bottom-left)
      {
        type: "ring",
        radius: 0.8,
        tube: 0.08,
        pos: [-4.2, -1.6, -3],
        rotSpeed: 0.2,
        floatAmp: 0.3,
        floatSpeed: 0.45,
      },
      // Small floating geometric cube (left)
      {
        type: "smallCube",
        size: 0.35,
        pos: [-3.4, 2.8, -3.8],
        rotSpeed: 0.4,
        floatAmp: 0.4,
        floatSpeed: 0.55,
      },
      // Dark violet crystal shard (upper-left)
      {
        type: "crystal",
        size: 0.55,
        pos: [-5.3, 3.2, -5.2],
        rotSpeed: 0.3,
        floatAmp: 0.28,
        floatSpeed: 0.45,
      },
      // Small crystal cluster (lower-left)
      {
        type: "crystal",
        size: 0.34,
        pos: [-3.7, -2.2, -3.6],
        rotSpeed: 0.22,
        floatAmp: 0.35,
        floatSpeed: 0.5,
      },
      // Tiny crystalline fragment (far-left)
      {
        type: "tetraShard",
        size: 0.4,
        pos: [-5.6, -0.4, -5.6],
        rotSpeed: 0.35,
        floatAmp: 0.45,
        floatSpeed: 0.6,
      },

      // ── RIGHT SIDE ───────────────────────────────
      // Graduation cap — education symbol (upper-right)
      {
        type: "gradCap",
        size: 0.45,
        pos: [5.3, 3.0, -4.8],
        rotSpeed: 0.25,
        floatAmp: 0.28,
        floatSpeed: 0.5,
      },
      // Large hollow/cut-out cube (upper-right)
      {
        type: "hollowCube",
        size: 1.3,
        pos: [4.7, 2.2, -4],
        rotSpeed: 0.18,
        floatAmp: 0.35,
        floatSpeed: 0.5,
      },
      // Floating small spheres (right)
      {
        type: "sphere",
        radius: 0.2,
        pos: [3.7, 1.4, -2.6],
        rotSpeed: 0.3,
        floatAmp: 0.45,
        floatSpeed: 0.6,
      },
      {
        type: "sphere",
        radius: 0.13,
        pos: [3.3, -0.4, -2.3],
        rotSpeed: 0.35,
        floatAmp: 0.5,
        floatSpeed: 0.7,
      },
      // Futuristic dark checklist/task-card (lower-right)
      {
        type: "taskCard",
        pos: [4.4, -1.4, -3.2],
        rotSpeed: 0.15,
        floatAmp: 0.3,
        floatSpeed: 0.45,
      },
      // Small polygon/icosahedron (bottom-right)
      {
        type: "icosahedron",
        radius: 0.45,
        pos: [3.6, -1.8, -2.8],
        rotSpeed: 0.35,
        floatAmp: 0.4,
        floatSpeed: 0.55,
      },
      // Tall dark crystal shard (upper-right)
      {
        type: "crystal",
        size: 0.5,
        pos: [5.4, 2.6, -5.4],
        rotSpeed: 0.18,
        floatAmp: 0.25,
        floatSpeed: 0.4,
      },
      // Small crystalline fragment (far-right)
      {
        type: "tetraShard",
        size: 0.4,
        pos: [5.5, -1.0, -5.2],
        rotSpeed: 0.32,
        floatAmp: 0.42,
        floatSpeed: 0.58,
      },
    ];
  }

  buildObject(cfg) {
    const group = new THREE.Group();

    switch (cfg.type) {
      case "gradCap": {
        // ── Graduation cap (mortarboard) ──────────────
        const size = cfg.size || 0.5;

        // Flat square board (the top)
        const boardGeo = new THREE.BoxGeometry(size * 1.6, size * 0.08, size * 1.6);
        const boardMat = new THREE.MeshStandardMaterial({
          color: 0x0a0a14,
          roughness: 0.25,
          metalness: 0.9,
          transparent: true,
          opacity: 0.92,
          emissive: 0x4c1d95,
          emissiveIntensity: 0.25,
        });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.y = size * 0.3;
        group.add(board);

        // Purple glowing edge on board
        const boardEdges = new THREE.EdgesGeometry(boardGeo);
        const boardEdgeMat = new THREE.LineBasicMaterial({
          color: 0xa855f7,
          transparent: true,
          opacity: 0.85,
        });
        const boardEdgeLines = new THREE.LineSegments(boardEdges, boardEdgeMat);
        boardEdgeLines.position.y = size * 0.3;
        group.add(boardEdgeLines);

        // Small cap base (sits under the board)
        const baseGeo = new THREE.CylinderGeometry(size * 0.35, size * 0.4, size * 0.3, 8);
        const baseMat = new THREE.MeshStandardMaterial({
          color: 0x0a0a14,
          roughness: 0.3,
          metalness: 0.85,
          transparent: true,
          opacity: 0.9,
          emissive: 0x312e81,
          emissiveIntensity: 0.3,
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -size * 0.05;
        group.add(base);

        // Tassel — thin glowing cylinder
        const tasselGeo = new THREE.CylinderGeometry(size * 0.02, size * 0.02, size * 0.5, 6);
        const tasselMat = new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          roughness: 0.15,
          metalness: 0.3,
          emissive: 0xa855f7,
          emissiveIntensity: 1.5,
          transparent: true,
          opacity: 0.9,
        });
        const tassel = new THREE.Mesh(tasselGeo, tasselMat);
        tassel.position.set(size * 0.55, -size * 0.1, 0);
        tassel.rotation.z = 0.3;
        group.add(tassel);

        // Tassel tip — small glowing sphere
        const tipGeo = new THREE.SphereGeometry(size * 0.06, 8, 8);
        const tipMat = new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          roughness: 0.1,
          metalness: 0.2,
          emissive: 0xa855f7,
          emissiveIntensity: 2.0,
          transparent: true,
          opacity: 0.95,
        });
        const tip = new THREE.Mesh(tipGeo, tipMat);
        tip.position.set(size * 0.72, -size * 0.32, 0);
        group.add(tip);

        // Soft inner glow
        const glowGeo = new THREE.SphereGeometry(size * 0.25, 12, 12);
        const glowMat = new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          roughness: 0.1,
          metalness: 0.2,
          emissive: 0xa855f7,
          emissiveIntensity: 1.2,
          transparent: true,
          opacity: 0.5,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.y = size * 0.15;
        group.add(glow);
        break;
      }

      case "edgeCube": {
        const geo = new THREE.BoxGeometry(cfg.size, cfg.size, cfg.size);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x0a0a14,
          roughness: 0.3,
          metalness: 0.9,
          transparent: true,
          opacity: 0.92,
        });
        const cube = new THREE.Mesh(geo, mat);
        group.add(cube);

        // Purple glowing edge
        const edges = new THREE.EdgesGeometry(geo);
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0xa855f7,
          transparent: true,
          opacity: 0.9,
        });
        const edgeLines = new THREE.LineSegments(edges, edgeMat);
        group.add(edgeLines);
        group.userData.edgeLines = edgeLines;
        break;
      }

      case "wireSphere": {
        const geo = new THREE.SphereGeometry(cfg.radius, 24, 16);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x1e1b4b,
          roughness: 0.2,
          metalness: 0.6,
          transparent: true,
          opacity: 0.15,
          wireframe: true,
          emissive: 0xa855f7,
          emissiveIntensity: 0.6,
        });
        const sphere = new THREE.Mesh(geo, mat);
        group.add(sphere);

        // Inner glowing core
        const coreGeo = new THREE.SphereGeometry(cfg.radius * 0.25, 16, 16);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          roughness: 0.1,
          metalness: 0.3,
          emissive: 0xa855f7,
          emissiveIntensity: 2.0,
          transparent: true,
          opacity: 0.9,
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        group.add(core);
        break;
      }

      case "sphere": {
        const geo = new THREE.SphereGeometry(cfg.radius, 24, 24);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x0a0a14,
          roughness: 0.2,
          metalness: 0.95,
          transparent: true,
          opacity: 0.95,
          emissive: 0x4c1d95,
          emissiveIntensity: 0.25,
        });
        const sphere = new THREE.Mesh(geo, mat);
        group.add(sphere);

        // Purple rim highlight
        const rimGeo = new THREE.SphereGeometry(cfg.radius * 1.02, 16, 16);
        const rimMat = new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          roughness: 0.2,
          metalness: 0.4,
          transparent: true,
          opacity: 0.15,
          wireframe: true,
          emissive: 0xa855f7,
          emissiveIntensity: 0.5,
        });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        group.add(rim);
        break;
      }

      case "ring": {
        const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 64);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x0a0a14,
          roughness: 0.25,
          metalness: 0.9,
          transparent: true,
          opacity: 0.9,
          emissive: 0x4c1d95,
          emissiveIntensity: 0.3,
        });
        const ring = new THREE.Mesh(geo, mat);
        group.add(ring);

        // Purple neon strip on ring
        const stripGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube * 1.6, 12, 64, Math.PI * 1.2);
        const stripMat = new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          roughness: 0.15,
          metalness: 0.3,
          emissive: 0xa855f7,
          emissiveIntensity: 2.0,
          transparent: true,
          opacity: 0.95,
        });
        const strip = new THREE.Mesh(stripGeo, stripMat);
        group.add(strip);
        break;
      }

      case "smallCube": {
        const geo = new THREE.BoxGeometry(cfg.size, cfg.size, cfg.size);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x0a0a14,
          roughness: 0.3,
          metalness: 0.9,
          transparent: true,
          opacity: 0.92,
        });
        const cube = new THREE.Mesh(geo, mat);
        group.add(cube);

        const edges = new THREE.EdgesGeometry(geo);
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0x818cf8,
          transparent: true,
          opacity: 0.8,
        });
        const edgeLines = new THREE.LineSegments(edges, edgeMat);
        group.add(edgeLines);
        break;
      }

      case "hollowCube": {
        // Wireframe cube frame (hollow look)
        const geo = new THREE.BoxGeometry(cfg.size, cfg.size, cfg.size);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x0a0a14,
          roughness: 0.25,
          metalness: 0.9,
          transparent: true,
          opacity: 0.35,
          wireframe: true,
          emissive: 0x4c1d95,
          emissiveIntensity: 0.4,
        });
        const cube = new THREE.Mesh(geo, mat);
        group.add(cube);

        // Solid edges
        const edges = new THREE.EdgesGeometry(geo);
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0xa855f7,
          transparent: true,
          opacity: 0.9,
        });
        const edgeLines = new THREE.LineSegments(edges, edgeMat);
        group.add(edgeLines);

        // Inner glowing core
        const coreGeo = new THREE.SphereGeometry(cfg.size * 0.2, 16, 16);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          roughness: 0.1,
          metalness: 0.3,
          emissive: 0xa855f7,
          emissiveIntensity: 2.2,
          transparent: true,
          opacity: 0.9,
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        group.add(core);
        break;
      }

      case "taskCard": {
        // Dark checklist/task-card object
        const cardGeo = new THREE.BoxGeometry(1.1, 0.75, 0.12);
        const cardMat = new THREE.MeshStandardMaterial({
          color: 0x0a0a14,
          roughness: 0.35,
          metalness: 0.85,
          transparent: true,
          opacity: 0.92,
        });
        const card = new THREE.Mesh(cardGeo, cardMat);
        group.add(card);

        // Purple border
        const edges = new THREE.EdgesGeometry(cardGeo);
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0xa855f7,
          transparent: true,
          opacity: 0.85,
        });
        const edgeLines = new THREE.LineSegments(edges, edgeMat);
        group.add(edgeLines);

        // Checklist lines (small glowing bars)
        const lineMat = new THREE.MeshStandardMaterial({
          color: 0x818cf8,
          roughness: 0.2,
          metalness: 0.4,
          emissive: 0x6366f1,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.8,
        });
        for (let i = 0; i < 3; i++) {
          const lineGeo = new THREE.BoxGeometry(0.7, 0.05, 0.02);
          const line = new THREE.Mesh(lineGeo, lineMat);
          line.position.set(0, 0.2 - i * 0.18, 0.07);
          group.add(line);
        }

        // Checkbox squares
        const boxMat = new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          roughness: 0.2,
          metalness: 0.4,
          emissive: 0xa855f7,
          emissiveIntensity: 1.2,
          transparent: true,
          opacity: 0.9,
        });
        for (let i = 0; i < 3; i++) {
          const boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.02);
          const box = new THREE.Mesh(boxGeo, boxMat);
          box.position.set(-0.42, 0.2 - i * 0.18, 0.07);
          group.add(box);
        }
        break;
      }

      case "icosahedron": {
        const geo = new THREE.IcosahedronGeometry(cfg.radius, 0);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x0a0a14,
          roughness: 0.25,
          metalness: 0.9,
          transparent: true,
          opacity: 0.9,
          emissive: 0x4c1d95,
          emissiveIntensity: 0.3,
        });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);

        const edges = new THREE.EdgesGeometry(geo);
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0xa855f7,
          transparent: true,
          opacity: 0.85,
        });
        const edgeLines = new THREE.LineSegments(edges, edgeMat);
        group.add(edgeLines);
        break;
      }

      case "crystal": {
        // Dark glass-like octahedron crystal (elongated)
        const size = cfg.size || 0.5;
        const geo = new THREE.OctahedronGeometry(size, 0);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x0a0a14,
          roughness: 0.15,
          metalness: 0.95,
          transparent: true,
          opacity: 0.92,
          emissive: 0x312e81,
          emissiveIntensity: 0.35,
        });
        const crystal = new THREE.Mesh(geo, mat);
        crystal.scale.y = 2.0;
        group.add(crystal);

        // Purple glowing edges
        const edges = new THREE.EdgesGeometry(geo);
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0xa855f7,
          transparent: true,
          opacity: 0.7,
        });
        const edgeLines = new THREE.LineSegments(edges, edgeMat);
        edgeLines.scale.y = 2.0;
        group.add(edgeLines);

        // Soft inner purple glow
        const glowGeo = new THREE.SphereGeometry(size * 0.3, 12, 12);
        const glowMat = new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          roughness: 0.1,
          metalness: 0.2,
          emissive: 0xa855f7,
          emissiveIntensity: 1.6,
          transparent: true,
          opacity: 0.85,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        group.add(glow);
        break;
      }

      case "tetraShard": {
        // Small metallic/sharp crystal fragment
        const size = cfg.size || 0.4;
        const geo = new THREE.TetrahedronGeometry(size, 0);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x0a0a14,
          roughness: 0.2,
          metalness: 0.95,
          transparent: true,
          opacity: 0.9,
          emissive: 0x4c1d95,
          emissiveIntensity: 0.3,
        });
        const shard = new THREE.Mesh(geo, mat);
        shard.rotation.y = 0.6;
        group.add(shard);

        // Blue-violet glowing edges
        const edges = new THREE.EdgesGeometry(geo);
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0x818cf8,
          transparent: true,
          opacity: 0.8,
        });
        group.add(new THREE.LineSegments(edges, edgeMat));
        break;
      }

      default:
        return null;
    }

    group.position.set(...cfg.pos);
    group.userData.rotSpeed = cfg.rotSpeed || 0.2;
    group.userData.floatAmp = cfg.floatAmp || 0.3;
    group.userData.floatSpeed = cfg.floatSpeed || 0.5;
    group.userData.floatPhase = Math.random() * Math.PI * 2;
    group.userData.basePos = group.position.clone();

    return group;
  }

  update(delta, elapsed) {
    // ── Animate floating objects ────────────────────
    for (const obj of this.floatingObjects) {
      obj.position.y = obj.userData.basePos.y +
        Math.sin(elapsed * obj.userData.floatSpeed + obj.userData.floatPhase) * obj.userData.floatAmp;
      obj.rotation.y += obj.userData.rotSpeed * delta;
      obj.rotation.x += obj.userData.rotSpeed * 0.35 * delta;
    }

    // ── Animate lights ──────────────────────────────
    if (this.animatedLights) {
      this.animatedLights[0].intensity = 1.0 + Math.sin(elapsed * 0.5) * 0.25;
      this.animatedLights[1].intensity = 0.5 + Math.sin(elapsed * 0.35) * 0.15;
      // Nebula glow — slow breathing (desktop only)
      if (this.animatedLights.length > 2) {
        this.animatedLights[2].intensity = 0.7 + Math.sin(elapsed * 0.25) * 0.2;
      }
    }

    // ── Slow particle field rotation ────────────────
    for (const particles of this.particles) {
      particles.rotation.y = elapsed * 0.008;
      particles.rotation.x = Math.sin(elapsed * 0.06) * 0.015;
    }
  }
}