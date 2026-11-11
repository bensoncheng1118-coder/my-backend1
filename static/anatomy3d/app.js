// 聽覺與構音解剖構造：互動 3D 模型
// 真實形狀的骨骼、軟骨、肌肉、腦幹與皮質來自 BodyParts3D（© DBCLS, CC BY-SA 2.1 JP），
// 由 scripts 精簡後存成 auditory.bin / oral.bin；聽小骨、耳蝸、柯地氏器與腦幹聽覺核為程式建立的示意模型。
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { INFO, PATHWAY } from './info.js';

const BASE = document.querySelector('meta[name="anatomy-base"]')?.content || '/static/anatomy3d/';
const $ = (s) => document.querySelector(s);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ───────────────────────── 場景 ─────────────────────────
const stage = $('#stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
stage.appendChild(renderer.domElement);
const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.className = 'label-layer';
stage.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 4000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.09;
controls.screenSpacePanning = true;

scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f9c, 1.05));
const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(0.6, 1, 0.8); scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, 0.55); fill.position.set(-0.8, -0.3, -0.6); scene.add(fill);
// 讓光源跟著相機，任何角度看都清楚
const lightRig = new THREE.Object3D(); scene.add(lightRig);
lightRig.add(key); lightRig.add(fill); lightRig.add(key.target); lightRig.add(fill.target);

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h); labelRenderer.setSize(w, h);
  camera.aspect = w / Math.max(h, 1); camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);

// ───────────────────────── 外觀 ─────────────────────────
const C = {
  bone: 0xe8dcc3, cart: 0x9fcfe0, muscle: 0xc4545c, muscle2: 0xd8737a, lig: 0xe6d49a, nerve: 0xf2c94c,
  brain: 0xd8c3c0, skin: 0xefb9a0, tooth: 0xfbf8ee, mucosa: 0xe58f9b
};
// key → [顏色, 透明度, 圖層]
const STYLE = {
  // 聽覺（BodyParts3D）
  pinna: [C.skin, 1, 'ear'], temporal_bone: [C.bone, 0.18, 'bone'], cn8: [C.nerve, 1, 'nerve'], facial_nerve: [0xf6a945, 1, 'nerve'],
  pons: [C.brain, 0.28, 'brain'], medulla: [C.brain, 0.28, 'brain'], cerebellum: [0xcdb4b0, 0.16, 'brain'],
  ic: [0xe0558d, 1, 'nucleus'], bic: [0xe889b0, 1, 'nucleus'], sc: [0xaab3c0, 0.75, 'brain'], mgb: [0x34b77f, 1, 'nucleus'],
  thalamus: [0xbfd9c9, 0.22, 'brain'], stg_post: [0x9db6e8, 0.55, 'cortex'], stg_ant: [0xc3cde6, 0.4, 'cortex'], corpus_callosum: [0xd9d4e8, 0.35, 'cortex'],
  // 口咽喉
  thyroid_cart: [C.cart, 1, 'cart'], cricoid_cart: [C.cart, 1, 'cart'], arytenoid_cart: [0x7fbcd6, 1, 'cart'], corniculate_cart: [0x6fb0cc, 1, 'cart'],
  cuneiform_cart: [0x6fb0cc, 1, 'cart'], epiglottis: [0x8fd0c4, 1, 'cart'], hyoid: [C.bone, 1, 'bone'],
  vocal_lig: [0xfff2c2, 1, 'lig'], vocalis: [0xe0606a, 1, 'muscle'], thyroarytenoid: [0xb94a55, 1, 'muscle'], pca: [0xd6455a, 1, 'muscle'],
  lca: [0xe26a50, 1, 'muscle'], ia: [0xc75b8a, 1, 'muscle'], aryepiglotticus: [0xd07aa0, 1, 'muscle'], cricothyroid: [0xe98a5a, 1, 'muscle'],
  cricothyroid_lig: [C.lig, 0.9, 'lig'], thyrohyoid_mem: [C.lig, 0.75, 'lig'], epiglottic_lig: [C.lig, 0.9, 'lig'],
  spc: [0xb9575e, 0.92, 'muscle'], mpc: [0xc66a62, 0.92, 'muscle'], ipc: [0xa94b55, 0.92, 'muscle'], pharyngeal_raphe: [C.lig, 1, 'lig'],
  stylopharyngeus: [0xdb7d6b, 1, 'muscle'], salpingopharyngeus: [0xd98aa0, 1, 'muscle'], palatopharyngeus: [0xc9677a, 1, 'muscle'],
  lvp: [0xe0797f, 1, 'muscle'], tvp: [0xd59a6b, 1, 'muscle'], uvulae: [0xef8f8f, 1, 'muscle'],
  tongue: [0xe0838e, 0.9, 'soft'], genioglossus: [0xc85a66, 1, 'muscle'], hyoglossus: [0xd06e6e, 1, 'muscle'],
  digastric: [0xbf5a50, 1, 'muscle'], mylohyoid: [0xcf6b5a, 0.95, 'muscle'], geniohyoid: [0xb64e5a, 1, 'muscle'], stylohyoid: [0xd98366, 1, 'muscle'],
  sternohyoid: [0xc1505b, 1, 'muscle'], sternothyroid: [0xae4553, 1, 'muscle'], thyrohyoid: [0xd36a6f, 1, 'muscle'], omohyoid: [0xc96a5a, 1, 'muscle'],
  stylohyoid_lig: [C.lig, 1, 'lig'], stylomandibular_lig: [C.lig, 1, 'lig'],
  mandible: [C.bone, 1, 'bone'], maxilla: [C.bone, 1, 'bone'], palatine: [0xe2d2b2, 1, 'bone'], sphenoid: [C.bone, 0.5, 'bone'], vomer: [C.bone, 1, 'bone'],
  ethmoid: [C.bone, 1, 'bone'], concha: [0xeac7b4, 1, 'bone'], nasal_bone: [C.bone, 1, 'bone'], nasal_cart: [C.cart, 1, 'cart'], zygomatic: [C.bone, 0.6, 'bone'],
  occipital: [C.bone, 0.45, 'bone'], temporal_bone_o: [C.bone, 0.45, 'bone'], cervical: [0xe6dcc8, 1, 'bone'], disc: [0xb8d3e8, 1, 'bone'],
  incisor: [C.tooth, 1, 'bone'], canine: [C.tooth, 1, 'bone'], premolar: [C.tooth, 1, 'bone'], molar: [C.tooth, 1, 'bone'], gingiva: [C.mucosa, 1, 'soft'],
  lip: [0xe48a8a, 0.9, 'soft'], trachea: [0xa6d3e3, 1, 'cart'], esophagus: [0xe3a1a6, 1, 'soft'],
  vagus: [C.nerve, 1, 'nerve'], rln: [0xf4b63f, 1, 'nerve'], hypoglossal: [0xf2dc6b, 1, 'nerve']
};
const LAYERS = {
  aud: [['ear', '外耳'], ['bone', '顳骨'], ['inner', '中耳・內耳'], ['nerve', '神經'], ['brain', '腦幹・視丘'], ['nucleus', '聽覺神經核'], ['path', '傳導束'], ['cortex', '大腦皮質']],
  oral: [['bone', '骨骼・牙齒'], ['cart', '軟骨'], ['muscle', '肌肉'], ['lig', '韌帶・膜'], ['soft', '舌・軟組織'], ['nerve', '神經']]
};

function makeMat(color, opacity = 1, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness: 0.62, metalness: 0.02, side: THREE.DoubleSide,
    transparent: opacity < 1, opacity, depthWrite: opacity >= 0.6, ...extra
  });
}

// ───────────────────────── 登錄 ─────────────────────────
const SYS = {
  aud: { root: new THREE.Group(), meshes: [], labels: [], loaded: false, center: null },
  oral: { root: new THREE.Group(), meshes: [], labels: [], loaded: false, center: null }
};
scene.add(SYS.aud.root, SYS.oral.root);

function register(sys, mesh, k, opts = {}) {
  const mat = mesh.material;
  mesh.userData = {
    key: k, sys, side: opts.side || 'M', layer: opts.layer || (STYLE[k] && STYLE[k][2]) || 'inner',
    group: opts.group || 'bp', shell: !!opts.shell, label: opts.label,
    baseOpacity: mat.opacity, baseColor: mat.color.clone(), vertexColors: !!mat.vertexColors
  };
  SYS[sys].meshes.push(mesh);
  return mesh;
}

// ─────────────────── 讀取 BodyParts3D 精簡網格 ───────────────────
async function loadBin(sys, file, parent) {
  const res = await fetch(BASE + file);
  if (!res.ok) throw new Error(file + ' ' + res.status);
  const buf = await res.arrayBuffer();
  const hlen = new DataView(buf).getUint32(0, true);
  const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, hlen)));
  const base = 4 + hlen;
  for (const n of header.nodes) {
    const q = new Int16Array(buf, base + n.vOff, n.vCount * 3);
    const pos = new Float32Array(n.vCount * 3);
    for (let i = 0; i < pos.length; i++) {
      const a = i % 3;
      pos[i] = n.min[a] + ((q[i] + 32768) / 65535) * (n.max[a] - n.min[a]);
    }
    const idx = n.i32 ? new Uint32Array(buf, base + n.iOff, n.iCount) : new Uint16Array(buf, base + n.iOff, n.iCount);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(new THREE.BufferAttribute(idx.slice(), 1));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    let k = n.key;
    let st = STYLE[k];
    if (sys === 'oral' && k === 'temporal_bone') st = STYLE.temporal_bone_o;
    const mesh = new THREE.Mesh(g, makeMat(st ? st[0] : 0xcccccc, st ? st[1] : 1));
    mesh.name = n.name;
    const shell = (sys === 'aud' && ['temporal_bone', 'pons', 'medulla', 'cerebellum', 'thalamus', 'corpus_callosum', 'stg_ant'].includes(k)) ||
      (sys === 'oral' && ['occipital', 'sphenoid', 'temporal_bone', 'zygomatic'].includes(k));
    register(sys, mesh, k, { side: n.side, shell, layer: st ? st[2] : 'bone' });
    mesh.userData.en = n.name;
    parent.add(mesh);
  }
  return new THREE.Vector3(...header.center);
}

