/**
 * CharacterBuilder.js
 * Procedural 3D human characters for the Exam Pro immersive home page.
 * Builds stylized-but-realistic student characters (boy & girl)
 * using Three.js primitives with proper proportions, materials,
 * and subtle animation systems.
 */
import * as THREE from "three";

export default class CharacterBuilder {
  /**
   * Build a complete 3D character.
   * @param {Object} config - Character configuration
   * @param {string} config.gender - 'boy' | 'girl'
   * @param {Object} config.colors - Custom color overrides
   * @param {number} config.scale - Overall scale multiplier
   * @returns {THREE.Group} - The character group
   */
  static build(config = {}) {
    const { gender = "boy", scale = 1, colors = {} } = config;
    const group = new THREE.Group();

    // Material definitions
    const materials = CharacterBuilder.createMaterials(gender, colors);

    // Build body parts
    const body = CharacterBuilder.buildBody(gender, materials);
    group.add(body);

    // Build head with facial features
    const head = CharacterBuilder.buildHead(gender, materials);
    head.position.y = 2.55 * scale;
    group.add(head);

    // Build hair
    const hair = CharacterBuilder.buildHair(gender, materials);
    hair.position.y = 2.55 * scale;
    group.add(hair);

    // Build arms
    const leftArm = CharacterBuilder.buildArm(gender, materials, "left");
    leftArm.position.set(-0.55 * scale, 1.55 * scale, 0);
    group.add(leftArm);

    const rightArm = CharacterBuilder.buildArm(gender, materials, "right");
    rightArm.position.set(0.55 * scale, 1.55 * scale, 0);
    group.add(rightArm);

    // Build legs
    const leftLeg = CharacterBuilder.buildLeg(gender, materials, "left");
    leftLeg.position.set(-0.22 * scale, 0.75 * scale, 0);
    group.add(leftLeg);

    const rightLeg = CharacterBuilder.buildLeg(gender, materials, "right");
    rightLeg.position.set(0.22 * scale, 0.75 * scale, 0);
    group.add(rightLeg);

    // Store references for animation
    group.userData = {
      gender,
      scale,
      head,
      hair,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      body,
      materials,
      // Animation state
      animTime: 0,
      baseHeadRotation: head.rotation.clone(),
      baseBodyRotation: body.rotation.clone(),
      baseLeftArmRotation: leftArm.rotation.clone(),
      baseRightArmRotation: rightArm.rotation.clone(),
    };

    // Apply overall scale
    group.scale.setScalar(scale);

    return group;
  }

