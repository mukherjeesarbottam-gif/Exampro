/**
 * Register3DScene.js
 * "Cinematic Nature World" — a living 3D mountain/lake landscape with
 * pine forests, mist, warm sunlight, drifting fireflies and layered
 * depth. Reuses the optimized ThreeBackground base class (device-aware
 * quality scaling, reduced motion, resize, parallax and cleanup).
 *
 * Depth layers (near → far):
 *   foreground leaves / lanterns / stones
 *   lake + ground
 *   pine forest + rocks + flowers
 *   near mountain ridge
 *   far mountain ridge + clouds
 *   gradient sky + warm sun
 */
import * as THREE from "three";
import ThreeBackground from "./ThreeBackground.js";

export default class Register3DScene extends ThreeBackground {
  constructor(containerId = "three-bg") {
    super(containerId, {
      parallaxStrength: 0.45,
    });
  }

  createFog() {
    // Warm atmospheric haze that matches the horizon color.
    return new THREE.FogExp2(0xd8c0ae, 0.016);
  }

  getCameraZ() {
    return 12;
  }

  buildScene() {
    // Fallback solid color (sky sphere covers the full background)
    this.scene.background = new THREE.Color(0x35406b);

    // Owned object lists (initialized here — after super() subclass
    // fields would initialize too late, so we do it in buildScene).
    this.treeGroup = null;
    this.waterMats = [];
    this.mistSprites = [];
    this.cloudSprites = [];
    this.leafMeshes = [];
    this.fireflyPoints = [];
    this.fireflySpeeds = [];
    this.fireflyPhases = [];
    this.lanternSprites = [];
    this.pineTrees = [];
    this.butterflies = [];
    this.butterflyWings = [];
    this.moonSprite = null;
    this.tinyFlowers = [];

    // ── Sky + sun + moon ───────────────────────
    this.createSky();
    this.createSun();
    this.createMoon();

    // ── Mountains (two ridge layers) ───────────
    this.createMountains();

    // ── Lake + ground ──────────────────────────
    this.createLake();
    this.createGround();

    // ── Nature midground ───────────────────────
    this.createTreeBand();
    this.createRocks();
    this.createFlowers();
    this.createTinyFlowers();

    // ── Atmosphere ─────────────────────────────
    this.createMist();
    this.createClouds();
    this.createFireflies();
    this.createButterflies();
    this.createDustMotes();

    // ── Foreground decorations (desktop only) ──
    if (this.quality !== "low") {
      this.createForegroundLeaves();
      this.createLanterns();
    }
  }

  setupLights() {
    // Cool blue-violet ambient — natural shadow side
    const ambient = new THREE.AmbientLight(0x8fa6d9, 0.4);
    this.scene.add(ambient);

    // Warm golden sunlight from the side (cinematic key)
    const sun = new THREE.DirectionalLight(0xffc284, 1.6);
    sun.position.set(6, 4.5, 5);
    this.scene.add(sun);

    // Cool blue fill from the opposite side
    const fill = new THREE.DirectionalLight(0x6f9bff, 0.45);
    fill.position.set(-6, -1, 3);
    this.scene.add(fill);

    // Warm back-light rim behind the mountains
    const rim = new THREE.DirectionalLight(0xffd9a0, 0.6);
    rim.position.set(-4, 3, -10);
    this.scene.add(rim);

    // Soft purple ambient glow near the registration card area
    const cardGlow = new THREE.PointLight(0x8b5cf6, 0.55, 30);
    cardGlow.position.set(0, 0.8, 2);
    this.scene.add(cardGlow);

    // Faint cool fill from below (lake reflection bounce)
    const bounce = new THREE.PointLight(0x4d7cc0, 0.25, 22);
    bounce.position.set(0, -2, -4);
    this.scene.add(bounce);

    this.animatedLights = [sun, cardGlow];
  }

  /* ── SKY ─────────────────────────────────── */
  createSky() {
    const tex = this.createSkyTexture();
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(80, 24, 16), mat);
    this.scene.add(sky);