// ─────────────────── 幾何小工具 ───────────────────
function taperTube(curve, nSeg, nRad, rFn, colFn) {
  const frames = curve.computeFrenetFrames(nSeg, false);
  const pos = [], nor = [], col = [], idx = [];
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  for (let i = 0; i <= nSeg; i++) {
    const t = i / nSeg; curve.getPointAt(t, P);
    const r = rFn(t), Nn = frames.normals[i], B = frames.binormals[i];
    const c = colFn ? colFn(t) : null;
    for (let j = 0; j <= nRad; j++) {
      const v = j / nRad * Math.PI * 2, s = Math.sin(v), cs = -Math.cos(v);
      N.set(cs * Nn.x + s * B.x, cs * Nn.y + s * B.y, cs * Nn.z + s * B.z).normalize();
      pos.push(P.x + r * N.x, P.y + r * N.y, P.z + r * N.z); nor.push(N.x, N.y, N.z);
      if (c) col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 1; i <= nSeg; i++) for (let j = 1; j <= nRad; j++) {
    const a = (nRad + 1) * (i - 1) + (j - 1), b = (nRad + 1) * i + (j - 1), c2 = (nRad + 1) * i + j, d = (nRad + 1) * (i - 1) + j;
    idx.push(a, b, d, b, c2, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  if (col.length) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  return g;
}
const curveOf = (pts) => new THREE.CatmullRomCurve3(pts.map((p) => p.clone ? p.clone() : V(...p)), false, 'centripetal');
function tube(pts, r0, r1 = r0, seg = 48) {
  const c = curveOf(pts);
  return taperTube(c, seg, 10, (t) => r0 + (r1 - r0) * t);
}
function ellipsoid(rx, ry, rz, seg = 24) {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)); g.scale(rx, ry, rz); return g;
}
function addMesh(sys, parent, geo, color, k, opts = {}) {
  const m = new THREE.Mesh(geo, makeMat(color, opts.opacity ?? 1, opts.mat || {}));
  if (opts.pos) m.position.copy(opts.pos);
  if (opts.rot) m.rotation.set(...opts.rot);
  parent.add(m);
  register(sys, m, k, { group: opts.group || 'proc', layer: opts.layer, side: opts.side, shell: opts.shell });
  return m;
}
const lerpColor = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t);
function tonoColor(t) { // 0 = 高頻（紅）… 1 = 低頻（藍）
  const stops = [0xe5484d, 0xf2a33a, 0xe8d44d, 0x55c28a, 0x4f86e8];
  const x = Math.min(0.9999, Math.max(0, t)) * (stops.length - 1), i = Math.floor(x);
  return lerpColor(stops[i], stops[i + 1], x - i);
}

// ─────────────────── 周邊聽覺：程式建模（毫米） ───────────────────
// 座位：以鼓膜中心為原點，+x 朝內（向中線），+y 朝上，+z 朝前。右耳直接放；左耳以 x 鏡射。
const EAR = { tmAbs: V(-52.5, 1503, 86), canalIn: V(-10, 3, -2) };
const anim = { ossicles: [], tm: [], footplate: [], corti: null, tect: null, cochleaCurves: {} };

function buildEar(sideSign) {
  const s = 'aud', side = sideSign < 0 ? 'R' : 'L';
  const g = new THREE.Group();
  g.position.copy(EAR.tmAbs.clone().multiply(V(sideSign < 0 ? 1 : -1, 1, 1)).sub(SYS.aud.center));
  if (sideSign > 0) g.scale.x = -1;
  const o = { group: 'ear', side, layer: 'inner' };

  // 外耳道
  addMesh(s, g, tube([EAR.canalIn, V(-7, 2.4, -1.2), V(-3.5, 1, -0.4), V(-0.3, 0, 0)], 3.2, 3.7, 40), 0xeaa58f, 'ear_canal', { ...o, layer: 'ear', opacity: 0.55 });
  // 鼓膜：淺圓錐，頂點（臍）朝內
  const tmGeo = new THREE.LatheGeometry([V(0, 1.6, 0), V(1.2, 1.15, 0), V(2.6, 0.6, 0), V(3.6, 0.2, 0), V(4.3, 0, 0)], 40);
  tmGeo.rotateZ(-Math.PI / 2);
  const tm = addMesh(s, g, tmGeo, 0xd8d2c8, 'tm', { ...o, opacity: 0.88, rot: [0, 0, 0.32] });
  anim.tm.push(tm);
  // 鼓室（外殼）
  addMesh(s, g, ellipsoid(3.1, 6.2, 5.2), 0x9fc4e8, 'tympanic_cavity', { ...o, opacity: 0.1, shell: true, pos: V(3.4, 1.4, 0.2) });

  // 聽小骨鏈（同一個樞紐轉動）
  const piv = new THREE.Group(); piv.position.set(1.9, 5.3, 0); g.add(piv);
  const og = new THREE.Group(); og.position.set(-1.9, -5.3, 0); piv.add(og);
  anim.ossicles.push(piv);
  const bone = 0xf1e7d0;
  const mal = [
    tube([V(1.45, -0.2, 0.1), V(1.25, 1.6, 0.2), V(1.15, 3.4, 0.3), V(1.3, 4.4, 0.35)], 0.32, 0.42, 24),
    ellipsoid(1.05, 1.3, 1.0).translate(1.4, 5.4, 0.35),
    ellipsoid(0.35, 0.35, 0.35).translate(0.75, 3.9, 0.3)
  ];
  addMesh(s, og, mergeGeometries(mal.map((x) => x.toNonIndexed ? x.toNonIndexed() : x).map(stripUV)), bone, 'malleus', o);
  const inc = [
    ellipsoid(1.0, 1.05, 0.95).translate(2.75, 5.35, -0.55),
    tube([V(2.8, 5.5, -1.0), V(2.95, 5.6, -2.8)], 0.45, 0.2, 10),
    tube([V(2.85, 4.6, -0.6), V(3.0, 3.0, -0.5), V(3.1, 1.5, -0.4), V(3.65, 1.05, -0.35)], 0.36, 0.24, 24)
  ];
  addMesh(s, og, mergeGeometries(inc.map(stripUV)), bone, 'incus', o);
  const fp = new THREE.CylinderGeometry(1, 1, 0.22, 28); fp.scale(0.62, 1, 1.5); fp.rotateZ(Math.PI / 2); fp.translate(6.35, 1.0, -0.25);
  const sta = [
    ellipsoid(0.38, 0.38, 0.38).translate(3.95, 1.0, -0.3),
    tube([V(4.1, 1.0, -0.3), V(5.0, 1.0, 0.55), V(6.25, 1.0, 1.0)], 0.13, 0.13, 16),
    tube([V(4.1, 1.0, -0.3), V(5.0, 1.0, -1.25), V(6.25, 1.0, -1.55)], 0.13, 0.13, 16),
    fp
  ];
  addMesh(s, og, mergeGeometries(sta.map(stripUV)), 0xf7efdc, 'stapes', o);

  // 中耳肌
  addMesh(s, g, tube([V(1.25, 4.3, 0.45), V(2.6, 4.2, 2.6), V(4.4, 4.0, 6.5)], 0.32, 0.55, 20), 0xc8505a, 'tensor_tympani', o);
  addMesh(s, g, tube([V(4.3, 1.05, -0.55), V(4.6, 0.6, -2.0), V(4.9, -0.2, -3.8)], 0.22, 0.42, 16), 0xc8505a, 'stapedius', o);
  // 耳咽管
  addMesh(s, g, tube([V(3.0, -2.6, 3.8), V(7, -6.5, 11), V(13, -10.5, 18), V(20, -14, 23)], 0.8, 1.7, 40), 0xe79aa6, 'eustachian', { ...o, opacity: 0.8 });

  // 卵圓窗、圓窗
  const ow = new THREE.TorusGeometry(1.55, 0.2, 10, 36); ow.scale(1, 0.55, 1.05); ow.rotateY(Math.PI / 2);
  addMesh(s, g, ow, 0x6ec6c9, 'oval_window', { ...o, pos: V(6.55, 1.0, -0.25) });
  const rw = mergeGeometries([(() => { const t = new THREE.TorusGeometry(0.95, 0.17, 10, 30); t.rotateY(Math.PI / 2); return stripUV(t); })(),
    (() => { const c = new THREE.CircleGeometry(0.95, 30); c.rotateY(Math.PI / 2); return stripUV(c); })()]);
  addMesh(s, g, rw, 0x6ec6c9, 'round_window', { ...o, pos: V(6.3, -2.2, 0.9), rot: [0, 0.35, 0] });

  // 前庭與半規管（骨迷路）
  const lab = 0xc6b6ee;
  addMesh(s, g, ellipsoid(1.9, 1.7, 2.1), lab, 'vestibule', { ...o, pos: V(8.4, 1.0, -1.0), opacity: 0.95 });
  const canal = (r, ctr, rot) => { const t = new THREE.TorusGeometry(r, 0.32, 10, 48, Math.PI * 1.6); t.rotateX(rot[0]); t.rotateY(rot[1]); t.rotateZ(rot[2]); t.translate(ctr.x, ctr.y, ctr.z); return stripUV(t); };
  addMesh(s, g, mergeGeometries([
    canal(2.6, V(9.2, 4.2, -1.6), [0, 0.7, 2.2]),       // 前（上）半規管
    canal(2.4, V(10.2, 1.6, -4.2), [0, -0.9, 3.8]),     // 後半規管
    canal(2.2, V(8.9, 1.6, -4.0), [Math.PI / 2, 0, 1.2]) // 外側半規管
  ]), lab, 'scc', { ...o, opacity: 0.95 });

  // 耳蝸：錐狀螺旋，顏色 = 音調排列
  const coch = new THREE.Group();
  const baseC = V(7.4, -0.9, 2.2);
  const axis = V(-0.42, -0.3, 0.86).normalize();
  coch.position.copy(baseC);
  coch.quaternion.setFromUnitVectors(V(0, 0, 1), axis);
  g.add(coch);
  const turns = 2.6, H = 4.6;
  // 找讓基底轉起點最接近圓窗的相位
  let phase = 0, best = 1e9;
  const tmp = new THREE.Object3D(); tmp.position.copy(baseC); tmp.quaternion.copy(coch.quaternion); tmp.updateMatrix();
  for (let a = 0; a < Math.PI * 2; a += 0.05) {
    const p = V(3.9 * Math.cos(a), 3.9 * Math.sin(a), 0.2).applyMatrix4(tmp.matrix);
    const d = p.distanceTo(V(6.3, -2.2, 0.9)); if (d < best) { best = d; phase = a; }
  }
  const spiralPt = (t, rScale = 1) => {
    const ang = phase + t * turns * Math.PI * 2 * (sideSign < 0 ? 1 : 1);
    const r = (0.8 + 3.1 * Math.pow(1 - t, 0.85)) * rScale;
    return V(r * Math.cos(ang), r * Math.sin(ang), 0.2 + H * Math.pow(t, 0.9));
  };
  const spiral = new THREE.Curve(); spiral.getPoint = (t, tgt = new THREE.Vector3()) => tgt.copy(spiralPt(t));
  const cg = taperTube(spiral, 260, 14, (t) => 1.25 - 0.75 * t, (t) => tonoColor(t));
  addMesh(s, coch, cg, 0xffffff, 'cochlea', { ...o, mat: { vertexColors: true }, opacity: 0.93 });
  const sg = new THREE.Curve(); sg.getPoint = (t, tgt = new THREE.Vector3()) => {
    const tt = t * 0.75, ang = phase + tt * turns * Math.PI * 2, r = 0.55 + 1.0 * Math.pow(1 - tt, 0.85);
    return tgt.set(r * Math.cos(ang), r * Math.sin(ang), 0.2 + H * Math.pow(tt, 0.9) * 0.92);
  };
  addMesh(s, coch, taperTube(sg, 120, 8, () => 0.28), 0xf4c542, 'spiral_ganglion', { ...o, layer: 'nerve' });
  // 蝸軸到聽神經
  addMesh(s, coch, tube([V(0, 0, 3.2), V(0, 0, 0.2), V(0, 0, -1.6)], 0.45, 0.75, 12), 0xf2c94c, 'cn8', { ...o, layer: 'nerve' });
  anim.cochleaCurves[side] = { spiral, coch };

  // 連接前庭與耳蝸基底轉
  addMesh(s, g, tube([V(8.0, -0.2, 0.4), V(7.0, -1.3, 1.6)], 1.15, 1.2, 8), lab, 'vestibule', { ...o, opacity: 0.95 });

  SYS.aud.root.add(g);
  return g;
}
function stripUV(g) {
  const out = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(out.attributes)) if (k !== 'position' && k !== 'normal') out.deleteAttribute(k);
  if (!out.attributes.normal) out.computeVertexNormals();
  return out;
}

