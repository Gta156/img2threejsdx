import * as THREE from 'three';

/** A self-contained, animation-ready reconstruction of the pastel cyber-bot vehicle. */
export function createCyberBotVehicleModel(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'cyber-bot-vehicle';

  const body = new THREE.MeshPhysicalMaterial({ color: 0xee98b9, roughness: 0.34, metalness: 0.05, clearcoat: 0.22, clearcoatRoughness: 0.45 });
  const pink = new THREE.MeshStandardMaterial({ color: 0xff2a85, emissive: 0xff2a85, emissiveIntensity: 2.5, roughness: 0.3 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 3.5, roughness: 0.25 });
  const silver = new THREE.MeshPhysicalMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.22 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1c1c1e, roughness: 0.72 });
  const screen = new THREE.MeshStandardMaterial({ color: 0x211923, metalness: 0.15, roughness: 0.28 });
  const darkPink = new THREE.MeshStandardMaterial({ color: 0xa64b7c, roughness: 0.38 });
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, name: string) => {
    const result = new THREE.Mesh(geometry, material); result.name = name; result.castShadow = result.receiveShadow = true; return result;
  };
  const box = (size: [number, number, number], material: THREE.Material, name: string, p: [number, number, number]) => {
    const item = mesh(new THREE.BoxGeometry(...size), material, name); item.position.set(...p); return item;
  };
  const cylinder = (radius: number, depth: number, material: THREE.Material, name: string, p: [number, number, number], axis: 'x' | 'y' | 'z' = 'y') => {
    const item = mesh(new THREE.CylinderGeometry(radius, radius, depth, 32), material, name);
    if (axis === 'x') item.rotation.z = Math.PI / 2;
    if (axis === 'z') item.rotation.x = Math.PI / 2;
    item.position.set(...p); return item;
  };

  // stage-platform
  const stage = new THREE.Group(); stage.name = 'stage-platform'; root.add(stage);
  stage.add(cylinder(2.7, 0.16, white, 'stage-plinth', [0, -1.08, 0]));
  const rim = cylinder(2.76, 0.05, pink, 'stage-pink-rim', [0, -0.98, 0]); stage.add(rim);
  stage.add(cylinder(2.47, 0.055, new THREE.MeshStandardMaterial({ color: 0xf6d8ed, roughness: 0.5 }), 'stage-inset', [0, -0.945, 0]));

  // chassis: broad, toy-like shell, front points toward negative Z.
  const chassis = new THREE.Group(); chassis.name = 'chassis'; root.add(chassis);
  chassis.add(box([2.48, 1.55, 1.72], body, 'main-body-shell', [0, 0.03, 0]));
  chassis.add(box([2.04, 0.23, 1.24], darkPink, 'roof-panel', [0, 0.87, 0.02]));
  chassis.add(box([1.55, 0.12, 0.72], body, 'rear-cap', [0, 0.08, 0.93]));

  const face = new THREE.Group(); face.name = 'face-screen'; chassis.add(face);
  face.add(box([1.92, 1.08, 0.10], silver, 'face-silver-bezel', [0, 0.24, -0.91]));
  face.add(box([1.78, 0.92, 0.11], screen, 'cat-face-display', [0, 0.24, -0.975]));
  for (const x of [-0.48, 0.48]) face.add(cylinder(0.19, 0.035, white, x < 0 ? 'left-eye' : 'right-eye', [x, 0.32, -1.05], 'z'));
  // cat mouth: three bright strokes.
  for (const [x, y, angle] of [[-0.07, -0.05, -0.68], [0.07, -0.05, 0.68], [0, -0.105, 0]] as [number, number, number][]) {
    const stroke = cylinder(0.026, 0.18, white, 'cat-mouth-stroke', [x, y, -1.055], 'z'); stroke.rotation.z = angle; face.add(stroke);
  }

  const ears = new THREE.Group(); ears.name = 'ears'; chassis.add(ears);
  const earShape = new THREE.Shape(); earShape.moveTo(-0.29, 0); earShape.lineTo(0, 0.55); earShape.lineTo(0.29, 0); earShape.closePath();
  for (const x of [-0.74, 0.74]) {
    const ear = mesh(new THREE.ExtrudeGeometry(earShape, { depth: 0.11, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.03 }), body, x < 0 ? 'left-ear' : 'right-ear');
    ear.position.set(x, 0.91, -0.16); ear.rotation.y = x < 0 ? -0.13 : 0.13; ears.add(ear);
    const inner = mesh(new THREE.ShapeGeometry(earShape), pink, 'ear-inner-glow'); inner.scale.set(0.57, 0.57, 1); inner.position.set(x, 1.00, -0.235); ears.add(inner);
  }

  const headphones = new THREE.Group(); headphones.name = 'headphones'; chassis.add(headphones);
  const band = mesh(new THREE.TorusGeometry(1.19, 0.07, 12, 48, Math.PI), darkPink, 'earcup-headband'); band.rotation.x = Math.PI / 2; band.rotation.z = Math.PI; band.position.set(0, 0.81, -0.01); headphones.add(band);
  for (const x of [-1.3, 1.3]) {
    const cup = new THREE.Group(); cup.name = x < 0 ? 'left-earcup' : 'right-earcup'; cup.position.set(x, 0.04, 0); headphones.add(cup);
    cup.add(cylinder(0.47, 0.18, silver, 'earcup-metal-ring', [0, 0, 0], 'x'));
    cup.add(cylinder(0.37, 0.205, darkPink, 'earcup-pink-pad', [x < 0 ? -0.035 : 0.035, 0, 0], 'x'));
    cup.add(cylinder(0.12, 0.22, pink, 'earcup-center-light', [x < 0 ? -0.065 : 0.065, 0, 0], 'x'));
  }

  const chest = new THREE.Group(); chest.name = 'chest-ring'; chest.position.set(0, -0.5, -0.98); chassis.add(chest);
  chest.add(mesh(new THREE.TorusGeometry(0.37, 0.075, 12, 36), pink, 'subwoofer-glow-ring'));
  chest.children[0].rotation.x = Math.PI / 2;
  chest.add(cylinder(0.27, 0.06, darkPink, 'subwoofer-cone', [0, 0, -0.035], 'z'));
  chest.add(cylinder(0.16, 0.07, pink, 'subwoofer-dome', [0, 0, -0.075], 'z'));

  const bumper = new THREE.Group(); bumper.name = 'bumper'; chassis.add(bumper);
  bumper.add(box([2.18, 0.18, 0.17], silver, 'lower-bumper-rail', [0, -0.74, -1.03]));
  for (const x of [-0.88, 0.88]) { bumper.add(box([0.38, 0.42, 0.18], body, 'bumper-corner-block', [x, -0.61, -1.04])); bumper.add(cylinder(0.13, 0.05, silver, 'bumper-grille-knob', [x, -0.58, -1.15], 'z')); }
  for (const x of [-0.62, 0.62]) bumper.add(cylinder(0.17, 0.05, silver, 'round-bumper-grille', [x, -0.37, -1.07], 'z'));
  bumper.add(box([0.53, 0.07, 0.05], silver, 'slim-lower-grille', [0, -0.81, -1.14]));

  const radio = new THREE.Group(); radio.name = 'radio-module'; radio.position.set(1.3, 0.25, 0.42); chassis.add(radio);
  radio.add(box([0.28, 0.57, 0.54], body, 'side-radio-case', [0, 0, 0]));
  for (let y = -0.16; y <= 0.16; y += 0.08) radio.add(box([0.035, 0.035, 0.32], pink, 'radio-grille-slat', [0.16, y, 0]));
  for (const [z, h] of [[-0.16, 0.66], [0.16, 0.5]] as [number, number][]) { radio.add(cylinder(0.025, h, silver, 'radio-antenna-mast', [0, 0.48 + h / 2, z])); radio.add(cylinder(0.06, 0.12, darkPink, 'radio-antenna-tip', [0, 0.54 + h, z])); }

  const wheels = new THREE.Group(); wheels.name = 'wheels'; chassis.add(wheels);
  const wheelData: [string, number, number][] = [['FL', -1.15, -0.62], ['FR', 1.15, -0.62], ['RL', -1.15, 0.65], ['RR', 1.15, 0.65]];
  for (const [name, x, z] of wheelData) {
    const wheel = new THREE.Group(); wheel.name = name; wheel.position.set(x, -0.72, z); wheels.add(wheel);
    wheel.add(cylinder(0.48, 0.30, rubber, `${name}-rubber-tire`, [0, 0, 0], 'x'));
    wheel.add(cylinder(0.31, 0.325, silver, `${name}-silver-rim`, [x < 0 ? -0.02 : 0.02, 0, 0], 'x'));
    wheel.add(cylinder(0.09, 0.34, darkPink, `${name}-hub`, [x < 0 ? -0.04 : 0.04, 0, 0], 'x'));
    for (let spoke = 0; spoke < 5; spoke++) { const s = box([0.05, 0.39, 0.075], silver, `${name}-spoke-${spoke}`, [x < 0 ? -0.21 : 0.21, 0, 0]); s.rotation.x = Math.PI / 2; s.rotation.z = spoke * Math.PI * 2 / 5; wheel.add(s); }
  }

  const faceLight = new THREE.PointLight(0xff8cc6, 2.2, 3.5); faceLight.name = 'face-light'; faceLight.position.set(0, 0.3, -1.5); chassis.add(faceLight);
  const subwooferLight = new THREE.PointLight(0xff2a85, 2, 2.6); subwooferLight.name = 'subwoofer-light'; subwooferLight.position.set(0, -0.45, -1.4); chassis.add(subwooferLight);
  const nodes = { root, stage, chassis, face, ears, headphones, chest, bumper, radio, wheels };
  root.userData.sculptRuntime = { nodes, sockets: { roof: chassis, radio: radio }, colliders: [chassis], destructionGroups: { accessories: [ears, headphones, radio], rolling: [wheels] }, tick: (time: number) => { chest.rotation.z = Math.sin(time * 3) * 0.035; faceLight.intensity = 1.9 + Math.sin(time * 4) * 0.3; subwooferLight.intensity = 1.7 + Math.sin(time * 6) * 0.35; } };
  return root;
}
