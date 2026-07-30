import * as THREE from 'three';

export type ProceduralModelOptions = {
  wireframe?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  textureSize?: number;
  anisotropy?: number;
};

export type ProceduralModelRuntime = {
  nodes: Record<string, THREE.Object3D>;
  meshes: Record<string, THREE.Mesh>;
  sockets: Record<string, THREE.Object3D>;
  colliders: Record<string, unknown>;
  destructionGroups: Record<string, THREE.Object3D[]>;
  animations?: {
    drive: (t: number, distance: number) => void;
    setFaceExpression: (type: 'idle' | 'alert') => void;
    pulseChest: (t: number) => void;
  };
};

/**
 * Helper: create rounded rectangle shape
 */
function roundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function createRoundedBox(w: number, h: number, d: number, r: number, bevel: number = 0.02): THREE.BufferGeometry {
  const shape = roundedRectShape(w, h, r);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 6,
    curveSegments: 16,
  });
  geo.center();
  // Extrude centers around origin but depth along Z; rotate to make depth along Z as expected? Extrude already along Z.
  // We want consistent orientation: keep as is but re-center already done.
  return geo;
}

function createCylinderRadial(radius: number, height: number, segments = 32): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(radius, radius, height, segments);
}

/**
 * Factory: Pink Cat-Eared Cyber-Bot Vehicle
 * Hierarchy: root -> stage-platform, chassis -> face-screen, ears (L/R), headphones, chest-ring, bumper, radio-module, wheels (FL/FR/RL/RR)
 */