// ─────────────────── 耳蝸剖面（柯地氏器） ───────────────────
const SECTION = new THREE.Group();
const SEC_POS = V(0, -400, 0); // 放在遠離頭部的位置，只在剖面視角顯示
function buildSection() {
  const s = 'aud', o = { group: 'section', layer: 'inner' };
  const L = 5;
  const ext = (shape) => { const g = new THREE.ExtrudeGeometry(shape, { depth: L, bevelEnabled: false, curveSegments: 24 }); g.translate(0, 0, -L / 2); return g; };
  const poly = (pts) => { const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) sh.lineTo(p[0], p[1]); sh.closePath(); return sh; };
  const arc = (r, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [r * Math.cos(a), r * Math.sin(a)]; });
  SECTION.position.copy(SEC_POS);

  // 骨性外壁（外殼）
  const wall = new THREE.Shape(); wall.absarc(0, 0, 3.5, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(0, 0, 3.05, 0, Math.PI * 2, true); wall.holes.push(hole);
  addMesh(s, SECTION, ext(wall), 0xe8dcc3, 'temporal_bone', { ...o, opacity: 0.22, shell: true });
  // 骨性螺旋板
  addMesh(s, SECTION, ext(poly([[-3.05, -0.55], [-1.25, -0.42], [-1.15, -0.3], [-1.3, -0.18], [-3.0, -0.05]])), 0xeee3cb, 'osseous_lamina', o);
  // 螺旋緣
  addMesh(s, SECTION, ext(poly([[-2.7, -0.05], [-1.35, -0.18], [-1.25, 0.15], [-1.5, 0.48], [-2.2, 0.55], [-2.75, 0.3]])), 0xe9b9a3, 'spiral_limbus', o);
  // 螺旋韌帶與血管紋
  const lig = [...arc(3.02, -32, 42), ...arc(2.35, 42, -32)];
  addMesh(s, SECTION, ext(poly(lig)), 0xe9c7a8, 'spiral_ligament', o);
  const str = [...arc(2.37, -4, 40), ...arc(2.08, 40, -4)];
  addMesh(s, SECTION, ext(poly(str)), 0xd64550, 'stria', o);
  // Reissner 氏膜
  const rmA = [-1.55, 0.5], rmB = [2.35 * Math.cos(41 * Math.PI / 180), 2.35 * Math.sin(41 * Math.PI / 180)];
  const dx = rmB[0] - rmA[0], dy = rmB[1] - rmA[1], len = Math.hypot(dx, dy);
  const rm = new THREE.BoxGeometry(len, 0.05, L); rm.rotateZ(Math.atan2(dy, dx)); rm.translate((rmA[0] + rmB[0]) / 2, (rmA[1] + rmB[1]) / 2, 0);
  addMesh(s, SECTION, rm, 0x9ad1f0, 'reissner', { ...o, opacity: 0.9 });
  // 三階液體（外殼）
  addMesh(s, SECTION, ext(poly([rmA, rmB, ...arc(2.98, 44, 176), [-2.8, 0.32], [-2.2, 0.58]])), 0x7fb2ff, 'scala_vestibuli', { ...o, opacity: 0.13, shell: true });
  addMesh(s, SECTION, ext(poly([rmA, rmB, ...arc(2.1, 38, -4), [2.15, -0.28], [-1.2, -0.28], [-1.35, 0.2]])), 0x5fd3c6, 'scala_media', { ...o, opacity: 0.16, shell: true });
  addMesh(s, SECTION, ext(poly([[-3.0, -0.6], ...arc(2.98, 188, 326), [2.4, -0.45], [-1.2, -0.45]])), 0x7fb2ff, 'scala_tympani', { ...o, opacity: 0.13, shell: true });

  // 柯地氏器（會隨基底膜振動）
  const corti = new THREE.Group(); const pivot = V(-1.2, -0.36, 0);
  const cortiPiv = new THREE.Group(); cortiPiv.position.copy(pivot); SECTION.add(cortiPiv);
  corti.position.copy(pivot.clone().negate()); cortiPiv.add(corti);
  anim.corti = cortiPiv;
  const bm = new THREE.BoxGeometry(3.6, 0.09, L); bm.translate(0.6, -0.36, 0);
  addMesh(s, corti, bm, 0xf0e2a0, 'basilar', o);
  addMesh(s, corti, ext(poly([[-0.42, -0.31], [-0.32, -0.31], [0.12, 0.62], [0.02, 0.62]])), 0xd7e8a0, 'pillar', o);
  addMesh(s, corti, ext(poly([[0.6, -0.31], [0.7, -0.31], [0.22, 0.62], [0.1, 0.62]])), 0xd7e8a0, 'pillar', o);
  addMesh(s, corti, ext(poly([[0.72, -0.31], [1.9, -0.31], [1.95, 0.05], [0.7, 0.05]])), 0xb8d8a8, 'supporting', o);
  addMesh(s, corti, ext(poly([[1.9, -0.31], [2.25, -0.31], [2.3, 0.1], [2.1, 0.55], [1.85, 0.62], [1.95, 0.05]])), 0xc9e2b6, 'supporting', o);
  addMesh(s, corti, ext(poly([[-1.15, -0.31], [-0.45, -0.31], [-0.5, 0.05], [-1.05, 0.05]])), 0xb8d8a8, 'supporting', o);
  const ihcG = [], ohcG = [], cil = [];
  const flask = [V(0, 0, 0), V(0.14, 0.04, 0), V(0.2, 0.2, 0), V(0.18, 0.4, 0), V(0.12, 0.55, 0), V(0, 0.58, 0)];
  for (let z = -L / 2 + 0.3; z < L / 2 - 0.1; z += 0.5) {
    const f = new THREE.LatheGeometry(flask, 14); f.translate(-0.78, 0.0, z); ihcG.push(stripUV(f));
    for (let k = 0; k < 4; k++) { const c = new THREE.CylinderGeometry(0.018, 0.018, 0.12 + k * 0.05, 5); c.translate(-0.86 + k * 0.05, 0.64 + k * 0.025, z); cil.push(stripUV(c)); }
  }
  for (const x of [0.92, 1.25, 1.58]) for (let z = -L / 2 + 0.2; z < L / 2 - 0.1; z += 0.4) {
    const c = new THREE.CylinderGeometry(0.11, 0.11, 0.62, 12); c.translate(x, 0.36, z); ohcG.push(stripUV(c));
    for (let k = 0; k < 3; k++) { const h = 0.08 + k * 0.05; const cc = new THREE.CylinderGeometry(0.016, 0.016, h, 5); cc.translate(x - 0.05 + k * 0.05, 0.67 + h / 2, z); cil.push(stripUV(cc)); }
  }
  addMesh(s, corti, mergeGeometries(ihcG), 0xff9f43, 'ihc', o);
  addMesh(s, corti, mergeGeometries(ohcG), 0x3fa7ff, 'ohc', o);
  addMesh(s, corti, mergeGeometries(cil), 0xffe9a8, 'stereocilia', o);
  // 傳入纖維（黃）與傳出纖維（青）
  const fib = [], eff = [];
  for (let z = -L / 2 + 0.3; z < L / 2 - 0.1; z += 0.5) {
    fib.push(stripUV(tube([V(-0.78, 0.02, z), V(-1.15, -0.3, z), V(-2.2, -0.3, z), V(-3.4, -0.32, z * 0.85), V(-4.3, -0.3, z * 0.7)], 0.035, 0.05, 20)));
  }
  for (let z = -L / 2 + 0.5; z < L / 2 - 0.3; z += 1.0) {
    fib.push(stripUV(tube([V(-1.15, -0.28, z), V(-0.2, -0.22, z), V(0.9, 0.04, z + 0.2), V(1.25, 0.04, z + 0.35)], 0.02, 0.02, 16)));
    eff.push(stripUV(tube([V(-2.5, -0.25, z + 0.25), V(-1.15, -0.23, z + 0.25), V(-0.1, 0.0, z + 0.25), V(0.92, 0.05, z + 0.25)], 0.025, 0.025, 16)));
  }
  addMesh(s, corti, mergeGeometries(fib), 0xf2c94c, 'an_fibers', { ...o, layer: 'nerve' });
  addMesh(s, corti, mergeGeometries(eff), 0x2ec4b6, 'olivocochlear', { ...o, layer: 'nerve' });
  // 覆膜（以螺旋緣為樞紐）
  const tPiv = new THREE.Group(); tPiv.position.set(-1.5, 0.5, 0); SECTION.add(tPiv); anim.tect = tPiv;
  const tm = ext(poly([[-1.6, 0.45], [-1.0, 0.74], [0.0, 0.8], [1.0, 0.79], [1.8, 0.78], [1.9, 1.0], [1.0, 1.06], [0, 1.13], [-1.0, 1.05], [-1.6, 0.72]]));
  tm.translate(1.5, -0.5, 0);
  addMesh(s, tPiv, tm, 0xc9a7ff, 'tectorial', { ...o, opacity: 0.72 });
  // 螺旋神經節（蝸軸）
  const gang = [];
  for (let z = -L / 2 + 0.3; z < L / 2; z += 0.5) for (let k = 0; k < 2; k++) gang.push(stripUV(ellipsoid(0.22, 0.16, 0.16, 10).translate(-4.4 - k * 0.35, -0.3 + k * 0.12, z * 0.7)));
  addMesh(s, SECTION, mergeGeometries(gang), 0xf4c542, 'spiral_ganglion', { ...o, layer: 'nerve' });
  SYS.aud.root.add(SECTION);
}