    // Keep a reference for subtle motion
    this.skyMesh = sky;
    this.skyTex = tex;
  }

  createSkyTexture() {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const ctx = c.getContext("2d");

    const g = ctx.createLinearGradient(0, 0, 0, 256);
    // Top: deep indigo-blue (cool shadows)
    g.addColorStop(0, "#2b3563");
    // Upper mid: soft violet
    g.addColorStop(0.42, "#5b5f98");
    // Horizon: warm amber/peach (sunset glow)
    g.addColorStop(0.78, "#e0a878");
    g.addColorStop(0.92, "#f2cfa6");
    g.addColorStop(1, "#f7dfc2");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 256);

    // Soft blurred warm band just above horizon
    ctx.globalCompositeOperation = "overlay";
    const warm = ctx.createRadialGradient(32, 205, 4, 32, 205, 90);
    warm.addColorStop(0, "rgba(255,190,120,0.55)");
    warm.addColorStop(1, "rgba(255,190,120,0)");
    ctx.fillStyle = warm;
    ctx.fillRect(0, 120, 64, 136);

    // Subtle high clouds brush marks
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 7; i++) {
      const y = 22 + Math.random() * 120;
      const x = 8 + Math.random() * 48;
      const glow = ctx.createRadialGradient(x, y, 2, x, y, 26);
      glow.addColorStop(0, "rgba(255,225,200,0.16)");
      glow.addColorStop(1, "rgba(255,225,200,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 64, 256);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ── SUN ─────────────────────────────────── */
  createSun() {
    const texture = this.createParticleTexture();

    // Core glow
    const coreMat = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffe1b0,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const core = new THREE.Sprite(coreMat);
    core.scale.set(6, 6, 1);
    core.position.set(6, 0.6, -32);
    this.scene.add(core);

    // Large soft halo
    const haloMat = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffb982,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(16, 16, 1);
    halo.position.set(6, 0.6, -33);
    this.scene.add(halo);

    this.sunCore = core;
    this.sunHalo = halo;
  }

  /* ── MOON ────────────────────────────────── */
  createMoon() {
    const texture = this.createParticleTexture();

    // Bright pale moon disc — high in the cool sky
    const coreMat = new THREE.SpriteMaterial({
      map: texture,
      color: 0xfffdf6,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      fog: false,
    });
    const core = new THREE.Sprite(coreMat);
    core.scale.set(3.2, 3.2, 1);
    core.position.set(-9, 6.8, -34);
    this.scene.add(core);

    // Soft warm-white inner glow
    const innerMat = new THREE.SpriteMaterial({
      map: texture,
      color: 0xfff2d8,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const inner = new THREE.Sprite(innerMat);
    inner.scale.set(5.2, 5.2, 1);
    inner.position.set(-9, 6.8, -35);
    this.scene.add(inner);

    // Faint cool halo around the moon
    const haloMat = new THREE.SpriteMaterial({
      map: texture,
      color: 0xd8dcf5,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(8, 8, 1);
    halo.position.set(-9, 6.8, -36);
    this.scene.add(halo);

    this.moonSprite = core;
    this.moonInner = inner;
    this.moonHalo = halo;
  }

  /* ── MOUNTAINS ───────────────────────────── */
  createMountains() {
    // Far ridge — misty lavender, hazy, low contrast
    this.createRidge({
      xStart: -26,
      xEnd: 26,
      segments: 26,
      baseY: -2.1,
      height: 4.2,
      jitter: 1.6,
      z: -19.5,
      color: 0xa99fc4,
      emissive: 0x000000,
    });

    // Near ridge — darker blue-gray silhouette
    this.createRidge({
      xStart: -24,
      xEnd: 24,
      segments: 22,
      baseY: -2.15,
      height: 3.1,
      jitter: 1.15,
      z: -13.5,
      color: 0x4a5368,
      emissive: 0x0e1220,
    });
  }

  createRidge(opts) {
    const { xStart, xEnd, segments, baseY, height, jitter, z, color, emissive } = opts;
    const shape = new THREE.Shape();
    const topPoints = [];

    const n = (i, s1, s2, s3, p1, p2, p3) =>
      Math.sin(i * s1 + p1) * 0.45 +
      Math.sin(i * s2 + p2) * 0.35 +
      Math.sin(i * s3 + p3) * 0.2;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = xStart + (xEnd - xStart) * t;
      const noise = n(i, 0.24, 0.55, 1.3, 2.1, 0.7, 4.2);
      const y = baseY + height * (0.35 + 0.65 * (0.5 + noise * 0.5)) * jitter;
      topPoints.push(new THREE.Vector2(x, y));
    }

    shape.moveTo(xStart, baseY - 0.2);
    for (const p of topPoints) shape.lineTo(p.x, p.y);
    shape.lineTo(xEnd, baseY - 0.2);
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape, 1);
    const mat = new THREE.MeshLambertMaterial({
      color,
      emissive,
      emissiveIntensity: 0.35,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = z;
    this.scene.add(mesh);
    return mesh;
  }

  /* ── LAKE ────────────────────────────────── */
  createLake() {
    const geo = new THREE.PlaneGeometry(70, 24);
    const opts = {
      color: 0x1e3d60,
      roughness: 0.28,
      metalness: 0.7,
      transparent: true,
      opacity: 0.92,
    };

    // Animated ripple map on desktop/tablet only
    if (this.quality !== "low") {
      const map = this.createWaterTexture();
      opts.map = map;
      this.waterMats = [];
    }

    const mat = new THREE.MeshStandardMaterial(opts);
    if (opts.map) this.waterMats.push(mat);

    const water = new THREE.Mesh(geo, mat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -1.95, -14);
    this.scene.add(water);
  }

  createWaterTexture() {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "#1e3d60";
    ctx.fillRect(0, 0, 256, 64);

    // Horizontal shimmer streaks
    for (let i = 0; i < 46; i++) {
      const y = Math.random() * 64;
      const len = 60 + Math.random() * 196;
      const x = Math.random() * 40 - 20;
      ctx.fillStyle = `rgba(180,215,255,${0.03 + Math.random() * 0.06})`;
      ctx.fillRect(x, y, len, 1 + Math.random());
    }

    // Warm sun-glint column
    const glint = ctx.createLinearGradient(120, 0, 200, 64);
    glint.addColorStop(0, "rgba(255,200,140,0.16)");
    glint.addColorStop(1, "rgba(255,200,140,0)");
    ctx.fillStyle = glint;
    ctx.fillRect(80, 0, 160, 64);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2.5, 1);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ── GROUND ──────────────────────────────── */
  createGround() {
    const geo = new THREE.PlaneGeometry(80, 30);
    const mat = new THREE.MeshLambertMaterial({
      color: 0x2c3a2e,
      flatShading: true,
    });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -2.28, -13);
    this.scene.add(ground);
  }

  /* ── PINE TREES ──────────────────────────── */
  createPineTree(scale = 1, tint = 0) {
    const group = new THREE.Group();
    const s = scale;

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3526 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s, 0.09 * s, 0.7 * s, 6), trunkMat);
    trunk.position.y = 0.35 * s;
    group.add(trunk);

    const base = tint / 255;
    const coneMat = new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.12 + base * 0.04, 0.3 + base * 0.05, 0.24 + base * 0.05),
      flatShading: true,
    });

    const layers = [
      { r: 0.62 * s, h: 0.95 * s, y: 0.72 * s },
      { r: 0.48 * s, h: 0.85 * s, y: 1.22 * s },
      { r: 0.33 * s, h: 0.75 * s, y: 1.68 * s },
    ];
    for (const L of layers) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(L.r, L.h, 7), coneMat);
      cone.position.y = L.y;
      cone.rotation.y = Math.random() * Math.PI;
      group.add(cone);
    }

    group.userData = {
      swaySpeed: 0.25 + Math.random() * 0.3,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmp: 0.012 + Math.random() * 0.014,
    };
    return group;
  }

  createTreeBand() {
    const treeGroup = new THREE.Group();
    const count = this.quality === "high" ? 26 : this.quality === "medium" ? 16 : 8;

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (1.8 + Math.random() * 16);
      const z = -7 - Math.random() * 7;
      const scale = 0.7 + Math.random() * 1.4;

      // Keep the center clear behind the registration card
      const clearRadius = 4.2;
      const distFromCenter = Math.hypot(x, z * 0.5);
      if (distFromCenter < clearRadius) continue;

      const tree = this.createPineTree(scale, Math.floor(Math.random() * 40));
      tree.position.set(x, -2.18, z);
      tree.rotation.y = Math.random() * Math.PI * 2;
      treeGroup.add(tree);
      this.pineTrees.push(tree);
    }

    this.scene.add(treeGroup);
    this.treeGroup = treeGroup;
  }

  /* ── ROCKS ───────────────────────────────── */
  createRocks() {
    const rockMatA = new THREE.MeshLambertMaterial({ color: 0x616a75, flatShading: true });
    const rockMatB = new THREE.MeshLambertMaterial({ color: 0x4d5560, flatShading: true });

    const spots = [
      [-7.5, -2.1, -6, 0.5],
      [-6.2, -2.12, -7.4, 0.32],
      [7.6, -2.1, -6.2, 0.55],
      [6.4, -2.13, -4.6, 0.38],
      [5.4, -2.12, -8.4, 0.3],
      [-8.2, -2.16, -9.2, 0.42],
      [8.6, -2.17, -9.6, 0.36],
    ];

    const filtered = this.quality === "low" ? spots.filter((_, i) => i % 2 === 0) : spots;

    for (const [x, y, z, s] of filtered) {
      const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), Math.random() > 0.5 ? rockMatA : rockMatB);
      rock.position.set(x + (Math.random() - 0.5) * 0.6, y, z);
      rock.scale.y = 0.55;
      rock.rotation.set(Math.random() * 0.6, Math.random() * Math.PI, Math.random() * 0.6);
      this.scene.add(rock);
    }
  }

  /* ── FLOWERS ─────────────────────────────── */
  createFlowers() {
    const flowerColors = [0xd96c9a, 0xf2e3c6, 0x9b6fd0, 0xeda16b];
    const count = this.quality === "high" ? 16 : this.quality === "medium" ? 9 : 4;
    const positions = [];

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (2.2 + Math.random() * 9);
      const z = -3.2 - Math.random() * 4.5;
      positions.push([x, z]);
    }

    for (const [x, z] of positions) {
      const group = new THREE.Group();
      const h = 0.25 + Math.random() * 0.3;

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, h, 5),
        new THREE.MeshLambertMaterial({ color: 0x3c5a38 })
      );
      stem.position.y = h / 2;
      group.add(stem);

      const headColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 6, 5),
        new THREE.MeshLambertMaterial({ color: headColor })
      );
      head.position.y = h + 0.02;
      group.add(head);

      group.position.set(x, -2.2, z);
      group.userData = {
        swaySpeed: 0.5 + Math.random() * 0.5,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: 0.06,
      };
      this.scene.add(group);
    }
  }

  /* ── TINY GROUND FLOWERS ─────────────────── */
  createTinyFlowers() {
    const colors = [0xe86a9e, 0xffd27a, 0xb78cf0, 0xff9e5e, 0xfff0c8, 0x7fd08f];
    const count = this.quality === "high" ? 48 : this.quality === "medium" ? 30 : 14;

    // Scattered closer to the foreground (beside/near the card's ground)
    for (let i = 0; i < count; i++) {
      const side = Math.random() > 0.5 ? -1 : 1;
      const x = side * (0.8 + Math.random() * 7.2);
      const z = -1.4 - Math.random() * 4.0;

      // Tiny stem
      const h = 0.12 + Math.random() * 0.18;
      const group = new THREE.Group();
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.011, h, 4),
        new THREE.MeshLambertMaterial({ color: 0x3f6b38 })
      );
      stem.position.y = h / 2;
      group.add(stem);

      // Brighter, larger round head with a slightly deeper center
      const headColor = colors[Math.floor(Math.random() * colors.length)];
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.045 + Math.random() * 0.025, 6, 5),
        new THREE.MeshLambertMaterial({
          color: headColor,
          emissive: headColor,
          emissiveIntensity: 0.25,
        })
      );
      head.position.y = h + 0.02;
      group.add(head);

      const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 4, 3),
        new THREE.MeshLambertMaterial({ color: 0xc77a3c })
      );
      center.position.y = h + 0.05;
      group.add(center);

      group.position.set(x, -2.2, z);
      group.userData = {
        swaySpeed: 0.6 + Math.random() * 0.6,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: 0.05 + Math.random() * 0.05,
      };
      this.scene.add(group);
      this.tinyFlowers.push(group);
    }
  }

  /* ── MIST ────────────────────────────────── */
  createMist() {
    const texture = this.createParticleTexture();
    const count = this.quality === "high" ? 9 : this.quality === "medium" ? 6 : 4;

    for (let i = 0; i < count; i++) {
      const mat = new THREE.SpriteMaterial({
        map: texture,
        color: 0xf3e6da,
        transparent: true,
        opacity: 0.11 + Math.random() * 0.08,
        depthWrite: false,
        fog: false,
      });
      const sprite = new THREE.Sprite(mat);
      const s = 4 + Math.random() * 5;
      sprite.scale.set(s, s * 0.6, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 26,
        0.4 + Math.random() * 1.6,
        -7 - Math.random() * 9
      );
      sprite.userData = {
        speed: 0.12 + Math.random() * 0.18,
        xMin: -16,
        xMax: 16,
      };
      this.scene.add(sprite);
      this.mistSprites.push(sprite);
    }
  }

  /* ── CLOUDS ──────────────────────────────── */
  createClouds() {
    if (this.quality === "low") return;

    const texture = this.createParticleTexture();
    const count = this.quality === "high" ? 6 : 3;

    for (let i = 0; i < count; i++) {
      const mat = new THREE.SpriteMaterial({
        map: texture,
        color: 0xffe5cc,
        transparent: true,
        opacity: 0.22 + Math.random() * 0.14,
        depthWrite: false,
        fog: false,
      });
      const sprite = new THREE.Sprite(mat);
      const s = 6 + Math.random() * 5;
      sprite.scale.set(s, s * 0.42, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 40,
        2.6 + Math.random() * 2.6,
        -26 - Math.random() * 8
      );
      sprite.userData = {
        speed: 0.18 + Math.random() * 0.2,
        xMin: -22,
        xMax: 22,
      };
      this.scene.add(sprite);
      this.cloudSprites.push(sprite);
    }
  }

  /* ── FIREFLIES ───────────────────────────── */
  createFireflies() {
    const texture = this.createParticleTexture();
    const count = this.quality === "high" ? 120 : this.quality === "medium" ? 65 : 30;

    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const amps = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = -1.2 + Math.random() * 4.2;
      positions[i * 3 + 2] = -2.5 - Math.random() * 9;
      speeds[i] = 0.3 + Math.random() * 0.7;
      phases[i] = Math.random() * Math.PI * 2;
      amps[i] = 0.15 + Math.random() * 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const warm = new THREE.PointsMaterial({
      color: 0xffe08a,
      size: 0.07,
      map: texture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geo, warm);
    this.scene.add(points);

    this.fireflyPoints = points;
    this.fireflySpeeds = speeds;
    this.fireflyPhases = phases;
    this.fireflyAmps = amps;
  }

  /* ── BUTTERFLIES ─────────────────────────── */
  createButterflies() {
    // 3D stylized butterflies that drift beside the registration card.
    // Wings are angled in 3D (rotated on Z + Y) with a soft glow so they
    // read clearly against the landscape.
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.quadraticCurveTo(0.35, 0.55, 0, 1);
    wingShape.quadraticCurveTo(-0.35, 0.55, 0, 0);

    const wingColors = [0xff7ba9, 0x7fb8ff, 0xd9a8ff, 0x7fe0b0];
    const count = this.quality === "high" ? 6 : this.quality === "medium" ? 4 : 2;

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();

      // Slightly larger dark body
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.16, 6),
        new THREE.MeshLambertMaterial({ color: 0x2a2030 })
      );
      body.rotation.x = Math.PI / 2;
      group.add(body);

      // Brighter wing material with a soft emissive glow
      const wingColor = wingColors[Math.floor(Math.random() * wingColors.length)];
      const wingMat = new THREE.MeshLambertMaterial({
        color: wingColor,
        emissive: wingColor,
        emissiveIntensity: 0.35,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      });

      // Upper-left wing — angled in 3D (Z tilt + slight Y twist)
      const wingL = new THREE.Mesh(wingShape, wingMat);
      wingL.position.set(-0.05, 0.02, 0);
      wingL.rotation.z = 0.3;
      wingL.rotation.y = 0.15;
      group.add(wingL);

      // Upper-right wing — mirrored
      const wingR = new THREE.Mesh(wingShape, wingMat);
      wingR.position.set(0.05, 0.02, 0);
      wingR.rotation.z = -0.3;
      wingR.rotation.y = -0.15;
      wingR.scale.x = -1;
      group.add(wingR);

      // Lower-left wing — smaller, angled downward
      const wingMat2 = wingMat.clone();
      wingMat2.opacity = 0.8;
      const wing2L = new THREE.Mesh(wingShape, wingMat2);
      wing2L.scale.setScalar(0.7);
      wing2L.position.set(-0.04, -0.03, -0.02);
      wing2L.rotation.z = 0.2;
      wing2L.rotation.y = 0.1;
      group.add(wing2L);

      // Lower-right wing — mirrored
      const wing2R = new THREE.Mesh(wingShape, wingMat2);
      wing2R.scale.setScalar(0.7);
      wing2R.scale.x *= -1;
      wing2R.position.set(0.04, -0.03, -0.02);
      wing2R.rotation.z = -0.2;
      wing2R.rotation.y = -0.1;
      group.add(wing2R);

      // Soft glow sprite behind the butterfly for visibility
      const glowMat = new THREE.SpriteMaterial({
        map: this.createParticleTexture(),
        color: wingColor,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glow = new THREE.Sprite(glowMat);
      glow.scale.set(0.5, 0.5, 1);
      group.add(glow);

      // Position beside the registration card (left & right sides, mid-air)
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (2.9 + Math.random() * 1.8);
      const y = 0.5 + Math.random() * 2.0;
      const z = 0.8 - Math.random() * 2.0;
      group.position.set(x, y, z);
      group.rotation.y = side > 0 ? -0.6 : 0.6;

      group.userData = {
        basePos: group.position.clone(),
        speed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        flutterAmp: 0.6 + Math.random() * 0.4,
        driftAmp: 0.4 + Math.random() * 0.4,
        wings: [wingL, wingR, wing2L, wing2R],
        glow,
      };

      this.scene.add(group);
      this.butterflies.push(group);
      this.butterflyWings.push(...group.userData.wings);
    }
  }

  /* ── DUST MOTES (atmospheric particles) ──── */
  createDustMotes() {
    this.createParticles({
      count: this.quality === "high" ? 240 : 90,
      color: 0xffd9b0,
      size: 0.045,
      opacity: 0.4,
      spread: { x: 20, y: 8, z: 12 },
      texture: this.createParticleTexture(),
    });
  }

  /* ── FOREGROUND LEAVES ───────────────────── */
  createForegroundLeaves() {
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.7, 0.5, 0, 1);
    leafShape.quadraticCurveTo(-0.7, 0.5, 0, 0);

    const leafMat = new THREE.MeshLambertMaterial({
      color: 0x23412f,
      flatShading: true,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });

    const positions = [
      [-8.4, -2.05, -0.6, 0.9, 0.35],
      [8.5, -2.1, -1.1, 1.0, -0.3],
      [-8.8, -1.1, -0.9, 0.7, 0.6],
      [8.8, -1.3, -1.4, 0.75, -0.55],
      [-7.6, -2.15, -1.7, 0.55, 0.8],
      [7.4, -2.2, -2.1, 0.6, -0.75],
    ];

    for (const [x, y, z, s, rot] of positions) {
      const leaf = new THREE.Mesh(leafShape, leafMat);
      leaf.position.set(x, y, z);
      leaf.scale.set(s, s, 1);
      leaf.rotation.set(0, 0, rot);
      leaf.userData = {
        swaySpeed: 0.35 + Math.random() * 0.35,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: 0.08,
        baseRot: rot,
        baseY: y,
      };
      this.scene.add(leaf);
      this.leafMeshes.push(leaf);
    }
  }

  /* ── LANTERNS (warm natural glow) ────────── */
  createLanterns() {
    const texture = this.createParticleTexture();
    const spots = [
      [-7.0, -1.95, -2.2, 1.1],
      [7.2, -2.0, -2.6, 1.0],
    ];

    for (const [x, y, z, s] of spots) {
      const mat = new THREE.SpriteMaterial({
        map: texture,
        color: 0xffb066,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(s, s, 1);
      sprite.position.set(x, y, z);
      this.scene.add(sprite);
      this.lanternSprites.push(sprite);
    }
  }

  /* ── ANIMATION ───────────────────────────── */
  update(delta, elapsed) {
    // Water shimmer — slow scroll + subtle horizontal drift
    for (const mat of this.waterMats) {
      if (mat.map) {
        mat.map.offset.x = elapsed * 0.012;
        mat.map.offset.y = elapsed * 0.006;
      }
    }

    // Clouds drift across the sky
    for (const sprite of this.cloudSprites) {
      sprite.position.x += sprite.userData.speed * delta;
      if (sprite.position.x > sprite.userData.xMax) sprite.position.x = sprite.userData.xMin;
    }

    // Mist slowly rolls across the water
    for (const sprite of this.mistSprites) {
      sprite.position.x += sprite.userData.speed * delta;
      if (sprite.position.x > sprite.userData.xMax) sprite.position.x = sprite.userData.xMin;
      const pulse = 0.75 + Math.sin(elapsed * 0.4 + sprite.position.x) * 0.25;
      sprite.material.opacity = 0.08 + pulse * 0.08;
    }

    // Fireflies float upward with a gentle sway
    if (this.fireflyPoints) {
      const pos = this.fireflyPoints.geometry.attributes.position;
      const arr = pos.array;
      for (let i = 0; i < this.fireflySpeeds.length; i++) {
        const i3 = i * 3;
        const phase = this.fireflyPhases[i];
        arr[i3] += Math.sin(elapsed * this.fireflySpeeds[i] + phase) * delta * 0.12;
        arr[i3 + 1] += delta * (0.12 + this.fireflySpeeds[i] * 0.08);
        if (arr[i3 + 1] > 3.4) arr[i3 + 1] = -1.2;
      }
      pos.needsUpdate = true;
      this.fireflyPoints.material.opacity = 0.55 + Math.sin(elapsed * 1.6) * 0.3;
    }

    // Trees gently sway
    for (const tree of this.pineTrees) {
      tree.rotation.z = Math.sin(elapsed * tree.userData.swaySpeed + tree.userData.swayPhase) * tree.userData.swayAmp;
    }

    // Butterflies flutter beside the registration card
    for (const butterfly of this.butterflies) {
      const u = butterfly.userData;
      const t = elapsed * u.speed + u.phase;

      // Gentle figure-8 drift around the base position
      butterfly.position.x = u.basePos.x + Math.sin(t) * u.driftAmp;
      butterfly.position.y = u.basePos.y + Math.cos(t * 0.7) * u.driftAmp * 0.7;
      butterfly.position.z = u.basePos.z + Math.sin(t * 0.5) * 0.25;

      // Wing flutter — quick flap oscillation
      for (const wing of u.wings) {
        wing.rotation.x = Math.sin(t * 6) * u.flutterAmp;
      }

      // Soft glow pulse
      if (u.glow) {
        u.glow.material.opacity = 0.14 + Math.sin(t * 3) * 0.08;
      }

      // Gentle bob
      butterfly.rotation.z = Math.sin(t * 0.8) * 0.12;
    }

    // Foreground leaves sway about their own base height
    for (const leaf of this.leafMeshes) {
      leaf.rotation.z = leaf.userData.baseRot +
        Math.sin(elapsed * leaf.userData.swaySpeed + leaf.userData.swayPhase) * leaf.userData.swayAmp;
      leaf.position.y = leaf.userData.baseY +
        Math.sin(elapsed * leaf.userData.swaySpeed * 0.7 + leaf.userData.swayPhase) * 0.05;
    }

    // Lanterns softly pulse
    for (const sprite of this.lanternSprites) {
      sprite.material.opacity = 0.4 + Math.sin(elapsed * 0.9 + sprite.position.x) * 0.18;
    }

    // Sun light gently breathes
    if (this.animatedLights && this.animatedLights.length) {
      this.animatedLights[0].intensity = 1.55 + Math.sin(elapsed * 0.35) * 0.15;
      this.animatedLights[1].intensity = 0.5 + Math.sin(elapsed * 0.5) * 0.12;
    }

    // Sun halo subtle drift
    if (this.sunHalo) {
      this.sunHalo.material.opacity = 0.3 + Math.sin(elapsed * 0.4) * 0.08;
    }

    // Moon halo gently breathes
    if (this.moonHalo) {
      this.moonHalo.material.opacity = 0.2 + Math.sin(elapsed * 0.35) * 0.06;
    }

    // Tiny ground flowers sway
    for (const flower of this.tinyFlowers) {
      if (!flower.userData) continue;
      flower.rotation.z = Math.sin(elapsed * flower.userData.swaySpeed + flower.userData.swayPhase) * flower.userData.swayAmp;
    }

    // Dust motes drift slowly
    for (const particles of this.particles) {
      particles.rotation.y = elapsed * 0.008;
      particles.rotation.x = Math.sin(elapsed * 0.05) * 0.02;
    }
  }
}