export function createCyberBotVehicleModel(options: ProceduralModelOptions = {}): THREE.Group {
  const castShadow = options.castShadow ?? true;
  const receiveShadow = options.receiveShadow ?? true;

  const root = new THREE.Group();
  root.name = 'root';

  /** --- MATERIALS --- */
  const pinkBodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#EE98B9'),
    roughness: 0.35,
    metalness: 0.08,
    clearcoat: 0.2,
    clearcoatRoughness: 0.25,
    sheen: 0.15,
    sheenColor: new THREE.Color('#FFB6D9'),
  });
  pinkBodyMat.name = 'pink-body-shell';

  const pinkBodyLightMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#F0A7BF'),
    roughness: 0.38,
    metalness: 0.05,
    clearcoat: 0.18,
  });

  const emissivePinkMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#B01050'),
    emissive: new THREE.Color('#FF2A85'),
    emissiveIntensity: 2.2,
    roughness: 0.35,
    metalness: 0.0,
  });
  emissivePinkMat.name = 'emissive-pink';

  const emissiveWhiteMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FFFFFF'),
    emissive: new THREE.Color('#FFFFFF'),
    emissiveIntensity: 2.2,
    roughness: 0.2,
    metalness: 0.0,
  });
  emissiveWhiteMat.name = 'emissive-white';

  const bezelMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#1E1E24'),
    roughness: 0.25,
    metalness: 0.15,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
  });
  bezelMat.name = 'screen-bezel';

  const screenMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0F0F14'),
    emissive: new THREE.Color('#1A1A22'),
    emissiveIntensity: 0.15,
    roughness: 0.15,
    metalness: 0.1,
  });

  const silverRimMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#D1D5DB'),
    roughness: 0.22,
    metalness: 0.85,
    envMapIntensity: 1.1,
  });
  silverRimMat.name = 'silver-rims';

  const blackTireMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#1C1C1E'),
    roughness: 0.85,
    metalness: 0.02,
  });
  blackTireMat.name = 'rubber-tires';

  const darkRubberMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#2A2A2E'),
    roughness: 0.9,
    metalness: 0.0,
  });

  const speakerFabricMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#2E2E33'),
    roughness: 0.75,
    metalness: 0.05,
  });

  const radioMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#3A3A42'),
    roughness: 0.45,
    metalness: 0.3,
  });

  // Small indicator amber
  const indicatorMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FFCC66'),
    emissive: new THREE.Color('#FFAA33'),
    emissiveIntensity: 0.8,
    roughness: 0.4,
  });

  /** --- STAGE PLATFORM --- */
  const stagePlatform = new THREE.Group();
  stagePlatform.name = 'stage-platform';
  // Outer pink disc
  const platformOuterGeo = new THREE.CylinderGeometry(3.0, 3.0, 0.18, 64);
  const platformOuter = new THREE.Mesh(platformOuterGeo, pinkBodyMat);
  platformOuter.name = 'platform-outer';
  platformOuter.position.y = -0.85;
  platformOuter.receiveShadow = receiveShadow;
  platformOuter.castShadow = castShadow;
  stagePlatform.add(platformOuter);

  // White middle ring
  const platformWhite1Geo = new THREE.CylinderGeometry(2.35, 2.35, 0.2, 64);
  const platformWhite1Mat = new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', roughness: 0.35, metalness: 0.05, clearcoat: 0.1 });
  const platformWhite1 = new THREE.Mesh(platformWhite1Geo, platformWhite1Mat);
  platformWhite1.name = 'platform-white-ring-1';
  platformWhite1.position.y = -0.8;
  stagePlatform.add(platformWhite1);

  // Inner pink ring
  const platformPinkInnerGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.22, 64);
  const platformPinkInner = new THREE.Mesh(platformPinkInnerGeo, pinkBodyLightMat);
  platformPinkInner.name = 'platform-inner-pink';
  platformPinkInner.position.y = -0.75;
  stagePlatform.add(platformPinkInner);

  // Center white
  const platformCenterWhiteGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.24, 64);
  const platformCenterWhite = new THREE.Mesh(platformCenterWhiteGeo, platformWhite1Mat);
  platformCenterWhite.name = 'platform-center-white';
  platformCenterWhite.position.y = -0.69;
  stagePlatform.add(platformCenterWhite);

  // Innermost pink disc
  const platformCenterPinkGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.26, 64);
  const platformCenterPink = new THREE.Mesh(platformCenterPinkGeo, pinkBodyMat);
  platformCenterPink.name = 'platform-center-pink';
  platformCenterPink.position.y = -0.63;
  stagePlatform.add(platformCenterPink);

  root.add(stagePlatform);

  /** --- CHASSIS --- */
  const chassis = new THREE.Group();
  chassis.name = 'chassis';
  chassis.position.y = 0.05;
  root.add(chassis);

  // Main body - rounded box
  const bodyGeo = createRoundedBox(1.9, 2.0, 1.1, 0.22, 0.04);
  const bodyMesh = new THREE.Mesh(bodyGeo, pinkBodyMat);
  bodyMesh.name = 'chassis-body';
  bodyMesh.castShadow = castShadow;
  bodyMesh.receiveShadow = receiveShadow;
  // Rotate extrude such that depth is Z? Extrude along Z already, but shape is X/Y. We want width X, height Y, depth Z.
  // Our roundedBox creates shape in XY and extrudes in Z. Centered. So rotate so that shape is top view? Actually we want width X, depth Z, height Y.
  // Extrude depth is along Z local, so if we want body height Y mapped to shape height, we need shape = width vs depth? Let's rotate accordingly.
  bodyMesh.rotation.x = Math.PI / 2; // Make extrude depth align with Y? Wait careful.
  // Simpler: recreate as box with slightly rounded edges via custom? We'll keep rotation: after Extrude, Z is thickness. We want height Y = shape height? Let's orient:
  // shape width = chassis width (X), shape height = chassis depth (Z). Extrude depth = chassis height (Y).
  // So shape currently width 1.9 (X) height 2.0 is being extruded 1.1 deep. But we want height 1.1? Actually we passed w=1.9 h=2.0 d=1.1. That would mean shape w=1.9 h=2.0 (X/Z plane), extrude d=1.1 (Y). So after creation, we need rotation X 90deg to make extrusion align to Y.
  // The geo.center() centers at origin, so rotation will still keep centered.
  // After rotation X 90deg, Y becomes former Z.
  bodyMesh.position.y = 0.15;
  chassis.add(bodyMesh);

  // Add separate fix: override to simpler Box with bevel via additional meshes for better readability.
  // We'll add side fenders (rounded boxes over wheels)
  function addFender(x: number, z: number) {
    const fenderShape = roundedRectShape(1.1, 0.7, 0.18);
    const fenderGeo = new THREE.ExtrudeGeometry(fenderShape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 4,
      curveSegments: 12,
    });
    fenderGeo.center();
    const fender = new THREE.Mesh(fenderGeo, pinkBodyMat);
    fender.rotation.x = Math.PI / 2;
    fender.rotation.z = Math.PI / 2;
    fender.position.set(x, 0.1, z);
    fender.castShadow = castShadow;
    fender.receiveShadow = receiveShadow;
    chassis.add(fender);
    // small vent detail
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.6), bezelMat);
    vent.position.set(x * 0.2, 0.62, z * 0.2);
    chassis.add(vent);
    return fender;
  }
  const fenderFL = addFender(-0.75, 0.65);
  fenderFL.name = 'fender-fl';
  const fenderFR = addFender(0.75, 0.65);
  fenderFR.name = 'fender-fr';
  const fenderRL = addFender(-0.75, -0.65);
  fenderRL.name = 'fender-rl';
  const fenderRR = addFender(0.75, -0.65);
  fenderRR.name = 'fender-rr';

  // Side rivet lines (small indicator cylinders)
  function addRivets() {
    for (let side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), silverRimMat);
        rivet.position.set(side * 0.92, 0.15 + i * 0.18 - 0.18, 0.2 + i * 0.1);
        chassis.add(rivet);
      }
    }
  }
  addRivets();

  /** --- FACE SCREEN --- */
  const faceScreenGroup = new THREE.Group();
  faceScreenGroup.name = 'face-screen';
  faceScreenGroup.position.set(0, 0.55, 0.71);
  chassis.add(faceScreenGroup);

  const bezelShape = roundedRectShape(1.15, 0.72, 0.12);
  const bezelGeo = new THREE.ExtrudeGeometry(bezelShape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 4,
  });
  bezelGeo.center();
  const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
  bezelMesh.castShadow = castShadow;
  bezelMesh.name = 'face-bezel';
  faceScreenGroup.add(bezelMesh);

  const screenShape = roundedRectShape(0.98, 0.58, 0.08);
  const screenGeo = new THREE.ExtrudeGeometry(screenShape, { depth: 0.01, bevelEnabled: false });
  screenGeo.center();
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = 0.07;
  screenMesh.name = 'face-screen-inner';
  faceScreenGroup.add(screenMesh);

  // Cat eyes - glowing white
  function createCatEye(): THREE.Group {
    const g = new THREE.Group();
    // eye white shape - vertical ellipse
    const eyeGeo = new THREE.CapsuleGeometry(0.12, 0.16, 8, 16);
    const eyeMesh = new THREE.Mesh(eyeGeo, emissiveWhiteMat);
    eyeMesh.rotation.z = 0;
    eyeMesh.scale.set(1, 1, 0.2);
    g.add(eyeMesh);
    // slit pupil - black
    const pupilGeo = new THREE.CapsuleGeometry(0.02, 0.16, 4, 8);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.z = 0.03;
    pupil.scale.set(1, 1, 1);
    g.add(pupil);
    // glow backing
    const glowGeo = new THREE.CircleGeometry(0.18, 24);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = -0.02;
    g.add(glow);
    return g;
  }

  const eyeLeft = createCatEye();
  eyeLeft.position.set(-0.27, 0.05, 0.09);
  eyeLeft.name = 'face-eye-left';
  eyeLeft.rotation.z = 0.05;
  faceScreenGroup.add(eyeLeft);

  const eyeRight = createCatEye();
  eyeRight.position.set(0.27, 0.02, 0.09);
  eyeRight.name = 'face-eye-right';
  eyeRight.rotation.z = -0.08;
  faceScreenGroup.add(eyeRight);

  // Mouth - small caret
  const mouthGeo = new THREE.BufferGeometry();
  const mouthVertices = new Float32Array([
    -0.06, 0, 0,
    0, 0.07, 0,
    0.06, 0, 0,
  ]);
  mouthGeo.setAttribute('position', new THREE.BufferAttribute(mouthVertices, 3));
  const mouthMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  const mouthLine = new THREE.Line(mouthGeo, mouthMat);
  mouthLine.position.set(0, -0.15, 0.09);
  mouthLine.name = 'face-mouth';
  faceScreenGroup.add(mouthLine);
  // mouth as small emissive shape instead
  const mouthShape = new THREE.Shape();
  mouthShape.moveTo(-0.05, 0);
  mouthShape.lineTo(0, 0.06);
  mouthShape.lineTo(0.05, 0);
  mouthShape.lineTo(0.03, 0);
  mouthShape.lineTo(0, 0.035);
  mouthShape.lineTo(-0.03, 0);
  const mouthExtrude = new THREE.ExtrudeGeometry(mouthShape, { depth: 0.01, bevelEnabled: false });
  const mouthMesh = new THREE.Mesh(mouthExtrude, emissiveWhiteMat);
  mouthMesh.position.set(0, -0.17, 0.09);
  mouthMesh.name = 'face-mouth-mesh';
  faceScreenGroup.add(mouthMesh);

  /** --- CAT EARS --- */
  function createCatEar(isLeft: boolean): THREE.Group {
    const earGroup = new THREE.Group();
    earGroup.name = isLeft ? 'ear-left' : 'ear-right';

    // Outer ear - cone with triangular shape
    const outerShape = new THREE.Shape();
    outerShape.moveTo(-0.22, 0);
    outerShape.lineTo(0, 0.48);
    outerShape.lineTo(0.22, 0);
    outerShape.lineTo(-0.22, 0);
    const outerGeo = new THREE.ExtrudeGeometry(outerShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
    outerGeo.center();
    const outerMesh = new THREE.Mesh(outerGeo, pinkBodyMat);
    outerMesh.castShadow = castShadow;
    // tweak orientation: depth is Z, we want thickness along Z? Extrude depth is actually ear thickness front-back.
    // shape currently in XY. So XY is front view of ear. Good.
    outerMesh.position.z = 0;
    outerMesh.name = 'cat-ear-outer';
    earGroup.add(outerMesh);

    // Inner pad - hot pink emissive triangle slightly smaller
    const innerShape = new THREE.Shape();
    innerShape.moveTo(-0.12, 0.06);
    innerShape.lineTo(0, 0.36);
    innerShape.lineTo(0.12, 0.06);
    innerShape.lineTo(-0.12, 0.06);
    const innerGeo = new THREE.ExtrudeGeometry(innerShape, { depth: 0.01, bevelEnabled: false });
    innerGeo.center();
    const innerMesh = new THREE.Mesh(innerGeo, emissivePinkMat);
    innerMesh.position.set(0, 0.04, 0.13);
    // slight offset to be in front of outer
    innerMesh.name = 'ear-pad-inner';
    earGroup.add(innerMesh);

    // Dark inner cavity
    const cavityGeo = new THREE.ExtrudeGeometry(innerShape, { depth: 0.02, bevelEnabled: false });
    const cavityMat = new THREE.MeshPhysicalMaterial({ color: '#2A1720', roughness: 0.8 });
    const cavity = new THREE.Mesh(cavityGeo, cavityMat);
    cavity.position.set(0, 0.04, 0.11);
    cavity.scale.set(1.1, 1.1, 1);
    earGroup.add(cavity);

    return earGroup;
  }

  const earLGroup = createCatEar(true);
  earLGroup.position.set(-0.48, 1.28, 0.05);
  earLGroup.rotation.set(0, -0.15, -0.08);
  earLGroup.name = 'ears-left';
  chassis.add(earLGroup);

  const earRGroup = createCatEar(false);
  earRGroup.position.set(0.48, 1.28, 0.05);
  earRGroup.rotation.set(0, 0.15, 0.08);
  earRGroup.name = 'ears-right';
  chassis.add(earRGroup);

  /** --- HEADPHONES --- */
  const headphones = new THREE.Group();
  headphones.name = 'headphones';
  headphones.position.set(0, 0.9, 0.05);
  chassis.add(headphones);

  // Headband - half torus over top
  const headbandCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.78, 0, 0),
    new THREE.Vector3(-0.5, 0.48, 0),
    new THREE.Vector3(0, 0.62, 0),
    new THREE.Vector3(0.5, 0.48, 0),
    new THREE.Vector3(0.78, 0, 0),
  ]);
  const headbandGeo = new THREE.TubeGeometry(headbandCurve, 48, 0.09, 16, false);
  const headbandMesh = new THREE.Mesh(headbandGeo, pinkBodyMat);
  headbandMesh.castShadow = castShadow;
  headbandMesh.name = 'headband';
  headphones.add(headbandMesh);

  // Add top seam line?
  const headbandTopMat = new THREE.MeshPhysicalMaterial({ color: '#E79AB8', roughness: 0.4 });
  const headbandHighlight = new THREE.Mesh(
    new THREE.TubeGeometry(headbandCurve, 48, 0.092, 12, false),
    headbandTopMat
  );
  headbandHighlight.position.y = 0.01;
  // headbandHighlight.add? Actually duplicate, ignore.

  function createEarcup(isLeft: boolean): THREE.Group {
    const cupGroup = new THREE.Group();
    cupGroup.name = isLeft ? 'earcup-left' : 'earcup-right';
    // Main cylinder body
    const cupBodyGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.18, 32);
    const cupBody = new THREE.Mesh(cupBodyGeo, darkRubberMat);
    cupBody.rotation.z = Math.PI / 2;
    cupBody.name = 'earcup-body';
    cupBody.castShadow = castShadow;
    cupGroup.add(cupBody);

    // Silver rim
    const rimGeo = new THREE.TorusGeometry(0.33, 0.03, 12, 32);
    const rim = new THREE.Mesh(rimGeo, silverRimMat);
    rim.rotation.y = Math.PI / 2;
    rim.position.x = isLeft ? -0.09 : 0.09;
    rim.name = 'earcup-rim-outer';
    cupGroup.add(rim);

    const rimInnerGeo = new THREE.TorusGeometry(0.27, 0.02, 10, 32);
    const rimInner = new THREE.Mesh(rimInnerGeo, silverRimMat);
    rimInner.rotation.y = Math.PI / 2;
    rimInner.position.x = isLeft ? -0.1 : 0.1;
    cupGroup.add(rimInner);

    // Main pink cap
    const capGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 32);
    const cap = new THREE.Mesh(capGeo, pinkBodyMat);
    cap.rotation.z = Math.PI / 2;
    cap.position.x = isLeft ? -0.16 : 0.16;
    cap.name = 'earcup-cap';
    cap.castShadow = castShadow;
    cupGroup.add(cap);

    // Center badge with hexagon
    const badgeGroup = new THREE.Group();
    badgeGroup.name = 'earcup-badge';
    badgeGroup.position.x = isLeft ? -0.23 : 0.23;

    const hexShape = new THREE.Shape();
    const hexR = 0.18;
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI / 3) * i - Math.PI / 6;
      const x = Math.cos(ang) * hexR;
      const y = Math.sin(ang) * hexR;
      if (i === 0) hexShape.moveTo(x, y);
      else hexShape.lineTo(x, y);
    }
    hexShape.closePath();
    const hexGeo = new THREE.ExtrudeGeometry(hexShape, { depth: 0.015, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 2 });
    hexGeo.center();
    const hexMat = new THREE.MeshPhysicalMaterial({
      color: '#E1A6BE',
      emissive: '#FF2A85',
      emissiveIntensity: 0.25,
      roughness: 0.4,
    });
    const hexMesh = new THREE.Mesh(hexGeo, hexMat);
    hexMesh.rotation.y = Math.PI / 2;
    hexMesh.name = 'badge-hex';
    badgeGroup.add(hexMesh);

    // Inner emissive hex ring
    const hexRingGeo = new THREE.TorusGeometry(0.14, 0.015, 8, 6);
    // Scale torus to hexagon? We'll approximate with extruded shape ring.
    const innerHexShape = new THREE.Shape();
    const ir = 0.13;
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI / 3) * i - Math.PI / 6;
      const x = Math.cos(ang) * ir;
      const y = Math.sin(ang) * ir;
      if (i === 0) innerHexShape.moveTo(x, y);
      else innerHexShape.lineTo(x, y);
    }
    innerHexShape.closePath();
    const hole = new THREE.Path();
    const ir2 = 0.10;
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI / 3) * i - Math.PI / 6;
      const x = Math.cos(ang) * ir2;
      const y = Math.sin(ang) * ir2;
      if (i === 0) hole.moveTo(x, y);
      else hole.lineTo(x, y);
    }
    hole.closePath();
    innerHexShape.holes.push(hole);
    const innerHexGeo = new THREE.ExtrudeGeometry(innerHexShape, { depth: 0.008, bevelEnabled: false });
    innerHexGeo.center();
    const innerHex = new THREE.Mesh(innerHexGeo, emissivePinkMat);
    innerHex.rotation.y = Math.PI / 2;
    innerHex.position.x = 0.008;
    badgeGroup.add(innerHex);

    // Logo text placeholder - small bump
    const logoGeo = new THREE.BoxGeometry(0.08, 0.04, 0.005);
    const logoMat = new THREE.MeshPhysicalMaterial({ color: '#D07A9E', roughness: 0.5 });
    const logo = new THREE.Mesh(logoGeo, logoMat);
    logo.rotation.y = Math.PI / 2;
    logo.position.set(0.015, -0.02, 0);
    badgeGroup.add(logo);

    cupGroup.add(badgeGroup);

    // Small indicator LEDs on earcup
    const led1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.04, 4, 8), emissivePinkMat);
    led1.position.set(0, 0.36, 0);
    led1.rotation.z = Math.PI / 2;
    cupGroup.add(led1);
    const led2 = led1.clone();
    led2.position.set(0, -0.36, 0);
    cupGroup.add(led2);

    return cupGroup;
  }

  const earcupL = createEarcup(true);
  earcupL.position.set(-0.89, -0.18, 0);
  earcupL.name = 'headphone-earcup-left';
  headphones.add(earcupL);

  const earcupR = createEarcup(false);
  earcupR.position.set(0.89, -0.18, 0);
  earcupR.name = 'headphone-earcup-right';
  headphones.add(earcupR);

  /** --- CHEST RING --- */
  const chestRingGroup = new THREE.Group();
  chestRingGroup.name = 'chest-ring';
  chestRingGroup.position.set(0, 0, 0.78);
  chestRingGroup.rotation.x = -0.12;
  chassis.add(chestRingGroup);

  // Outer pink glow ring
  const chestOuterGeo = new THREE.TorusGeometry(0.32, 0.028, 16, 48);
  const chestOuter = new THREE.Mesh(chestOuterGeo, emissivePinkMat);
  chestOuter.name = 'chest-ring-outer';
  chestRingGroup.add(chestOuter);

  // inner bezel
  const chestBezelGeo = new THREE.TorusGeometry(0.285, 0.015, 12, 48);
  const chestBezel = new THREE.Mesh(chestBezelGeo, silverRimMat);
  chestBezel.name = 'chest-ring-bezel';
  chestRingGroup.add(chestBezel);

  // Speaker cone
  const speakerConeGeo = new THREE.CylinderGeometry(0.28, 0.15, 0.12, 32, 1, false);
  const speakerCone = new THREE.Mesh(speakerConeGeo, speakerFabricMat);
  speakerCone.rotation.x = Math.PI / 2;
  speakerCone.position.z = -0.04;
  speakerCone.name = 'speaker-cone';
  chestRingGroup.add(speakerCone);

  // Speaker mesh (perforated look via small holes approximation – use circle with texture? We'll use cylinder with dark)
  const speakerMeshGeo = new THREE.CircleGeometry(0.26, 32);
  const speakerMesh = new THREE.Mesh(speakerMeshGeo, new THREE.MeshPhysicalMaterial({ color: '#1A1A20', roughness: 0.9, metalness: 0.1 }));
  speakerMesh.position.z = 0.055;
  speakerMesh.name = 'speaker-mesh';
  chestRingGroup.add(speakerMesh);

  // Center dome
  const domeGeo = new THREE.SphereGeometry(0.07, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, new THREE.MeshPhysicalMaterial({ color: '#2B2B30', roughness: 0.5 }));
  dome.rotation.x = Math.PI;
  dome.position.z = 0.06;
  dome.name = 'speaker-dome';
  chestRingGroup.add(dome);

  // Small LEDs around chest area
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2;
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.012), emissivePinkMat);
    led.position.set(Math.cos(ang) * 0.42, Math.sin(ang) * 0.42, 0);
    chestRingGroup.add(led);
  }

  /** --- BUMPER --- */
  const bumperGroup = new THREE.Group();
  bumperGroup.name = 'bumper';
  bumperGroup.position.set(0, -0.35, 0.85);
  chassis.add(bumperGroup);

  // Bumper base - small box with bevel
  const bumperBaseShape = roundedRectShape(1.1, 0.28, 0.06);
  const bumperBaseGeo = new THREE.ExtrudeGeometry(bumperBaseShape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3,
  });
  bumperBaseGeo.center();
  const bumperBase = new THREE.Mesh(bumperBaseGeo, pinkBodyMat);
  bumperBase.name = 'bumper-base';
  bumperGroup.add(bumperBase);

  // Knobs - twin circular headlights
  function createKnob(x: number) {
    const knobGroup = new THREE.Group();
    knobGroup.position.set(x, 0.02, 0.12);
    knobGroup.name = x < 0 ? 'bumper-knob-left' : 'bumper-knob-right';
    const knobGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.04, 24);
    const knob = new THREE.Mesh(knobGeo, silverRimMat);
    knob.rotation.x = Math.PI / 2;
    knobGroup.add(knob);
    const lensGeo = new THREE.SphereGeometry(0.058, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const lensMat = new THREE.MeshPhysicalMaterial({ color: '#E0E0E8', emissive: '#FFFFFF', emissiveIntensity: 0.15, roughness: 0.2, transmission: 0.2 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.02;
    knobGroup.add(lens);
    return knobGroup;
  }
  const knobL = createKnob(-0.32);
  const knobR = createKnob(0.32);
  bumperGroup.add(knobL);
  bumperGroup.add(knobR);

  // Twin silver speaker grilles
  function createGrille(x: number) {
    const grilleGroup = new THREE.Group();
    grilleGroup.position.set(x, -0.11, 0.1);
    grilleGroup.name = x < 0 ? 'bumper-grille-left' : 'bumper-grille-right';
    const frameShape = roundedRectShape(0.28, 0.13, 0.015);
    const frameGeo = new THREE.ExtrudeGeometry(frameShape, { depth: 0.02, bevelEnabled: false });
    frameGeo.center();
    const frame = new THREE.Mesh(frameGeo, silverRimMat);
    grilleGroup.add(frame);
    // grille lines
    for (let i = -2; i <= 2; i++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.005, 0.005), new THREE.MeshStandardMaterial({ color: '#888A90' }));
      line.position.y = i * 0.018;
      line.position.z = 0.012;
      grilleGroup.add(line);
    }
    // small light
    const li = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.01), indicatorMat);
    li.position.set(0.11, -0.06, 0.015);
    grilleGroup.add(li);
    return grilleGroup;
  }
  const grilleL = createGrille(-0.28);
  const grilleR = createGrille(0.28);
  bumperGroup.add(grilleL);
  bumperGroup.add(grilleR);

  // Under glow lights
  const underLightL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.02), emissiveWhiteMat);
  underLightL.position.set(-0.42, -0.1, 0.08);
  bumperGroup.add(underLightL);
  const underLightR = underLightL.clone();
  underLightR.position.set(0.42, -0.1, 0.08);
  bumperGroup.add(underLightR);

  /** --- RADIO MODULE (Right side) --- */
  const radioModule = new THREE.Group();
  radioModule.name = 'radio-module';
  radioModule.position.set(0.96, 0.08, -0.12);
  radioModule.rotation.y = -0.15;
  chassis.add(radioModule);

  const radioBoxGeo = createRoundedBox(0.22, 0.48, 0.36, 0.04, 0.015);
  const radioBox = new THREE.Mesh(radioBoxGeo, radioMat);
  radioBox.castShadow = castShadow;
  radioBox.name = 'radio-box';
  // rotate as in createRoundedBox earlier? We already rotated center, we need orientation: depth along Y previously etc. We rotated body earlier; for radio box we want similar orientation. We'll just use Box instead for simplicity to avoid double rotation confusion.
  // Let's replace with BoxGeometry for radio for clean look.
  const radioBoxSimple = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.48, 0.36), radioMat);
  radioBoxSimple.name = 'radio-box-simple';
  radioModule.add(radioBoxSimple);

  // Toggle switches
  for (let i = 0; i < 3; i++) {
    const toggle = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.03, 4, 8), new THREE.MeshPhysicalMaterial({ color: '#A0A0B0', roughness: 0.4 }));
    toggle.position.set(0.12, 0.14 - i * 0.12, 0.02);
    toggle.rotation.z = Math.PI / 2;
    toggle.name = `radio-toggle-${i}`;
    radioModule.add(toggle);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.025), new THREE.MeshStandardMaterial({ color: '#222' }));
    base.position.set(0.11, 0.14 - i * 0.12, 0.02);
    radioModule.add(base);
  }

  // Dual whip antennas
  function createAntenna(z: number): THREE.Group {
    const antGroup = new THREE.Group();
    antGroup.name = `antenna-${z > 0 ? 'front' : 'rear'}`;
    antGroup.position.set(0, 0.24, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 12), silverRimMat);
    antGroup.add(base);
    const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 12), silverRimMat);
    pole1.position.y = 0.12;
    antGroup.add(pole1);
    const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.004, 0.22, 12), new THREE.MeshStandardMaterial({ color: '#B0B0B8', metalness: 0.6, roughness: 0.3 }));
    pole2.position.y = 0.34;
    antGroup.add(pole2);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), new THREE.MeshStandardMaterial({ color: '#111' }));
    tip.position.y = 0.47;
    antGroup.add(tip);
    return antGroup;
  }
  const antenna1 = createAntenna(0.08);
  const antenna2 = createAntenna(-0.08);
  radioModule.add(antenna1);
  radioModule.add(antenna2);

  // Side pink light strips on chassis (from reference)
  const sideLightGeo = new THREE.BoxGeometry(0.02, 0.008, 0.12);
  const sideLight1 = new THREE.Mesh(sideLightGeo, emissivePinkMat);
  sideLight1.position.set(0.96, 0.28, 0.35);
  sideLight1.rotation.y = 0.15;
  chassis.add(sideLight1);
  const sideLight2 = sideLight1.clone();
  sideLight2.position.set(0.96, -0.12, 0.35);
  chassis.add(sideLight2);
  const sideLight3 = sideLight1.clone();
  sideLight3.position.set(-0.96, -0.1, 0.15);
  chassis.add(sideLight3);

  /** --- WHEELS --- */
  function createWheel(name: string, x: number, z: number, isFront: boolean): THREE.Group {
    const wheelGroup = new THREE.Group();
    wheelGroup.name = name;
    wheelGroup.position.set(x, -0.35, z);
    // axle pivot
    const tireGeo = new THREE.TorusGeometry(0.32, 0.12, 18, 36);
    // Torus is oriented in XY? Actually torus in XY plane with Z as tube. We want wheel rolling: axis along X (left-right). So rotate.
    const tire = new THREE.Mesh(tireGeo, blackTireMat);
    tire.rotation.y = Math.PI / 2;
    tire.name = `${name}-tire`;
    tire.castShadow = castShadow;
    tire.receiveShadow = receiveShadow;
    wheelGroup.add(tire);

    // Rim main cylinder
    const rimGeo = new THREE.CylinderGeometry(0.215, 0.215, 0.14, 32);
    const rim = new THREE.Mesh(rimGeo, silverRimMat);
    rim.rotation.z = Math.PI / 2;
    rim.name = `${name}-rim`;
    rim.castShadow = castShadow;
    wheelGroup.add(rim);

    // Rim inner hub
    const hubGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.145, 16);
    const hub = new THREE.Mesh(hubGeo, silverRimMat);
    hub.rotation.z = Math.PI / 2;
    hub.name = `${name}-hub`;
    wheelGroup.add(hub);

    // 6-spoke star
    const spokesGroup = new THREE.Group();
    spokesGroup.name = `${name}-spokes`;
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const spokeGroup = new THREE.Group();
      spokeGroup.rotation.x = ang;
      // main spoke bar
      const spokeGeo = new THREE.BoxGeometry(0.025, 0.19, 0.012);
      const spoke = new THREE.Mesh(spokeGeo, silverRimMat);
      spoke.position.y = 0.115;
      spoke.name = `${name}-spoke-${i}`;
      spokeGroup.add(spoke);
      // curved branch
      const branchGeo = new THREE.BoxGeometry(0.018, 0.09, 0.01);
      const branch = new THREE.Mesh(branchGeo, silverRimMat);
      branch.position.set(0.02, 0.18, 0);
      branch.rotation.z = 0.35;
      spokeGroup.add(branch);
      const branch2 = branch.clone();
      branch2.position.set(-0.02, 0.18, 0);
      branch2.rotation.z = -0.35;
      spokeGroup.add(branch2);
      spokesGroup.add(spokeGroup);
    }
    // rotate spokes to align axle
    spokesGroup.rotation.z = Math.PI / 2;
    spokesGroup.rotation.y = 0;
    wheelGroup.add(spokesGroup);

    // lug nuts
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const lug = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8), new THREE.MeshStandardMaterial({ color: '#909098', metalness: 0.9, roughness: 0.2 }));
      lug.rotation.z = Math.PI / 2;
      lug.position.set(0.075, Math.cos(ang) * 0.05, Math.sin(ang) * 0.05);
      wheelGroup.add(lug);
    }

    // tire tread detail as small boxes around
    const treadGroup = new THREE.Group();
    treadGroup.name = `${name}-tread`;
    for (let i = 0; i < 18; i++) {
      const ang = (i / 18) * Math.PI * 2;
      const tread = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.12), darkRubberMat);
      const r = 0.36;
      tread.position.set(0, Math.cos(ang) * r, Math.sin(ang) * r);
      tread.rotation.x = ang;
      treadGroup.add(tread);
    }
    wheelGroup.add(treadGroup);

    return wheelGroup;
  }

  const wheelFL = createWheel('wheel-FL', -0.92, 0.72, true);
  const wheelFR = createWheel('wheel-FR', 0.92, 0.72, true);
  const wheelRL = createWheel('wheel-RL', -0.92, -0.72, false);
  const wheelRR = createWheel('wheel-RR', 0.92, -0.72, false);

  chassis.add(wheelFL);
  chassis.add(wheelFR);
  chassis.add(wheelRL);
  chassis.add(wheelRR);

  // Store references
  const nodes: Record<string, THREE.Object3D> = {
    root,
    'stage-platform': stagePlatform,
    chassis,
    'face-screen': faceScreenGroup,
    'ear-left': earLGroup,
    'ear-right': earRGroup,
    ears: new THREE.Group(), // placeholder combined
    headphones,
    'headband': headbandMesh,
    'earcup-left': earcupL,
    'earcup-right': earcupR,
    'chest-ring': chestRingGroup,
    bumper: bumperGroup,
    'bumper-knobs': new THREE.Group(),
    'radio-module': radioModule,
    'wheel-FL': wheelFL,
    'wheel-FR': wheelFR,
    'wheel-RL': wheelRL,
    'wheel-RR': wheelRR,
    wheels: new THREE.Group(),
  };
  nodes['ears'].add(earLGroup.clone()); // not actually, but placeholder
  // fix ears group properly
  const earsGroup = new THREE.Group();
  earsGroup.name = 'ears';
  earsGroup.add(earLGroup);
  earsGroup.add(earRGroup);
  // Need to re-add after removal? ear groups already in chassis; but for nodes reference keep.
  // We'll keep separate reference without duplicating: just keep earLGroup and earRGroup in chassis, and earsGroup is empty wrapper for API.

  // Sockets for attachments
  const sockets: Record<string, THREE.Object3D> = {};
  function makeSocket(name: string, parent: THREE.Object3D, pos: THREE.Vector3) {
    const s = new THREE.Group();
    s.name = name;
    s.position.copy(pos);
    parent.add(s);
    sockets[name] = s;
    return s;
  }
  makeSocket('socket-chassis', root, new THREE.Vector3(0, 0.05, 0));
  makeSocket('socket-face-screen', chassis, new THREE.Vector3(0, 0.55, 0.71));
  makeSocket('socket-wheel-FL', chassis, new THREE.Vector3(-0.92, -0.35, 0.72));
  makeSocket('socket-wheel-FR', chassis, new THREE.Vector3(0.92, -0.35, 0.72));
  makeSocket('socket-wheel-RL', chassis, new THREE.Vector3(-0.92, -0.35, -0.72));
  makeSocket('socket-wheel-RR', chassis, new THREE.Vector3(0.92, -0.35, -0.72));
  makeSocket('socket-radio-module', chassis, new THREE.Vector3(0.96, 0.08, -0.12));
  makeSocket('socket-chest-ring', chassis, new THREE.Vector3(0, 0, 0.78));

  const meshes: Record<string, THREE.Mesh> = {
    'stage-platform-outer': platformOuter,
    'chassis-body': bodyMesh,
    'face-bezel': bezelMesh,
    'speaker-mesh': speakerMesh,
    'tire-FL': wheelFL.children[0] as THREE.Mesh,
  };

  const colliders: Record<string, unknown> = {
    chassis: { type: 'box', size: [1.9, 1.1, 2.0] },
    'wheel-FL': { type: 'cylinder', radius: 0.32, height: 0.24 },
  };

  const destructionGroups: Record<string, THREE.Object3D[]> = {
    'detachable-wheels': [wheelFL, wheelFR, wheelRL, wheelRR],
    'detachable-earcups': [earcupL, earcupR],
    'detachable-radio': [radioModule],
  };

  // Animation helpers
  const animations = {
    drive: (t: number, distance: number) => {
      const rot = distance * 2.5; // approximation
      [wheelFL, wheelFR, wheelRL, wheelRR].forEach((w) => {
        w.rotation.x = rot;
      });
      // slight bobbing
      chassis.position.y = 0.05 + Math.sin(t * 8) * 0.015;
    },
    setFaceExpression: (type: 'idle' | 'alert') => {
      if (type === 'alert') {
        eyeLeft.scale.set(1.15, 1.15, 1);
        eyeRight.scale.set(1.15, 1.15, 1);
        (eyeLeft.children[0] as THREE.Mesh).material = emissiveWhiteMat.clone();
        ((eyeLeft.children[0] as THREE.Mesh).material as THREE.MeshPhysicalMaterial).emissiveIntensity = 3.5;
        ((eyeRight.children[0] as THREE.Mesh).material as THREE.MeshPhysicalMaterial).emissiveIntensity = 3.5;
      } else {
        eyeLeft.scale.set(1, 1, 1);
        eyeRight.scale.set(1, 1, 1);
      }
    },
    pulseChest: (t: number) => {
      const s = 1 + Math.sin(t * 6) * 0.05;
      chestRingGroup.scale.set(s, s, s);
      (chestOuter.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 2.2 + Math.sin(t * 6) * 0.8;
    },
  };

  root.userData.sculptRuntime = {
    nodes,
    meshes,
    sockets,
    colliders,
    destructionGroups,
    animations,
  } as ProceduralModelRuntime;

  root.userData.sculptSpec = {
    targetName: 'Pink Cat-Eared Cyber-Bot Vehicle',
    domain: 'object',
    tier: 'ultra-complex',
    materials: {
      pinkBody: '#EE98B9 roughness 0.35 clearcoat 0.2',
      emissive: '#FF2A85 / #FFFFFF intensity 2.2',
      rims: '#D1D5DB metalness 0.85 roughness 0.22',
      tires: '#1C1C1E roughness 0.85',
    },
    hierarchy: 'root -> stage-platform, chassis -> face-screen, ears (L/R), headphones, chest-ring, bumper, radio-module, wheels',
  };

  // Enable shadows
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const m = obj as THREE.Mesh;
      m.castShadow = castShadow;
      m.receiveShadow = receiveShadow;
    }
  });

  return root;
}