  /**
   * Create all materials for the character.
   */
  static createMaterials(gender, colors) {
    const isBoy = gender === "boy";

    // Skin tones
    const skinColor = colors.skin || (isBoy ? 0xd4a574 : 0xe8b88a);
    const skinDark = colors.skinDark || (isBoy ? 0xc09060 : 0xd4a070);

    // Hair colors
    const hairColor = colors.hair || (isBoy ? 0x2d1b0e : 0x1a1a2e);

    // Clothing colors
    const shirtColor = colors.shirt || (isBoy ? 0x2c3e50 : 0x34495e);
    const shirtAccent = colors.shirtAccent || (isBoy ? 0x34495e : 0x4a6fa5);
    const pantsColor = colors.pants || (isBoy ? 0x1a1a2e : 0x2c3e50);
    const shoeColor = colors.shoes || 0x1a1a2e;

    return {
      skin: new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.6,
        metalness: 0.05,
      }),
      skinDark: new THREE.MeshStandardMaterial({
        color: skinDark,
        roughness: 0.6,
        metalness: 0.05,
      }),
      hair: new THREE.MeshStandardMaterial({
        color: hairColor,
        roughness: 0.8,
        metalness: 0.1,
      }),
      shirt: new THREE.MeshStandardMaterial({
        color: shirtColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
      shirtAccent: new THREE.MeshStandardMaterial({
        color: shirtAccent,
        roughness: 0.7,
        metalness: 0.1,
      }),
      pants: new THREE.MeshStandardMaterial({
        color: pantsColor,
        roughness: 0.8,
        metalness: 0.05,
      }),
      shoes: new THREE.MeshStandardMaterial({
        color: shoeColor,
        roughness: 0.6,
        metalness: 0.2,
      }),
      white: new THREE.MeshStandardMaterial({
        color: 0xf0f0f0,
        roughness: 0.5,
        metalness: 0.05,
      }),
      eyeWhite: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.0,
      }),
      eyeIris: new THREE.MeshStandardMaterial({
        color: isBoy ? 0x3b5998 : 0x4a6741,
        roughness: 0.2,
        metalness: 0.0,
      }),
      eyebrow: new THREE.MeshStandardMaterial({
        color: hairColor,
        roughness: 0.9,
        metalness: 0.0,
      }),
      lips: new THREE.MeshStandardMaterial({
        color: isBoy ? 0xc47a6a : 0xd4887a,
        roughness: 0.4,
        metalness: 0.0,
      }),
    };
  }

  /**
   * Build the body (torso + pelvis).
   */
  static buildBody(gender, materials) {
    const group = new THREE.Group();
    const isBoy = gender === "boy";

    // Torso
    const torsoGeo = new THREE.CapsuleGeometry(
      isBoy ? 0.38 : 0.34,
      0.7,
      8,
      16
    );
    const torso = new THREE.Mesh(torsoGeo, materials.shirt);
    torso.position.y = 1.35;
    torso.scale.set(1, 1.1, 0.8);
    group.add(torso);

    // Shirt collar
    const collarGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.12, 16);
    const collar = new THREE.Mesh(collarGeo, materials.white);
    collar.position.y = 1.78;
    group.add(collar);

    // Belt / waist
    const beltGeo = new THREE.CylinderGeometry(0.3, 0.32, 0.1, 16);
    const belt = new THREE.Mesh(beltGeo, materials.pants);
    belt.position.y = 0.95;
    group.add(belt);

    // Pelvis
    const pelvisGeo = new THREE.CapsuleGeometry(
      isBoy ? 0.3 : 0.28,
      0.3,
      8,
      16
    );
    const pelvis = new THREE.Mesh(pelvisGeo, materials.pants);
    pelvis.position.y = 0.85;
    pelvis.scale.set(1, 0.8, 0.8);
    group.add(pelvis);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.15, 12);
    const neck = new THREE.Mesh(neckGeo, materials.skin);
    neck.position.y = 1.95;
    group.add(neck);

    // Store torso reference for breathing animation
    group.userData = { torso };

    return group;
  }

  /**
   * Build the head with facial features.
   */
  static buildHead(gender, materials) {
    const group = new THREE.Group();
    const isBoy = gender === "boy";

    // Head base
    const headGeo = new THREE.SphereGeometry(0.28, 24, 24);
    const head = new THREE.Mesh(headGeo, materials.skin);
    head.scale.set(0.9, 1.1, 0.95);
    group.add(head);

    // Jaw
    const jawGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const jaw = new THREE.Mesh(jawGeo, materials.skin);
    jaw.position.y = -0.12;
    jaw.scale.set(0.9, 0.7, 0.9);
    group.add(jaw);

    // Eyes
    const eyeOffset = 0.11;
    const eyeY = 0.05;
    const eyeZ = 0.24;

    // Eye whites
    const eyeWhiteGeo = new THREE.SphereGeometry(0.055, 12, 12);
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, materials.eyeWhite);
    leftEyeWhite.position.set(-eyeOffset, eyeY, eyeZ);
    group.add(leftEyeWhite);

    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, materials.eyeWhite);
    rightEyeWhite.position.set(eyeOffset, eyeY, eyeZ);
    group.add(rightEyeWhite);

    // Irises
    const irisGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const leftIris = new THREE.Mesh(irisGeo, materials.eyeIris);
    leftIris.position.set(-eyeOffset, eyeY, eyeZ + 0.03);
    group.add(leftIris);

    const rightIris = new THREE.Mesh(irisGeo, materials.eyeIris);
    rightIris.position.set(eyeOffset, eyeY, eyeZ + 0.03);
    group.add(rightIris);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.1, 0.02, 0.02);
    const leftBrow = new THREE.Mesh(browGeo, materials.eyebrow);
    leftBrow.position.set(-eyeOffset, eyeY + 0.08, eyeZ + 0.01);
    leftBrow.rotation.z = 0.1;
    group.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, materials.eyebrow);
    rightBrow.position.set(eyeOffset, eyeY + 0.08, eyeZ + 0.01);
    rightBrow.rotation.z = -0.1;
    group.add(rightBrow);

    // Nose
    const noseGeo = new THREE.ConeGeometry(0.04, 0.08, 8);
    const nose = new THREE.Mesh(noseGeo, materials.skin);
    nose.position.set(0, -0.05, 0.27);
    nose.rotation.x = Math.PI / 2;
    group.add(nose);

    // Mouth / lips
    const mouthGeo = new THREE.BoxGeometry(0.1, 0.02, 0.02);
    const mouth = new THREE.Mesh(mouthGeo, materials.lips);
    mouth.position.set(0, -0.14, 0.25);
    group.add(mouth);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const leftEar = new THREE.Mesh(earGeo, materials.skin);
    leftEar.position.set(-0.27, 0, 0);
    leftEar.scale.set(0.4, 1, 0.6);
    group.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, materials.skin);
    rightEar.position.set(0.27, 0, 0);
    rightEar.scale.set(0.4, 1, 0.6);
    group.add(rightEar);

    // Store eye references for eye movement
    group.userData = {
      leftIris,
      rightIris,
      leftEyeWhite,
      rightEyeWhite,
      head,
    };

    return group;
  }

  /**
   * Build hair for the character.
   */
  static buildHair(gender, materials) {
    const group = new THREE.Group();
    const isBoy = gender === "boy";

    if (isBoy) {
      // Short hair - cap on top of head
      const hairCapGeo = new THREE.SphereGeometry(0.29, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hairCap = new THREE.Mesh(hairCapGeo, materials.hair);
      hairCap.position.y = 0.08;
      hairCap.scale.set(0.95, 0.8, 0.95);
      group.add(hairCap);

      // Hair fringe
      const fringeGeo = new THREE.BoxGeometry(0.3, 0.06, 0.1);
      const fringe = new THREE.Mesh(fringeGeo, materials.hair);
      fringe.position.set(0, 0.12, 0.22);
      fringe.rotation.x = 0.3;
      group.add(fringe);
    } else {
      // Longer hair for girl
      const hairBackGeo = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
      const hairBack = new THREE.Mesh(hairBackGeo, materials.hair);
      hairBack.position.y = 0.05;
      hairBack.scale.set(0.95, 0.9, 0.95);
      group.add(hairBack);

      // Hair flowing down the back
      const hairFlowGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.5, 12);
      const hairFlow = new THREE.Mesh(hairFlowGeo, materials.hair);
      hairFlow.position.set(0, -0.3, -0.1);
      hairFlow.scale.set(1, 1, 0.6);
      group.add(hairFlow);

      // Hair fringe
      const fringeGeo = new THREE.BoxGeometry(0.32, 0.05, 0.12);
      const fringe = new THREE.Mesh(fringeGeo, materials.hair);
      fringe.position.set(0, 0.15, 0.2);
      fringe.rotation.x = 0.25;
      group.add(fringe);

      // Side hair
      const sideHairGeo = new THREE.BoxGeometry(0.08, 0.3, 0.15);
      const leftSide = new THREE.Mesh(sideHairGeo, materials.hair);
      leftSide.position.set(-0.25, -0.05, 0.05);
      leftSide.rotation.z = 0.1;
      group.add(leftSide);

      const rightSide = new THREE.Mesh(sideHairGeo, materials.hair);
      rightSide.position.set(0.25, -0.05, 0.05);
      rightSide.rotation.z = -0.1;
      group.add(rightSide);
    }

    return group;
  }

  /**
   * Build an arm.
   */
  static buildArm(gender, materials, side) {
    const group = new THREE.Group();
    const isBoy = gender === "boy";
    const dir = side === "left" ? -1 : 1;

    // Upper arm
    const upperArmGeo = new THREE.CapsuleGeometry(0.1, 0.3, 6, 12);
    const upperArm = new THREE.Mesh(upperArmGeo, materials.shirt);
    upperArm.position.y = -0.2;
    group.add(upperArm);

    // Forearm
    const forearmGeo = new THREE.CapsuleGeometry(0.085, 0.28, 6, 12);
    const forearm = new THREE.Mesh(forearmGeo, materials.skin);
    forearm.position.y = -0.55;
    group.add(forearm);

    // Hand
    const handGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const hand = new THREE.Mesh(handGeo, materials.skin);
    hand.position.y = -0.8;
    hand.scale.set(0.8, 1.2, 0.8);
    group.add(hand);

    // Shoulder pad
    const shoulderGeo = new THREE.SphereGeometry(0.13, 8, 8);
    const shoulder = new THREE.Mesh(shoulderGeo, materials.shirt);
    shoulder.position.y = 0.05;
    group.add(shoulder);

    // Slight natural arm rotation
    group.rotation.z = dir * 0.05;
    group.rotation.x = 0.05;

    return group;
  }

  /**
   * Build a leg.
   */
  static buildLeg(gender, materials, side) {
    const group = new THREE.Group();
    const isBoy = gender === "boy";

    // Upper leg
    const upperLegGeo = new THREE.CapsuleGeometry(0.13, 0.35, 6, 12);
    const upperLeg = new THREE.Mesh(upperLegGeo, materials.pants);
    upperLeg.position.y = -0.25;
    group.add(upperLeg);

    // Lower leg
    const lowerLegGeo = new THREE.CapsuleGeometry(0.11, 0.3, 6, 12);
    const lowerLeg = new THREE.Mesh(lowerLegGeo, materials.pants);
    lowerLeg.position.y = -0.7;
    group.add(lowerLeg);

    // Shoe
    const shoeGeo = new THREE.BoxGeometry(0.18, 0.1, 0.3);
    const shoe = new THREE.Mesh(shoeGeo, materials.shoes);
    shoe.position.set(0, -0.95, 0.05);
    group.add(shoe);

    return group;
  }

  /**
   * Update character animation.
   * @param {THREE.Group} character - The character group
   * @param {number} time - Elapsed time
   * @param {number} delta - Delta time
   * @param {Object} mouse - Mouse position for subtle response
   */
  static update(character, time, delta, mouse = { x: 0, y: 0 }) {
    if (!character || !character.userData) return;

    const ud = character.userData;
    ud.animTime += delta;

    const t = ud.animTime;
    const gender = ud.gender;

    // ── Breathing (chest expansion) ──────────────
    if (ud.body && ud.body.userData && ud.body.userData.torso) {
      const torso = ud.body.userData.torso;
      const breath = Math.sin(t * 1.2) * 0.02;
      torso.scale.set(1 + breath, 1 + breath * 0.5, 1 + breath);
    }

    // ── Head movement (subtle look around) ───────
    if (ud.head) {
      const headYaw = Math.sin(t * 0.4) * 0.12 + mouse.x * 0.05;
      const headPitch = Math.sin(t * 0.3 + 1) * 0.05 + mouse.y * 0.03;
      ud.head.rotation.y = headYaw;
      ud.head.rotation.x = headPitch;
      ud.head.rotation.z = Math.sin(t * 0.25) * 0.02;
    }

    // ── Eye movement ─────────────────────────────
    if (ud.head && ud.head.userData) {
      const eyeData = ud.head.userData;
      const eyeX = Math.sin(t * 0.5) * 0.01 + mouse.x * 0.01;
      const eyeY = Math.sin(t * 0.4 + 2) * 0.005 + mouse.y * 0.005;

      if (eyeData.leftIris) {
        eyeData.leftIris.position.x = -0.11 + eyeX;
        eyeData.leftIris.position.y = 0.05 + eyeY;
      }
      if (eyeData.rightIris) {
        eyeData.rightIris.position.x = 0.11 + eyeX;
        eyeData.rightIris.position.y = 0.05 + eyeY;
      }
    }

    // ── Body sway (subtle) ───────────────────────
    if (ud.body) {
      ud.body.rotation.z = Math.sin(t * 0.35) * 0.015;
      ud.body.rotation.x = Math.sin(t * 0.3 + 0.5) * 0.01;
    }

    // ── Arm movement (subtle) ────────────────────
    if (ud.leftArm) {
      ud.leftArm.rotation.z = -0.05 + Math.sin(t * 0.5) * 0.02;
      ud.leftArm.rotation.x = 0.05 + Math.sin(t * 0.4 + 1) * 0.02;
    }
    if (ud.rightArm) {
      ud.rightArm.rotation.z = 0.05 - Math.sin(t * 0.5 + 0.5) * 0.02;
      ud.rightArm.rotation.x = 0.05 + Math.sin(t * 0.4 + 2) * 0.02;
    }

    // ── Hair movement (subtle) ───────────────────
    if (ud.hair) {
      ud.hair.rotation.z = Math.sin(t * 0.3) * 0.01;
      ud.hair.rotation.x = Math.sin(t * 0.25 + 1) * 0.005;
    }

    // ── Whole body subtle bob ────────────────────
    character.position.y = (ud.baseY || 0) + Math.sin(t * 0.8) * 0.02;
  }

  /**
   * Set the base Y position for the character.
   */
  static setBaseY(character, y) {
    if (character && character.userData) {
      character.userData.baseY = y;
    }
  }
}