// ─────────────────── 中樞聽覺路徑（示意核團與傳導束） ───────────────────
const CEN = {};
function A(x, y, z) { return V(x, y, z).sub(SYS.aud.center); } // 絕對座標（BodyParts3D 三維座標）→ 場景座標
function buildCentral() {
  const s = 'aud';
  const nodes = (sg) => ({
    avcn: A(12.6 * sg, 1503.4, 72.2), pvcn: A(13.3 * sg, 1501.6, 69.4), dcn: A(12.0 * sg, 1505.7, 66.2),
    mso: A(5.0 * sg, 1507.6, 80.2), lso: A(7.2 * sg, 1507.2, 79.4), mntb: A(2.9 * sg, 1507.0, 81.6),
    ll0: A(7.6 * sg, 1509.0, 77.8), ll1: A(9.6 * sg, 1515.5, 75.2), ll2: A(8.2 * sg, 1523.5, 72.8), icIn: A(5.2 * sg, 1530.6, 71.6),
    ic: A(4.4 * sg, 1532.7, 71.4), mgb: A(15.0 * sg, 1539.8, 74.6), cn8m: A(11.7 * sg, 1504.1, 71.7), cn8l: A(45.6 * sg, 1502.3, 87.3)
  });
  CEN.R = nodes(-1); CEN.L = nodes(1);
  for (const [side, sg] of [['R', -1], ['L', 1]]) {
    const n = CEN[side], o = { group: 'central', side, layer: 'nucleus' };
    addMesh(s, SYS.aud.root, ellipsoid(1.6, 1.3, 1.8), 0xff7a59, 'avcn', { ...o, pos: n.avcn });
    addMesh(s, SYS.aud.root, ellipsoid(1.4, 1.2, 1.4), 0xff9f68, 'pvcn', { ...o, pos: n.pvcn });
    addMesh(s, SYS.aud.root, ellipsoid(1.2, 1.9, 1.4), 0xffc26e, 'dcn', { ...o, pos: n.dcn });
    addMesh(s, SYS.aud.root, ellipsoid(0.45, 1.4, 1.0), 0x2f8fd8, 'mso', { ...o, pos: n.mso });
    const lso = new THREE.TorusGeometry(0.75, 0.32, 10, 24, Math.PI * 1.3); lso.rotateY(Math.PI / 2);
    addMesh(s, SYS.aud.root, lso, 0x3fb6a8, 'lso', { ...o, pos: n.lso });
    addMesh(s, SYS.aud.root, ellipsoid(0.75, 0.75, 0.75), 0x8b6cf0, 'mntb', { ...o, pos: n.mntb });
    addMesh(s, SYS.aud.root, ellipsoid(1.0, 1.4, 1.0), 0xf0b94a, 'nll', { ...o, pos: n.ll1 });
    addMesh(s, SYS.aud.root, ellipsoid(0.9, 1.2, 0.9), 0xf0b94a, 'nll', { ...o, pos: n.ll2.clone().add(V(0, -1.5, 0.3)) });
    const p = { ...o, layer: 'path' };
    addMesh(s, SYS.aud.root, tube([n.lso, n.ll0, n.ll1, n.ll2, n.icIn], 0.42, 0.5, 40), 0xe8b84a, 'll', p);
    // 斜方體：AVCN → 對側 MNTB／MSO（和同側 MSO／LSO）
    const o2 = side === 'R' ? CEN.L : null;
    if (o2) {
      for (const [a, b] of [['R', 'L'], ['L', 'R']]) {
        const A0 = CEN[a], B0 = CEN[b];
        addMesh(s, SYS.aud.root, tube([A0.avcn, A(sgOf(a) * 6, 1505.6, 82.6), A(0, 1505.9, 83.4), B0.mntb], 0.22, 0.22, 30), 0xf0a868, 'trapezoid', { ...p, side: a });
        addMesh(s, SYS.aud.root, tube([A0.avcn, A(sgOf(a) * 5, 1506.2, 82.0), A(0, 1506.6, 82.4), B0.mso], 0.16, 0.16, 30), 0xf0a868, 'trapezoid', { ...p, side: a });
        // 背側聽紋：DCN → 對側外側丘系
        addMesh(s, SYS.aud.root, tube([A0.dcn, A(sgOf(a) * 6, 1509, 64.2), A(0, 1510.5, 64.6), A(-sgOf(a) * 7, 1513, 70.5), B0.ll1], 0.18, 0.18, 36), 0xf2c66d, 'das', { ...p, side: a });
        // 下丘連合、Probst 連合
      }
      addMesh(s, SYS.aud.root, tube([CEN.R.ic.clone().add(V(0, 0, -1.6)), A(0, 1533.3, 69.6), CEN.L.ic.clone().add(V(0, 0, -1.6))], 0.35, 0.35, 16), 0xe0558d, 'ic', { ...p, layer: 'nucleus', side: 'M' });
      addMesh(s, SYS.aud.root, tube([CEN.R.ll2, A(0, 1523.5, 69.5), CEN.L.ll2], 0.15, 0.15, 24), 0xf0b94a, 'nll', { ...p, side: 'M' });
    }
    for (const nb of [n.avcn, n.mso]) addMesh(s, SYS.aud.root, tube([n.avcn, n.avcn.clone().lerp(nb === n.mso ? n.mso : n.lso, 0.5).add(V(0, 0.8, 0.5)), nb === n.mso ? n.mso : n.lso], 0.16, 0.16, 12), 0xf0a868, 'trapezoid', p);
    addMesh(s, SYS.aud.root, tube([n.mntb, n.mntb.clone().lerp(n.lso, 0.5).add(V(0, -0.6, 0.4)), n.lso], 0.13, 0.13, 12), 0x8b6cf0, 'mntb', o);
  }
}
const sgOf = (side) => (side === 'R' ? -1 : 1);