export function createCyberBotVehicleLights(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'cyber-bot-lights';
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(3, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 12;
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  g.add(key);
  const fill = new THREE.DirectionalLight(0xc0d0ff, 0.5);
  fill.position.set(-3, 4, 2);
  g.add(fill);
  const rim = new THREE.DirectionalLight(0xffd0e0, 0.6);
  rim.position.set(0, 3, -5);
  g.add(rim);
  const hemi = new THREE.HemisphereLight(0xfff0f5, 0x202030, 0.45);
  g.add(hemi);
  return g;
}

export function createCyberBotVehicleEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  // Simple procedural environment - use PMREM from RoomEnvironment if available, fallback to null handling
  // @ts-ignore
  try {
    // dynamic import attempt not allowed here, try to use THREE's default
    const { RoomEnvironment } = require('three/examples/jsm/environments/RoomEnvironment.js') as any;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return tex;
  } catch {
    // fallback: create small data texture
    const size = 2;
    const data = new Uint8Array(size * size * 3);
    for (let i = 0; i < data.length; i++) data[i] = 200;
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
    tex.needsUpdate = true;
    return tex;
  }
}

export function frameCyberBotVehicleCamera(camera: THREE.PerspectiveCamera, object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = (camera.fov * Math.PI) / 180;
  const dist = (maxDim / 2) / Math.tan(fov / 2) * 1.4;
  camera.position.set(center.x + dist * 0.7, center.y + dist * 0.45, center.z + dist * 0.7);
  camera.lookAt(center);
  camera.near = dist / 100;
  camera.far = dist * 100;
  camera.updateProjectionMatrix();
}