// 用射線把 A1、Wernicke 區貼在 BodyParts3D 的顳上回表面
function surfacePoint(meshKey, side, from, dir) {
  const target = SYS.aud.meshes.filter((m) => m.userData.key === meshKey && m.userData.side === side);
  const rc = new THREE.Raycaster(from, dir.clone().normalize(), 0, 400);
  const hit = rc.intersectObjects(target, false)[0];
  return hit ? hit.point : null;
}
function buildCortex() {
  const s = 'aud';
  for (const [side, sg] of [['R', -1], ['L', 1]]) {
    let p = surfacePoint('stg_post', side, A(48 * sg, 1600, 76), V(0, -1, 0)) || A(48 * sg, 1547, 76);
    const g = new THREE.SphereGeometry(1, 40, 20); g.scale(7.5, 1.6, 2.6);
    const pos = g.attributes.position, col = [];
    for (let i = 0; i < pos.count; i++) { const t = (pos.getX(i) / 7.5 + 1) / 2; const c = tonoColor(sg < 0 ? t : 1 - t); col.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    // 長軸由後內側（高頻）指向前外側（低頻）
    const m = addMesh(s, SYS.aud.root, g, 0xffffff, 'a1', { group: 'central', side, layer: 'cortex', pos: p.clone().add(V(0, 0.6, 0)), mat: { vertexColors: true } });
    m.rotation.y = sg < 0 ? -0.6 : 0.6;
    CEN[side].a1 = m.position.clone();
    addMesh(s, SYS.aud.root, tube([CEN[side].mgb, CEN[side].mgb.clone().lerp(m.position, 0.45).add(V(0, 2.5, 0)), m.position], 0.7, 1.1, 30), 0x6fd3a5, 'radiation', { group: 'central', side, layer: 'path', opacity: 0.85 });
  }
  const wp = surfacePoint('stg_post', 'L', A(120, 1552, 52), V(-1, 0, 0)) || A(62, 1552, 52);
  const w = addMesh(s, SYS.aud.root, ellipsoid(1.6, 7, 9), 0xf59e0b, 'wernicke', { group: 'central', side: 'L', layer: 'cortex', pos: wp.clone().add(V(0.6, 0, 0)), opacity: 0.85 });
  // 橄欖耳蝸束：內側（交叉）與外側（同側）
  for (const [side, sg] of [['R', -1], ['L', 1]]) {
    const n = CEN[side], c = CEN[side === 'R' ? 'L' : 'R'];
    addMesh(s, SYS.aud.root, tube([n.mso.clone().add(V(-sg * 0.6, 0.6, 0)), A(sg * 2, 1509, 67), A(-sg * 4, 1508.5, 65.5), c.dcn.clone().add(V(sg * 0.5, -1.4, 2.2)), c.cn8m, c.cn8l], 0.13, 0.13, 60), 0x2ec4b6, 'olivocochlear', { group: 'central', side, layer: 'path' });
    addMesh(s, SYS.aud.root, tube([n.lso, n.lso.clone().add(V(sg * 2.5, -1, -3)), n.cn8m.clone().add(V(0, 0.6, 0)), n.cn8l.clone().add(V(0, 0.6, 0))], 0.1, 0.1, 50), 0x2ec4b6, 'olivocochlear', { group: 'central', side, layer: 'path' });
  }
}

// ─────────────────── 傳導動畫的脈衝 ───────────────────
const pulses = [];
const pulseGeo = new THREE.SphereGeometry(1, 12, 8);
const ROUTES = { R: [], L: [] };
function buildRoutes() {
  for (const [side, sg] of [['R', -1], ['L', 1]]) {
    const n = CEN[side], c = CEN[side === 'R' ? 'L' : 'R'];
    const ear = earPoints(side);
    const head = [...ear, n.cn8l, n.cn8m];
    ROUTES[side] = [
      { pts: [...head, n.avcn, n.mso, n.ll0, n.ll1, n.ll2, n.ic, n.mgb, n.a1], w: 1 },
      { pts: [...head, n.avcn, A(sg * 6, 1505.6, 82.6), A(0, 1505.9, 83.4), c.mntb, c.mso, c.ll0, c.ll1, c.ll2, c.ic, c.mgb, c.a1], w: 2 },
      { pts: [...head, n.dcn, A(sg * 6, 1509, 64.2), A(0, 1510.5, 64.6), c.ll1, c.ll2, c.ic, c.mgb, c.a1], w: 1 }
    ].map((r) => ({ ...r, curve: curveOf(r.pts) }));
  }
}
function earPoints(side) {
  const g = earGroups[side]; g.updateMatrixWorld(true);
  const toW = (p) => p.clone().applyMatrix4(g.matrixWorld).sub(SYS.aud.root.position);
  return [toW(V(-14, 4, -3)), toW(EAR.canalIn), toW(V(0, 0, 0)), toW(V(6.3, 1, -0.3)), toW(V(7.4, -0.9, 2.2))];
}
function spawnPulse(side, route) {
  const mat = new THREE.MeshBasicMaterial({ color: side === 'R' ? 0xff4d4d : 0x4d8dff, transparent: true, opacity: 0.95, depthTest: false });
  const m = new THREE.Mesh(pulseGeo, mat); m.renderOrder = 10; SYS.aud.root.add(m);
  pulses.push({ m, route, t: 0, speed: 0.11 + Math.random() * 0.03 });
}

// ─────────────────── 系統與視角 ───────────────────
const AUD_ABS = {
  head: () => A(0, 1515, 70), tm: () => EAR.tmAbs.clone().sub(SYS.aud.center), brainstem: () => A(0, 1518, 74)
};
const VIEWS = {
  aud: [
    { id: 'overview', label: '全覽', target: () => AUD_ABS.head(), dir: V(-0.62, 0.32, 0.72), dist: 260,
      rule: (u) => (u.group === 'section' ? 0 : u.key === 'temporal_bone' ? 0.5 : u.key === 'cerebellum' ? 0.6 : 1),
      labels: ['pinna', 'cochlea', 'cn8', 'ic', 'mgb', 'a1', 'temporal_bone', 'corpus_callosum'] },
    { id: 'peripheral', label: '周邊聽覺（右耳）', target: () => AUD_ABS.tm().add(V(4, 0, 2)), dir: V(-0.3, 0.5, 0.81), dist: 58,
      rule: (u) => (u.group === 'section' ? 0 : ['stg_post', 'stg_ant', 'corpus_callosum', 'thalamus', 'cerebellum', 'a1', 'wernicke', 'radiation', 'mgb', 'bic', 'sc'].includes(u.key) ? 0 : u.key === 'pinna' ? 0.25 : u.key === 'temporal_bone' ? 0.45 : u.group === 'central' || ['pons', 'medulla', 'ic'].includes(u.key) ? 0.5 : 1),
      labels: ['pinna', 'ear_canal', 'tm', 'malleus', 'incus', 'stapes', 'eustachian', 'cochlea', 'vestibule', 'scc', 'round_window', 'oval_window', 'cn8', 'facial_nerve', 'tensor_tympani', 'stapedius'], sideFilter: 'R' },
    { id: 'section', label: '耳蝸剖面（柯地氏器）', target: () => SEC_POS.clone().add(V(-0.4, 0.1, 0)), dir: V(0.16, 0.14, 1), dist: 17,
      rule: (u) => (u.group === 'section' ? 1 : 0),
      labels: ['scala_vestibuli', 'scala_media', 'scala_tympani', 'reissner', 'basilar', 'tectorial', 'ihc', 'ohc', 'stria', 'spiral_ligament', 'spiral_ganglion'] },
    { id: 'central', label: '中樞聽覺路徑', target: () => A(0, 1522, 74), dir: V(0.0, 0.3, 1), dist: 185,
      rule: (u) => (u.group === 'section' ? 0 : ['pinna', 'temporal_bone', 'cerebellum', 'facial_nerve', 'ear_canal', 'eustachian', 'tympanic_cavity'].includes(u.key) ? 0 : ['stg_ant', 'corpus_callosum'].includes(u.key) ? 0.5 : u.key === 'stg_post' ? 0.6 : u.group === 'ear' && u.key !== 'cochlea' && u.key !== 'cn8' ? 0.35 : 1),
      labels: ['cochlea', 'cn8', 'cn', 'soc', 'll', 'ic', 'mgb', 'radiation', 'a1', 'wernicke', 'corpus_callosum', 'pons', 'medulla'] },
    { id: 'brainstem', label: '腦幹特寫（背面）', target: () => A(0, 1516, 72), dir: V(0.1, 0.4, -1), dist: 105,
      rule: (u) => (u.group === 'section' ? 0 : ['pinna', 'temporal_bone', 'cerebellum', 'stg_ant', 'stg_post', 'corpus_callosum', 'wernicke', 'a1', 'radiation', 'facial_nerve'].includes(u.key) || u.group === 'ear' ? 0 : ['pons', 'medulla', 'thalamus'].includes(u.key) ? 0.45 : 1),
      labels: ['avcn', 'pvcn', 'dcn', 'mso', 'lso', 'mntb', 'trapezoid', 'das', 'll', 'nll', 'ic', 'bic', 'mgb', 'sc', 'olivocochlear', 'cn8'] }
  ],
  oral: [
    { id: 'overview', label: '全覽', targetKeys: ['thyroid_cart', 'mandible', 'hyoid', 'tongue'], dir: V(-0.75, 0.2, 0.62), dist: 400,
      rule: (u) => (['occipital', 'sphenoid', 'temporal_bone'].includes(u.key) ? 0.45 : 1),
      labels: ['mandible', 'maxilla', 'tongue', 'hyoid', 'thyroid_cart', 'cricoid_cart', 'epiglottis', 'trachea', 'spc', 'mpc', 'ipc', 'digastric', 'sternohyoid', 'cervical'] },
    { id: 'larynx', label: '喉部', targetKeys: ['thyroid_cart', 'cricoid_cart', 'arytenoid_cart'], dir: V(-0.62, 0.3, 0.72), dist: 150,
      rule: (u) => (['thyroid_cart', 'cricoid_cart', 'arytenoid_cart', 'corniculate_cart', 'cuneiform_cart', 'epiglottis', 'hyoid', 'vocal_lig', 'vocalis', 'thyroarytenoid', 'pca', 'lca', 'ia', 'aryepiglotticus', 'cricothyroid', 'cricothyroid_lig', 'thyrohyoid_mem', 'epiglottic_lig', 'trachea', 'rln'].includes(u.key) ? (u.key === 'thyroid_cart' ? 0.55 : u.key === 'thyrohyoid_mem' ? 0.5 : 1) : 0),
      labels: ['thyroid_cart', 'cricoid_cart', 'arytenoid_cart', 'corniculate_cart', 'cuneiform_cart', 'epiglottis', 'hyoid', 'vocal_lig', 'vocalis', 'thyroarytenoid', 'pca', 'lca', 'ia', 'aryepiglotticus', 'cricothyroid', 'trachea', 'rln', 'thyrohyoid_mem'] },
    { id: 'larynx_back', label: '喉部（後面）', targetKeys: ['cricoid_cart', 'arytenoid_cart'], dir: V(0.35, 0.3, -0.9), dist: 130,
      rule: (u) => (['thyroid_cart', 'cricoid_cart', 'arytenoid_cart', 'corniculate_cart', 'cuneiform_cart', 'epiglottis', 'hyoid', 'vocal_lig', 'vocalis', 'thyroarytenoid', 'pca', 'lca', 'ia', 'aryepiglotticus', 'cricothyroid', 'cricothyroid_lig', 'thyrohyoid_mem', 'epiglottic_lig', 'trachea', 'rln'].includes(u.key) ? 1 : 0),
      labels: ['pca', 'ia', 'aryepiglotticus', 'arytenoid_cart', 'corniculate_cart', 'cricoid_cart', 'epiglottis', 'thyroid_cart', 'rln'] },
    { id: 'pharynx', label: '咽部（後面）', targetKeys: ['spc', 'mpc', 'ipc'], dir: V(0.35, 0.2, -0.92), dist: 280,
      rule: (u) => (['cervical', 'disc', 'occipital'].includes(u.key) ? 0 : ['temporal_bone', 'sphenoid'].includes(u.key) ? 0.35 : 1),
      labels: ['spc', 'mpc', 'ipc', 'pharyngeal_raphe', 'stylopharyngeus', 'salpingopharyngeus', 'palatopharyngeus', 'lvp', 'tvp', 'uvulae', 'esophagus', 'vagus', 'hyoid', 'mandible'] },
    { id: 'velum', label: '軟腭・咽內面', targetKeys: ['lvp', 'tvp', 'uvulae'], dir: V(0.25, 0.25, -0.94), dist: 200,
      rule: (u) => (['lvp', 'tvp', 'uvulae', 'palatopharyngeus', 'salpingopharyngeus', 'stylopharyngeus', 'palatine', 'maxilla', 'vomer', 'sphenoid', 'tongue', 'epiglottis', 'hyoid', 'concha'].includes(u.key) ? (['maxilla', 'sphenoid'].includes(u.key) ? 0.5 : 1) : 0),
      labels: ['lvp', 'tvp', 'uvulae', 'palatopharyngeus', 'salpingopharyngeus', 'stylopharyngeus', 'palatine', 'vomer', 'tongue', 'epiglottis'] },
    { id: 'oral', label: '口腔・舌', targetKeys: ['tongue', 'genioglossus', 'molar'], dir: V(-0.9, 0.25, 0.35), dist: 230,
      rule: (u) => (['spc', 'mpc', 'ipc', 'pharyngeal_raphe', 'cervical', 'disc', 'occipital', 'sphenoid', 'temporal_bone', 'zygomatic', 'esophagus', 'vagus', 'stylopharyngeus', 'salpingopharyngeus'].includes(u.key) ? 0 : u.key === 'mandible' ? 0.4 : u.key === 'mylohyoid' ? 0.6 : 1),
      labels: ['tongue', 'genioglossus', 'hyoglossus', 'mylohyoid', 'geniohyoid', 'incisor', 'canine', 'premolar', 'molar', 'lip', 'maxilla', 'mandible', 'palatine', 'hypoglossal'] },
    { id: 'hyoid', label: '舌骨上下肌群', targetKeys: ['hyoid', 'mylohyoid', 'thyroid_cart'], dir: V(-0.5, -0.1, 0.86), dist: 260,
      rule: (u) => (['cervical', 'disc', 'occipital', 'sphenoid', 'temporal_bone', 'spc', 'mpc', 'pharyngeal_raphe', 'zygomatic'].includes(u.key) ? 0 : 1),
      labels: ['digastric', 'mylohyoid', 'geniohyoid', 'stylohyoid', 'sternohyoid', 'sternothyroid', 'thyrohyoid', 'omohyoid', 'hyoid', 'thyroid_cart', 'mandible'] }
  ]
};

// ─────────────────── 狀態 ───────────────────
const state = { sys: 'aud', view: 'overview', selKey: null, selMesh: null, focus: true, labels: true, play: false, layersOff: { aud: new Set(), oral: new Set() } };
const tween = { active: false };

function viewDef() { return VIEWS[state.sys].find((v) => v.id === state.view); }
function boxOfKeys(sys, keys, side) {
  const b = new THREE.Box3();
  for (const m of SYS[sys].meshes) if (keys.includes(m.userData.key) && (!side || m.userData.side === side || m.userData.side === 'M')) b.expandByObject(m);
  return b;
}
function flyTo(target, pos, ms = 850) {
  Object.assign(tween, { active: true, t0: performance.now(), ms, fromT: controls.target.clone(), toT: target.clone(), fromP: camera.position.clone(), toP: pos.clone() });
}
function frameView(instant) {
  const v = viewDef();
  let target, dist = v.dist;
  if (v.targetKeys) { const b = boxOfKeys(state.sys, v.targetKeys); target = b.getCenter(new THREE.Vector3()); }
  else target = v.target();
  const scale = stage.clientWidth < 640 ? 1.35 : 1;
  const pos = target.clone().add(v.dir.clone().normalize().multiplyScalar(dist * scale));
  if (instant) { controls.target.copy(target); camera.position.copy(pos); controls.update(); }
  else flyTo(target, pos);
}

// 依視角、圖層與聚焦狀態更新每個網格的顯示
function applyVisibility() {
  const v = viewDef();
  const sel = state.selKey ? selectionKeys(state.selKey) : null;
  for (const sys of ['aud', 'oral']) {
    SYS[sys].root.visible = sys === state.sys;
    if (sys !== state.sys) continue;
    for (const m of SYS[sys].meshes) {
      const u = m.userData;
      let f = v.rule(u);
      if (state.layersOff[sys].has(u.layer)) f = 0;
      if (sel && f > 0 && state.focus) f = sel.includes(u.key) ? Math.max(f, 1) : (u.shell ? Math.min(f, 0.25) * 0.6 : 0.16);
      setFade(m, f);
      const hl = sel && sel.includes(u.key);
      m.material.emissive.setHex(hl ? (u.vertexColors ? 0x333333 : u.baseColor.getHex()) : 0x000000);
      m.material.emissiveIntensity = hl ? 0.35 : 0;
    }
  }
  updateLabels();
}
function setFade(m, f) {
  m.visible = f > 0.001;
  const op = Math.min(1, m.userData.baseOpacity * (f > 1 ? 1 : f) + (f >= 1 && m.userData.baseOpacity < 1 && state.selKey && selectionKeys(state.selKey).includes(m.userData.key) ? 0.35 : 0));
  m.material.opacity = op;
  m.material.transparent = op < 0.999;
  m.material.depthWrite = op >= 0.6;
}
function selectionKeys(k) { return INFO[k] && INFO[k].members ? [k, ...INFO[k].members] : [k]; }

// ─────────────────── 標籤 ───────────────────
const labelMap = new Map(); // sys:key → CSS2DObject
function labelText(k) { const i = INFO[k]; return i ? i.zh.replace(/（.*?）/g, '') : k; }
function makeLabels(sys) {
  const keys = new Set(VIEWS[sys].flatMap((v) => v.labels || []));
  for (const k of keys) {
    const el = document.createElement('button');
    el.className = 'lbl'; el.type = 'button'; el.textContent = labelText(k);
    el.addEventListener('pointerdown', (e) => e.stopPropagation());
    el.addEventListener('click', (e) => { e.stopPropagation(); select(k, null, true); });
    const obj = new CSS2DObject(el); obj.userData = { key: k, sys };
    obj.center.set(0.5, 1.15);
    scene.add(obj);
    labelMap.set(sys + ':' + k, obj);
  }
}
function updateLabels() {
  const v = viewDef();
  const want = new Set(state.labels ? (v.labels || []) : []);
  if (state.selKey) want.add(state.selKey);
  for (const [id, obj] of labelMap) {
    const [sys, k] = id.split(':');
    let show = sys === state.sys && want.has(k);
    if (show) {
      const side = v.sideFilter || (state.selMesh && state.selKey === k ? state.selMesh.userData.side : null);
      const ms = SYS[sys].meshes.filter((m) => selectionKeys(k).includes(m.userData.key) && m.visible && (m.material.opacity >= m.userData.baseOpacity * 0.9 || k === state.selKey) && (!side || m.userData.side === side || m.userData.side === 'M'));
      const pool = ms.length ? ms : SYS[sys].meshes.filter((m) => selectionKeys(k).includes(m.userData.key) && m.visible && (m.material.opacity >= m.userData.baseOpacity * 0.9 || k === state.selKey));
      if (!pool.length) show = false;
      else {
        // 標在偏右（受試者右側）且偏上的位置，雙側構造只標一邊
        const pick = pool.filter((m) => m.userData.side !== 'L');
        const use = (pick.length ? pick : pool);
        const b = new THREE.Box3(); use.forEach((m) => b.expandByObject(m));
        const c = b.getCenter(new THREE.Vector3()); c.y = c.y + (b.max.y - c.y) * 0.6;
        obj.position.copy(c);
      }
    }
    obj.visible = show;
    obj.element.classList.toggle('sel', k === state.selKey);
  }
}

// ─────────────────── 選取與面板 ───────────────────
const panel = $('#info');
function select(k, mesh, fromList) {
  if (!INFO[k]) return;
  const sysOf = INFO[k].sys === 'oral' ? 'oral' : 'aud';
  if (sysOf !== state.sys) { switchSystem(sysOf, null, true); }
  // 若此構造在目前視角看不到，切換到有它的視角
  const v = viewDef();
  const keys = selectionKeys(k);
  const visibleHere = SYS[state.sys].meshes.some((m) => keys.includes(m.userData.key) && v.rule(m.userData) > 0);
  if (!visibleHere) {
    const nv = VIEWS[state.sys].find((vv) => SYS[state.sys].meshes.some((m) => keys.includes(m.userData.key) && vv.rule(m.userData) > 0));
    if (nv) setView(nv.id, true);
  }
  state.selKey = k; state.selMesh = mesh || null;
  applyVisibility();
  // 放大到該構造（點到哪一側就放大哪一側）
  const vv = viewDef();
  let side = mesh ? mesh.userData.side : (vv.sideFilter || null);
  let b = new THREE.Box3();
  for (const m of SYS[state.sys].meshes) {
    if (!keys.includes(m.userData.key) || !m.visible) continue;
    if (side && side !== 'M' && m.userData.side !== side && m.userData.side !== 'M') continue;
    b.expandByObject(m);
  }
  if (b.isEmpty()) { side = null; for (const m of SYS[state.sys].meshes) if (keys.includes(m.userData.key)) b.expandByObject(m); }
  if (!b.isEmpty()) {
    const sph = b.getBoundingSphere(new THREE.Sphere());
    const fov = camera.fov * Math.PI / 180;
    const d = Math.max(sph.radius / Math.sin(fov / 2) * 1.9, 3);
    const dir = camera.position.clone().sub(controls.target).normalize();
    flyTo(sph.center, sph.center.clone().add(dir.multiplyScalar(d)));
  }
  renderPanel(k);
  writeHash();
  if (window.matchMedia('(max-width: 860px)').matches) document.body.classList.add('sheet-open');
}
function clearSelection() {
  state.selKey = null; state.selMesh = null; applyVisibility(); renderPanel(null); writeHash();
}
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function renderPanel(k) {
  if (!k) {
    panel.innerHTML = `<div class="empty"><i class="fa-solid fa-hand-pointer"></i><h2>點選任一構造</h2>
      <p>在模型上點一下，畫面會放大到該構造，這裡會顯示它的功能與重點。</p>
      <ul><li>拖曳：旋轉　滾輪／雙指：縮放　右鍵或雙指拖曳：平移</li><li>上方切換系統與視角，右上「構造目錄」可直接搜尋</li></ul><p class="src">3D 形狀資料：BodyParts3D © DBCLS（CC BY-SA 2.1 JP）；聽小骨、耳蝸、柯地氏器與腦幹聽覺核為示意模型。</p></div>`;
    return;
  }
  const i = INFO[k];
  const idx = PATHWAY.indexOf(k);
  const nav = idx >= 0 ? `<div class="path-nav">
      <button ${idx === 0 ? 'disabled' : ''} data-go="${PATHWAY[idx - 1] || ''}"><i class="fa-solid fa-arrow-left"></i> 上一站${idx > 0 ? '：' + esc(labelText(PATHWAY[idx - 1])) : ''}</button>
      <button ${idx === PATHWAY.length - 1 ? 'disabled' : ''} data-go="${PATHWAY[idx + 1] || ''}">下一站${idx < PATHWAY.length - 1 ? '：' + esc(labelText(PATHWAY[idx + 1])) : ''} <i class="fa-solid fa-arrow-right"></i></button></div>` : '';
  const members = i.members ? `<div class="chips">${i.members.map((m) => `<button data-go="${m}">${esc(labelText(m))}</button>`).join('')}</div>` : '';
  const parent = Object.keys(INFO).find((p) => INFO[p].members && INFO[p].members.includes(k));
  const up = parent ? `<div class="chips"><button data-go="${parent}"><i class="fa-solid fa-turn-up"></i> ${esc(INFO[parent].zh)}</button></div>` : '';
  const proc = !SYS[state.sys].meshes.some((m) => selectionKeys(k).includes(m.userData.key) && m.userData.group === 'bp');
  panel.innerHTML = `
    <div class="head"><span class="cat">${esc(i.cat)}</span>
      <button class="icon-btn close" id="closeSel" title="取消選取"><i class="fa-solid fa-xmark"></i></button></div>
    <h2>${esc(i.zh)}</h2><div class="en">${esc(i.en)}</div>
    ${members}${up}
    <h3>功能</h3><p>${esc(i.func)}</p>
    ${i.points && i.points.length ? `<h3>重點</h3><ul>${i.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
    ${i.clinical ? `<h3>臨床關聯</h3><p>${esc(i.clinical)}</p>` : ''}
    ${i.abr ? `<p class="abr"><i class="fa-solid fa-wave-square"></i> ${esc(i.abr)}</p>` : ''}
    ${i.tools ? `<div class="tools">${i.tools.map((t) => `<a href="${t[1]}"><i class="fa-solid fa-up-right-from-square"></i> ${esc(t[0])}</a>`).join('')}</div>` : ''}
    ${nav}
    <p class="src">${proc ? '此構造為依解剖位置建立的示意模型，比例經調整。' : '模型形狀來自 BodyParts3D（© DBCLS，CC BY-SA 2.1 JP）。'}</p>`;
  panel.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => b.dataset.go && select(b.dataset.go, null, true)));
  $('#closeSel').addEventListener('click', clearSelection);
  panel.scrollTop = 0;
}

// ─────────────────── 目錄 ───────────────────
function renderIndex() {
  const q = $('#search').value.trim().toLowerCase();
  const present = new Set(SYS[state.sys].meshes.map((m) => m.userData.key));
  const keys = Object.keys(INFO).filter((k) => (INFO[k].sys === 'oral') === (state.sys === 'oral') && (present.has(k) || (INFO[k].members && INFO[k].members.some((m) => present.has(m)))));
  const groups = new Map();
  for (const k of keys) {
    const i = INFO[k];
    if (q && !(i.zh + i.en + i.cat).toLowerCase().includes(q)) continue;
    const g = i.cat.split('・')[0];
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(k);
  }
  $('#index-list').innerHTML = [...groups].map(([g, ks]) => `<div class="grp"><div class="grp-t">${esc(g)}</div>${ks.map((k) => `<button data-k="${k}" class="${k === state.selKey ? 'on' : ''}">${esc(INFO[k].zh)}<small>${esc(INFO[k].en)}</small></button>`).join('')}</div>`).join('') || '<p class="none">找不到符合的構造</p>';
  $('#index-list').querySelectorAll('button[data-k]').forEach((b) => b.addEventListener('click', () => { select(b.dataset.k, null, true); document.body.classList.remove('index-open'); }));
}

// ─────────────────── 切換 ───────────────────
function setView(id, keepSel) {
  state.view = id;
  if (!keepSel) { state.selKey = null; state.selMesh = null; renderPanel(null); }
  document.querySelectorAll('#views button').forEach((b) => b.classList.toggle('on', b.dataset.v === id));
  $('#playWrap').hidden = state.sys !== 'aud';
  $('#earWrap').hidden = !(state.sys === 'aud' && (id === 'central' || id === 'overview' || id === 'brainstem'));
  applyVisibility();
  frameView(false);
  writeHash();
}
async function switchSystem(sys, view, keepSel) {
  state.sys = sys;
  document.querySelectorAll('#systems button').forEach((b) => b.classList.toggle('on', b.dataset.s === sys));
  $('#views').innerHTML = VIEWS[sys].map((v) => `<button data-v="${v.id}">${v.label}</button>`).join('');
  $('#views').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => setView(b.dataset.v)));
  $('#layers').innerHTML = LAYERS[sys].map(([id, l]) => `<label><input type="checkbox" data-l="${id}" ${state.layersOff[sys].has(id) ? '' : 'checked'}> ${l}</label>`).join('');
  $('#layers').querySelectorAll('input').forEach((c) => c.addEventListener('change', () => { c.checked ? state.layersOff[sys].delete(c.dataset.l) : state.layersOff[sys].add(c.dataset.l); applyVisibility(); }));
  if (!SYS[sys].loaded) await loadSystem(sys);
  state.view = view || 'overview';
  if (!keepSel) { state.selKey = null; state.selMesh = null; renderPanel(null); }
  setView(state.view, keepSel);
  frameView(true);
  renderIndex();
}

// ─────────────────── 載入 ───────────────────
const earGroups = {};
async function loadSystem(sys) {
  const ld = $('#loading'); ld.hidden = false;
  try {
    if (sys === 'aud') {
      const bp = new THREE.Group(); SYS.aud.root.add(bp);
      SYS.aud.center = await loadBin('aud', 'auditory.bin', bp);
      earGroups.R = buildEar(-1); earGroups.L = buildEar(1);
      buildSection();
      buildCentral();
      SYS.aud.root.updateMatrixWorld(true);
      buildCortex();
      buildRoutes();
    } else {
      const bp = new THREE.Group(); SYS.oral.root.add(bp);
      SYS.oral.center = await loadBin('oral', 'oral.bin', bp);
    }
    SYS[sys].loaded = true;
    makeLabels(sys);
  } catch (e) {
    ld.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> 模型載入失敗，請重新整理頁面';
    throw e;
  }
  ld.hidden = true;
}

// ─────────────────── 點選 ───────────────────
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let downAt = null;
function pick(ev) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const cands = SYS[state.sys].meshes.filter((m) => m.visible && m.material.opacity > 0.05);
  const hits = ray.intersectObjects(cands, false);
  if (!hits.length) return null;
  // 優先選實體構造；透明外殼（顳骨、腦幹、液體腔）只在沒有其他東西時才選
  const solid = hits.find((h) => !h.object.userData.shell && h.object.material.opacity > 0.3);
  return (solid || hits[0]).object;
}
renderer.domElement.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
  const m = pick(e);
  if (m) select(m.userData.key, m);
});
const tip = $('#tip');
let hoverRaf = 0;
renderer.domElement.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || e.buttons) { tip.hidden = true; return; }
  cancelAnimationFrame(hoverRaf);
  hoverRaf = requestAnimationFrame(() => {
    const m = pick(e);
    renderer.domElement.style.cursor = m ? 'pointer' : 'grab';
    if (m && INFO[m.userData.key]) {
      const r = stage.getBoundingClientRect();
      tip.hidden = false; tip.textContent = INFO[m.userData.key].zh + (m.userData.side === 'L' ? '（左）' : m.userData.side === 'R' ? '（右）' : '');
      tip.style.left = (e.clientX - r.left + 14) + 'px'; tip.style.top = (e.clientY - r.top + 12) + 'px';
    } else tip.hidden = true;
  });
});
renderer.domElement.addEventListener('pointerleave', () => { tip.hidden = true; });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') clearSelection(); });

// ─────────────────── 控制列 ───────────────────
document.querySelectorAll('#systems button').forEach((b) => b.addEventListener('click', () => switchSystem(b.dataset.s)));
$('#resetBtn').addEventListener('click', () => { clearSelection(); frameView(false); });
$('#labelBtn').addEventListener('click', () => { state.labels = !state.labels; $('#labelBtn').classList.toggle('on', state.labels); updateLabels(); });
$('#focusBtn').addEventListener('click', () => { state.focus = !state.focus; $('#focusBtn').classList.toggle('on', state.focus); applyVisibility(); });
$('#playBtn').addEventListener('click', () => {
  state.play = !state.play; $('#playBtn').classList.toggle('on', state.play);
  $('#playBtn').innerHTML = state.play ? '<i class="fa-solid fa-pause"></i> 暫停傳導' : '<i class="fa-solid fa-play"></i> 聲音傳導動畫';
});
document.querySelectorAll('#earWrap button').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('#earWrap button').forEach((x) => x.classList.toggle('on', x === b)); state.ear = b.dataset.ear;
}));
state.ear = 'R';
$('#search').addEventListener('input', renderIndex);
$('#indexBtn').addEventListener('click', () => document.body.classList.toggle('index-open'));
$('#indexClose').addEventListener('click', () => document.body.classList.remove('index-open'));
$('#sheetBtn').addEventListener('click', () => document.body.classList.toggle('sheet-open'));
$('#layerBtn').addEventListener('click', () => {
  const mobile = matchMedia('(max-width: 860px)').matches;
  document.body.classList.toggle(mobile ? 'layers-shown' : 'layers-hidden');
});

// 深淺色
(function theme() {
  const root = document.documentElement;
  try { const t = localStorage.getItem('anatomyTheme'); if (t) root.setAttribute('data-theme', t); } catch (e) { }
  $('#themeBtn').addEventListener('click', () => {
    const dark = root.getAttribute('data-theme') ? root.getAttribute('data-theme') === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark'; root.setAttribute('data-theme', next);
    try { localStorage.setItem('anatomyTheme', next); } catch (e) { }
  });
})();

// 網址 #aud/central/ic 可直接開到指定構造
function writeHash() {
  const h = '#' + [state.sys, state.view, state.selKey].filter(Boolean).join('/');
  if (location.hash !== h) history.replaceState(null, '', h);
}

// ─────────────────── 動畫迴圈 ───────────────────
const clock = new THREE.Clock();
let spawnAcc = 0;
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  if (tween.active) {
    const k = Math.min(1, (performance.now() - tween.t0) / tween.ms), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    controls.target.lerpVectors(tween.fromT, tween.toT, e); camera.position.lerpVectors(tween.fromP, tween.toP, e);
    if (k >= 1) tween.active = false;
  }
  controls.update();
  lightRig.quaternion.copy(camera.quaternion);
  // 選取構造的呼吸光
  if (state.selKey) {
    const keys = selectionKeys(state.selKey), a = 0.22 + 0.18 * (0.5 + 0.5 * Math.sin(t * 3.2));
    for (const m of SYS[state.sys].meshes) if (keys.includes(m.userData.key)) m.material.emissiveIntensity = a;
  }
  // 傳導動畫
  const playing = state.play && state.sys === 'aud';
  const w = playing ? Math.sin(t * 9) : 0;
  anim.ossicles.forEach((p) => { p.rotation.z = 0.05 * w; });
  anim.tm.forEach((m) => { m.scale.set(1 + 0.25 * w, 1, 1); });
  if (anim.corti) { anim.corti.rotation.z = 0.045 * w; anim.tect.rotation.z = 0.02 * w; }
  if (playing && state.view !== 'section' && state.view !== 'peripheral') {
    spawnAcc += dt;
    if (spawnAcc > 0.42) {
      spawnAcc = 0;
      const sides = state.ear === 'B' ? ['R', 'L'] : [state.ear];
      for (const sd of sides) { const rs = ROUTES[sd]; const tot = rs.reduce((a, r) => a + r.w, 0); let x = Math.random() * tot; for (const r of rs) { x -= r.w; if (x <= 0) { spawnPulse(sd, r); break; } } }
    }
  } else if (playing && state.view === 'peripheral') {
    spawnAcc += dt;
    if (spawnAcc > 0.5) { spawnAcc = 0; spawnPulse('R', ROUTES.R[0]); }
  }
  for (let i = pulses.length - 1; i >= 0; i--) {
    const p = pulses[i];
    const limit = state.view === 'peripheral' ? 0.32 : 1;
    p.t += dt * p.speed * (state.view === 'peripheral' ? 0.35 : 1);
    if (p.t >= limit || !playing) { SYS.aud.root.remove(p.m); p.m.material.dispose(); pulses.splice(i, 1); continue; }
    p.route.curve.getPointAt(p.t, p.m.position);
    const sc = state.view === 'peripheral' ? 0.7 : 1.3;
    p.m.scale.setScalar(sc);
  }
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  requestAnimationFrame(tick);
}

// ─────────────────── 啟動 ───────────────────
(async function init() {
  resize();
  renderPanel(null);
  const [hs, hv, hk] = location.hash.replace('#', '').split('/');
  const sys = hs === 'oral' ? 'oral' : 'aud';
  await switchSystem(sys, VIEWS[sys].some((v) => v.id === hv) ? hv : 'overview');
  requestAnimationFrame(tick);
  if (hk && INFO[hk]) select(hk, null, true);
})();
