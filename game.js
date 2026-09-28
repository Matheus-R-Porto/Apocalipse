// ============================================================
//  APOCALIPSE — Passo 9: mapa real com biomas (200×140)
// ============================================================

"use strict";

// ------------------------------------------------------------
//  EventBus
// ------------------------------------------------------------
class EventBus {
  constructor() { this.listeners = new Map(); }
  on(t, fn) { if (!this.listeners.has(t)) this.listeners.set(t, new Set()); this.listeners.get(t).add(fn); return () => this.off(t, fn); }
  off(t, fn) { const s = this.listeners.get(t); if (s) s.delete(fn); }
  emit(t, p) { const s = this.listeners.get(t); if (s) for (const fn of s) fn(p); }
}

// ------------------------------------------------------------
//  Tile types
// ------------------------------------------------------------
const T = 32; // TILE_SIZE
const FLOOR = 0, WALL = 1, GRASS = 2, WATER = 3, SAND = 4, TREE = 5, ROAD = 6, BARRICADE = 7;

function isSolid(c, r) {
  const t = tileAt(c, r);
  return t === WALL || t === TREE || t === WATER || t === BARRICADE;
}
function isOpaque(c, r) {
  const t = tileAt(c, r);
  return t === WALL || t === TREE || t === BARRICADE;
}

const TILE_COL = {
  [FLOOR]: "#1a1b22", [WALL]: "#3a3d4a", [GRASS]: "#1a2a18",
  [WATER]: "#0a2a44", [SAND]: "#2a2820", [TREE]: "#1a3a1a", [ROAD]: "#22231e",
  [BARRICADE]: "#4a3520",
};
const TILE_STROKE = {
  [FLOOR]: "rgba(255,255,255,0.03)", [WALL]: "#22242e", [GRASS]: "rgba(80,120,60,0.08)",
  [WATER]: "rgba(40,80,140,0.12)", [SAND]: "rgba(160,140,80,0.06)", [TREE]: "rgba(30,80,30,0.15)", [ROAD]: "rgba(255,255,255,0.02)",
  [BARRICADE]: "rgba(120,80,40,0.2)",
};

// ------------------------------------------------------------
//  Map generation from biome grid (20×14 → 200×140)
// ------------------------------------------------------------
const BCELL = 10; // tiles per biome cell
// prettier-ignore
const BIOME_GRID = [
  "CCffRRYYffFFFFCCFFBB",
  "CCffRRYYffFFFFCCFFBB",
  "FFFFFFffffffCCCCffff",
  "fFFFffRRffffRRRRfFFF",
  "RRYYffffRRffRRYYRRRR",
  "BBBBrrBBrrBBBBrrBBBB",
  "WWWWrrWWrrWWWWrrWWWW",
  "WWWWrrWWrrWWWWrrWWWW",
  "BBBBrrBBrrBBBBrrBBBB",
  "CCCCCCffRRYYFFffRRff",
  "CCCCCCffRRYYFFffRRCC",
  "CCCCCCRRffFFffRRYYCC",
  "ffRRRRffFFffRRYYffCC",
  "ffRRRRffFFffRRYYffff",
];
const BG_ROWS = BIOME_GRID.length, BG_COLS = BIOME_GRID[0].length;
const MAP_COLS = BG_COLS * BCELL, MAP_ROWS = BG_ROWS * BCELL;

function biomeBase(ch) {
  switch (ch) {
    case "C": return FLOOR;
    case "f": return GRASS;
    case "F": return GRASS;
    case "R": case "Y": return GRASS;
    case "W": return WATER;
    case "B": return SAND;
    case "r": return ROAD;
    default: return GRASS;
  }
}

function seededRand(seed) {
  let s = seed | 0;
  return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
}

function generateMap() {
  const m = [];
  for (let r = 0; r < MAP_ROWS; r++) { m[r] = []; for (let c = 0; c < MAP_COLS; c++) m[r][c] = GRASS; }

  // Fill base tiles from biome grid
  for (let br = 0; br < BG_ROWS; br++) for (let bc = 0; bc < BG_COLS; bc++) {
    const ch = BIOME_GRID[br][bc];
    const base = biomeBase(ch);
    const tr = br * BCELL, tc = bc * BCELL;
    for (let r = tr; r < tr + BCELL; r++) for (let c = tc; c < tc + BCELL; c++) m[r][c] = base;
  }

  // Outer border
  for (let r = 0; r < MAP_ROWS; r++) { m[r][0] = WALL; m[r][MAP_COLS - 1] = WALL; }
  for (let c = 0; c < MAP_COLS; c++) { m[0][c] = WALL; m[MAP_ROWS - 1][c] = WALL; }

  const rng = seededRand(42);

  // Generate structures per biome
  for (let br = 0; br < BG_ROWS; br++) for (let bc = 0; bc < BG_COLS; bc++) {
    const ch = BIOME_GRID[br][bc];
    const tr = br * BCELL + 1, tc = bc * BCELL + 1;
    const area = BCELL - 2;

    if (ch === "C") {
      // City: 1-2 buildings per cell
      const n = 1 + Math.floor(rng() * 2);
      for (let i = 0; i < n; i++) {
        const bw = 3 + Math.floor(rng() * 4);
        const bh = 3 + Math.floor(rng() * 3);
        const bx = tc + Math.floor(rng() * (area - bw));
        const by = tr + Math.floor(rng() * (area - bh));
        addBuilding(m, bx, by, bw, bh, rng);
      }
    } else if (ch === "F") {
      // Dense forest: 25-35% trees
      for (let r = tr; r < tr + area; r++) for (let c = tc; c < tc + area; c++) {
        if (rng() < 0.30) m[r][c] = TREE;
      }
    } else if (ch === "f") {
      // Light forest: 10-18% trees
      for (let r = tr; r < tr + area; r++) for (let c = tc; c < tc + area; c++) {
        if (rng() < 0.14) m[r][c] = TREE;
      }
    } else if (ch === "R" || ch === "Y") {
      // Rural: occasional small building
      if (rng() < 0.35) {
        const bw = 3 + Math.floor(rng() * 2);
        const bh = 3 + Math.floor(rng() * 2);
        const bx = tc + Math.floor(rng() * (area - bw));
        const by = tr + Math.floor(rng() * (area - bh));
        addBuilding(m, bx, by, bw, bh, rng);
      }
      // Scattered trees
      for (let r = tr; r < tr + area; r++) for (let c = tc; c < tc + area; c++) {
        if (rng() < 0.04) m[r][c] = TREE;
      }
    }
  }

  // Roads connecting biome road cells (bridges over water)
  // Already filled as ROAD base; ensure 2-wide path
  for (let br = 0; br < BG_ROWS; br++) for (let bc = 0; bc < BG_COLS; bc++) {
    if (BIOME_GRID[br][bc] === "r") {
      const tr = br * BCELL, tc = bc * BCELL;
      for (let r = tr; r < tr + BCELL; r++) {
        const mid = tc + Math.floor(BCELL / 2);
        m[r][mid] = ROAD; m[r][mid + 1] = ROAD;
        m[r][mid - 1] = ROAD; m[r][mid + 2] = ROAD;
      }
    }
  }

  // Beach edges along water (smooth transition)
  for (let r = 1; r < MAP_ROWS - 1; r++) for (let c = 1; c < MAP_COLS - 1; c++) {
    if (m[r][c] === SAND) {
      // Clear any trees/walls from sand
      // Already sand from biome
    }
  }

  return m;
}

function addBuilding(m, cx, cy, w, h, rng) {
  for (let r = cy; r < cy + h && r < MAP_ROWS - 1; r++) {
    for (let c = cx; c < cx + w && c < MAP_COLS - 1; c++) {
      if (r === cy || r === cy + h - 1 || c === cx || c === cx + w - 1) m[r][c] = WALL;
      else m[r][c] = FLOOR;
    }
  }
  // Door
  const side = Math.floor(rng() * 4);
  const dc = cx + Math.floor(w / 2), dr = cy + Math.floor(h / 2);
  if (side === 0 && cy > 0) m[cy][dc] = FLOOR;
  else if (side === 1) m[cy + h - 1][dc] = FLOOR;
  else if (side === 2 && cx > 0) m[dr][cx] = FLOOR;
  else m[dr][cx + w - 1] = FLOOR;
}

const MAP = generateMap();

function tileAt(c, r) {
  if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) return WALL;
  return MAP[r][c];
}

// ------------------------------------------------------------
//  Items & recipes (unchanged)
// ------------------------------------------------------------
const ITEM_INFO = {
  bread:   { label: "Pão",        color: "#ddc070", letter: "P" },
  cloth:   { label: "Pano",       color: "#8899aa", letter: "C" },
  scrap:   { label: "Sucata",     color: "#99887a", letter: "S" },
  bandage: { label: "Bandagem",   color: "#dddddd", letter: "B" },
  hatchet: { label: "Machadinha", color: "#b08050", letter: "M", tool: true, damage: 35, treeHits: 3 },
  wood:    { label: "Madeira",    color: "#8a6a3a", letter: "W" },
};
const RECIPES = [
  { inputs: { cloth: 2 }, output: { type: "bandage", count: 1 } },
  { inputs: { wood: 2 }, output: { type: "barricade", count: 1 } },
];
// Barricade is placed on map, not kept in inventory
ITEM_INFO.barricade = { label: "Barricada", color: "#4a3520", letter: "X", placeable: true };

function checkCraftResult(slots) {
  const counts = {};
  for (const s of slots) { if (!s) continue; counts[s.type] = (counts[s.type] || 0) + s.count; }
  for (const r of RECIPES) {
    let ok = true;
    for (const [t, n] of Object.entries(r.inputs)) { if ((counts[t] || 0) < n) { ok = false; break; } }
    if (!ok) continue;
    for (const t of Object.keys(counts)) { if (!r.inputs[t]) { ok = false; break; } }
    if (ok) return { type: r.output.type, count: r.output.count, _recipe: r };
  }
  return null;
}

function addToInventory(state, item) {
  const inv = state.inventory;
  for (const s of inv.hotbar) { if (s && s.type === item.type) { s.count += item.count; return true; } }
  for (let i = 0; i < inv.hotbar.length; i++) { if (!inv.hotbar[i]) { inv.hotbar[i] = { ...item }; return true; } }
  for (const s of inv.grid) { if (s && s.type === item.type) { s.count += item.count; return true; } }
  for (let i = 0; i < inv.grid.length; i++) { if (!inv.grid[i]) { inv.grid[i] = { ...item }; return true; } }
  return false;
}
function closeInventory(state) {
  const inv = state.inventory; inv.open = false;
  if (inv.held) { addToInventory(state, inv.held); inv.held = null; }
  for (let i = 0; i < inv.craft.length; i++) { if (inv.craft[i]) { addToInventory(state, inv.craft[i]); inv.craft[i] = null; } }
  inv.craftResult = null;
}
function rollZombieLoot() {
  const items = []; const r = Math.random();
  if (r < 0.6) items.push({ type: "cloth", count: 1 + Math.floor(Math.random() * 2) });
  else if (r < 0.85) items.push({ type: "scrap", count: 1 });
  else items.push({ type: "bread", count: 1 });
  if (Math.random() < 0.3) items.push({ type: "cloth", count: 1 });
  return items;
}

// ------------------------------------------------------------
//  Zombie factory + spawn by biome
// ------------------------------------------------------------
let _zombieId = 0;
function createZombie(x, y) {
  return {
    id: _zombieId++, x, y, size: 18, speed: 65, sightRange: 120,
    hp: 100, dead: false, state: "idle", targetX: 0, targetY: 0,
    dir: Math.random() * Math.PI * 2, wanderTimer: Math.random() * 3,
    alertTimer: 0, lostSightTimer: 0, biteCooldown: 0,
  };
}

function spawnZombies() {
  const zs = [];
  const rng = seededRand(77);
  for (let br = 0; br < BG_ROWS; br++) for (let bc = 0; bc < BG_COLS; bc++) {
    const ch = BIOME_GRID[br][bc];
    let chance = 0;
    if (ch === "C") chance = 0.6;
    else if (ch === "F") chance = 0.25;
    else if (ch === "f") chance = 0.15;
    else if (ch === "R" || ch === "Y") chance = 0.12;
    else continue;

    if (rng() > chance) continue;
    const count = ch === "C" ? 1 + Math.floor(rng() * 2) : 1;
    for (let i = 0; i < count; i++) {
      const tc = bc * BCELL, tr = br * BCELL;
      for (let attempt = 0; attempt < 20; attempt++) {
        const c = tc + 1 + Math.floor(rng() * (BCELL - 2));
        const r = tr + 1 + Math.floor(rng() * (BCELL - 2));
        if (!isSolid(c, r)) {
          zs.push(createZombie(c * T + T / 2, r * T + T / 2));
          break;
        }
      }
    }
  }
  return zs;
}

// Player start: find open spot near top-center
function findPlayerStart() {
  const startCol = 12, startRow = 10;
  for (let r = startRow; r < startRow + 20; r++) for (let c = startCol; c < startCol + 20; c++) {
    if (!isSolid(c, r)) return { x: c * T + T / 2, y: r * T + T / 2 };
  }
  return { x: 400, y: 320 };
}

// ------------------------------------------------------------
//  GameState
// ------------------------------------------------------------
function createState(canvas) {
  const vw = canvas.width, vh = canvas.height;
  const ps = findPlayerStart();
  return {
    time: { now: 0, frame: 0, fps: 0 },
    input: { keys: new Set() },
    input2: { attackRequested: false, useRequested: false, toggleInventory: false },
    camera: { x: 0, y: 0, viewW: vw, viewH: vh },
    world: { width: MAP_COLS * T, height: MAP_ROWS * T, cols: MAP_COLS, rows: MAP_ROWS, tileSize: T },
    player: {
      x: ps.x, y: ps.y, size: 20, speed: 170, sneakSpeed: 55, sneaking: false,
      hp: 100, maxHp: 100, hunger: 100, maxHunger: 100,
      infected: false, attackCooldown: 0, attackTimer: 0,
    },
    inventory: {
      open: false, selected: 0,
      hotbar: [{ type: "hatchet", count: 1 }, { type: "bread", count: 5 }, { type: "cloth", count: 2 }, null, null],
      grid: new Array(20).fill(null), craft: [null, null, null, null], craftResult: null, held: null,
    },
    dayNight: { time: 0, cycle: 960, brightness: 1, fogAlpha: 0.50, ambientRange: 85, noiseMulti: 1, zombieSpeed: 1, zombieSight: 1 },
    groundItems: [],
    zombies: spawnZombies(),
    vision: { mouseX: 0, mouseY: 0, angle: 0, coneWidth: Math.PI / 2, coneRange: 320, ambientRange: 64, conePoly: [], ambientPoly: [] },
  };
}

// ------------------------------------------------------------
//  Inventory UI layout (screen-space, unchanged)
// ------------------------------------------------------------
const SL = 34, SG = 3;
const INV_PX = 110, INV_PY = 40, INV_PW = 580, INV_PH = 400;
const INV_GX = INV_PX + 20, INV_GY = INV_PY + 50, INV_COLS = 5, INV_ROWS = 4;
const CRA_GX = INV_PX + 330, CRA_GY = INV_PY + 70;
const CRA_OX = CRA_GX + 2 * (SL + SG) + 35, CRA_OY = CRA_GY + (SL + SG) / 2;
const HOT_IY = INV_PY + INV_PH - SL - 20;
const HOT_IX = INV_PX + (INV_PW - 5 * (SL + SG) + SG) / 2;

function getSlotAt(mx, my) {
  for (let r = 0; r < INV_ROWS; r++) for (let c = 0; c < INV_COLS; c++) {
    const sx = INV_GX + c * (SL + SG), sy = INV_GY + r * (SL + SG);
    if (mx >= sx && mx < sx + SL && my >= sy && my < sy + SL) return { area: "grid", index: r * INV_COLS + c };
  }
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
    const sx = CRA_GX + c * (SL + SG), sy = CRA_GY + r * (SL + SG);
    if (mx >= sx && mx < sx + SL && my >= sy && my < sy + SL) return { area: "craft", index: r * 2 + c };
  }
  if (mx >= CRA_OX && mx < CRA_OX + SL && my >= CRA_OY && my < CRA_OY + SL) return { area: "output", index: 0 };
  for (let i = 0; i < 5; i++) { const sx = HOT_IX + i * (SL + SG); if (mx >= sx && mx < sx + SL && my >= HOT_IY && my < HOT_IY + SL) return { area: "hotbar", index: i }; }
  return null;
}

function handleInventoryClick(state, mx, my) {
  const slot = getSlotAt(mx, my); if (!slot) return;
  const inv = state.inventory;
  if (slot.area === "output") {
    if (inv.craftResult && !inv.held) {
      const recipe = inv.craftResult._recipe;
      inv.held = { type: inv.craftResult.type, count: inv.craftResult.count };
      for (const [type, needed] of Object.entries(recipe.inputs)) {
        let rem = needed;
        for (let i = 0; i < inv.craft.length && rem > 0; i++) {
          if (inv.craft[i] && inv.craft[i].type === type) {
            const take = Math.min(inv.craft[i].count, rem);
            inv.craft[i].count -= take; rem -= take;
            if (inv.craft[i].count <= 0) inv.craft[i] = null;
          }
        }
      }
      inv.craftResult = checkCraftResult(inv.craft);
    }
    return;
  }
  const slots = slot.area === "grid" ? inv.grid : slot.area === "craft" ? inv.craft : inv.hotbar;
  const target = slots[slot.index];
  if (!inv.held && target) { inv.held = target; slots[slot.index] = null; }
  else if (inv.held && !target) { slots[slot.index] = inv.held; inv.held = null; }
  else if (inv.held && target) { if (inv.held.type === target.type) { target.count += inv.held.count; inv.held = null; } else { slots[slot.index] = inv.held; inv.held = target; } }
  if (slot.area === "craft") inv.craftResult = checkCraftResult(inv.craft);
}

function handleInventoryRightClick(state, mx, my) {
  const slot = getSlotAt(mx, my); if (!slot || slot.area === "output") return;
  const inv = state.inventory;
  const slots = slot.area === "grid" ? inv.grid : slot.area === "craft" ? inv.craft : inv.hotbar;
  const target = slots[slot.index];
  if (!inv.held && target && target.count > 1) { const half = Math.ceil(target.count / 2); inv.held = { type: target.type, count: half }; target.count -= half; }
  else if (inv.held && !target) { slots[slot.index] = { type: inv.held.type, count: 1 }; inv.held.count--; if (inv.held.count <= 0) inv.held = null; }
  else if (inv.held && target && inv.held.type === target.type) { target.count++; inv.held.count--; if (inv.held.count <= 0) inv.held = null; }
  if (slot.area === "craft") inv.craftResult = checkCraftResult(inv.craft);
}

// ------------------------------------------------------------
//  Input
// ------------------------------------------------------------
const MOVEMENT_KEYS = new Set(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"]);
function setupInput(state, canvas) {
  const norm = (e) => e.key.toLowerCase();
  window.addEventListener("keydown", (e) => {
    const k = norm(e); state.input.keys.add(k);
    if (MOVEMENT_KEYS.has(k)) e.preventDefault();
    if (k >= "1" && k <= "5") state.inventory.selected = parseInt(k) - 1;
    if (k === "e") state.input2.useRequested = true;
    if (k === "i" || (k === "escape" && state.inventory.open)) state.input2.toggleInventory = true;
    if (k === "g") state.dayNight.time = (state.dayNight.time + 120) % state.dayNight.cycle;
  });
  window.addEventListener("keyup", (e) => state.input.keys.delete(norm(e)));
  window.addEventListener("blur", () => state.input.keys.clear());
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    state.vision.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    state.vision.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
  });
  canvas.addEventListener("mousedown", (e) => {
    if (state.inventory.open) { if (e.button === 0) handleInventoryClick(state, state.vision.mouseX, state.vision.mouseY); if (e.button === 2) handleInventoryRightClick(state, state.vision.mouseX, state.vision.mouseY); }
    else if (e.button === 0) state.input2.attackRequested = true;
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
}

// ------------------------------------------------------------
//  Collision (uses isSolid)
// ------------------------------------------------------------
function collidesWithWall(cx, cy, hs) {
  const c0 = Math.floor((cx - hs) / T), c1 = Math.floor((cx + hs - 0.01) / T);
  const r0 = Math.floor((cy - hs) / T), r1 = Math.floor((cy + hs - 0.01) / T);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (isSolid(c, r)) return true;
  return false;
}

// ------------------------------------------------------------
//  Systems
// ------------------------------------------------------------
const ZOMBIE_ACTIVATION = 700; // pixels

const CameraSystem = { update(_dt, state) {
  const cam = state.camera, p = state.player;
  cam.x = Math.max(0, Math.min(state.world.width - cam.viewW, p.x - cam.viewW / 2));
  cam.y = Math.max(0, Math.min(state.world.height - cam.viewH, p.y - cam.viewH / 2));
}};

const MovementSystem = { update(dt, state, bus) {
  if (state.inventory.open || state.player.hp <= 0) return;
  const k = state.input.keys, p = state.player;
  p.sneaking = k.has("shift");
  let dx = 0, dy = 0;
  if (k.has("w") || k.has("arrowup")) dy -= 1; if (k.has("s") || k.has("arrowdown")) dy += 1;
  if (k.has("a") || k.has("arrowleft")) dx -= 1; if (k.has("d") || k.has("arrowright")) dx += 1;
  if (dx === 0 && dy === 0) return;
  const len = Math.hypot(dx, dy); dx /= len; dy /= len;
  const spd = p.sneaking ? p.sneakSpeed : p.speed, r = p.size / 2;
  const nx = p.x + dx * spd * dt; if (!collidesWithWall(nx, p.y, r)) p.x = nx;
  const ny = p.y + dy * spd * dt; if (!collidesWithWall(p.x, ny, r)) p.y = ny;
  bus.emit("player:moved", { x: p.x, y: p.y });
  if (!p.sneaking) bus.emit("player:noise", { x: p.x, y: p.y, radius: 200 });
}};

const DayNightSystem = { update(dt, state) {
  const dn = state.dayNight; dn.time = (dn.time + dt) % dn.cycle;
  const b = dn.brightness = 0.5 + 0.5 * Math.cos((dn.time / dn.cycle) * 2 * Math.PI);
  dn.fogAlpha = 0.50 + 0.38 * (1 - b); dn.ambientRange = 40 + 45 * b;
  dn.noiseMulti = 1 + 0.6 * (1 - b); dn.zombieSpeed = 0.7 + 0.3 * b; dn.zombieSight = 0.6 + 0.4 * b;
}};

// Vision — segments from OPAQUE tiles (walls+trees, NOT water)
function getOpaqueSegments(px, py, range) {
  const segs = [];
  const c0 = Math.max(0, Math.floor((px - range) / T) - 1), c1 = Math.min(MAP_COLS - 1, Math.ceil((px + range) / T) + 1);
  const r0 = Math.max(0, Math.floor((py - range) / T) - 1), r1 = Math.min(MAP_ROWS - 1, Math.ceil((py + range) / T) + 1);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    if (!isOpaque(c, r)) continue;
    const x0 = c * T, y0 = r * T, x1 = x0 + T, y1 = y0 + T;
    if (!isOpaque(c, r - 1)) segs.push({ ax: x0, ay: y0, bx: x1, by: y0 });
    if (!isOpaque(c, r + 1)) segs.push({ ax: x0, ay: y1, bx: x1, by: y1 });
    if (!isOpaque(c - 1, r)) segs.push({ ax: x0, ay: y0, bx: x0, by: y1 });
    if (!isOpaque(c + 1, r)) segs.push({ ax: x1, ay: y0, bx: x1, by: y1 });
  }
  return segs;
}

function castRay(ox, oy, angle, maxDist, segs) {
  const rdx = Math.cos(angle), rdy = Math.sin(angle); let cl = maxDist;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i], sdx = s.bx - s.ax, sdy = s.by - s.ay;
    const den = rdx * sdy - rdy * sdx; if (Math.abs(den) < 1e-10) continue;
    const t = ((s.ax - ox) * sdy - (s.ay - oy) * sdx) / den;
    const u = ((s.ax - ox) * rdy - (s.ay - oy) * rdx) / den;
    if (t > 0 && t < cl && u >= 0 && u <= 1) cl = t;
  }
  return { x: ox + rdx * cl, y: oy + rdy * cl, dist: cl };
}

function getCornerAngles(ox, oy, segs) {
  const angles = [], seen = new Set();
  for (const s of segs) for (const pt of [{ x: s.ax, y: s.ay }, { x: s.bx, y: s.by }]) {
    const a = Math.atan2(pt.y - oy, pt.x - ox), key = Math.round(a * 100000);
    if (!seen.has(key)) { seen.add(key); angles.push(a - 0.0001, a, a + 0.0001); }
  }
  return angles;
}

function normalizeAngle(a) { while (a < -Math.PI) a += 2 * Math.PI; while (a > Math.PI) a -= 2 * Math.PI; return a; }

function buildVisPoly(ox, oy, angles, maxDist, segs, ref) {
  const pts = [];
  for (const a of angles) { const h = castRay(ox, oy, a, maxDist, segs); pts.push({ x: h.x, y: h.y, sort: normalizeAngle(a - ref) }); }
  pts.sort((a, b) => a.sort - b.sort); return pts;
}

const VisionSystem = { update(_dt, state) {
  const p = state.player, v = state.vision, cam = state.camera;
  v.angle = Math.atan2(v.mouseY + cam.y - p.y, v.mouseX + cam.x - p.x);
  const half = v.coneWidth / 2;
  const segs = getOpaqueSegments(p.x, p.y, v.coneRange);
  const corners = getCornerAngles(p.x, p.y, segs);
  const ca = [];
  for (let i = 0; i <= 80; i++) ca.push(v.angle - half + (v.coneWidth * i) / 80);
  for (const a of corners) if (Math.abs(normalizeAngle(a - v.angle)) <= half) ca.push(a);
  v.conePoly = buildVisPoly(p.x, p.y, ca, v.coneRange, segs, v.angle);
  const aa = [];
  for (let i = 0; i < 60; i++) aa.push(v.angle + (2 * Math.PI * i) / 60);
  for (const a of corners) aa.push(a);
  v.ambientPoly = buildVisPoly(p.x, p.y, aa, state.dayNight.ambientRange, segs, v.angle);
}};

// LOS uses LOCAL segments (scales to big maps)
function hasLOS(x1, y1, x2, y2) {
  const d = Math.hypot(x2 - x1, y2 - y1);
  if (d < 1) return true;
  const segs = getOpaqueSegments((x1 + x2) / 2, (y1 + y2) / 2, d / 2 + T);
  return castRay(x1, y1, Math.atan2(y2 - y1, x2 - x1), d, segs).dist >= d - 1;
}

function isInVision(state, x, y) {
  const p = state.player, v = state.vision;
  const d = Math.hypot(x - p.x, y - p.y);
  if (d <= state.dayNight.ambientRange) return hasLOS(p.x, p.y, x, y);
  if (d > v.coneRange) return false;
  if (Math.abs(normalizeAngle(Math.atan2(y - p.y, x - p.x) - v.angle)) > v.coneWidth / 2) return false;
  return hasLOS(p.x, p.y, x, y);
}

// Zombie system with activation radius
const ZombieSystem = { update(dt, state, bus) {
  const p = state.player;
  for (const z of state.zombies) {
    if (z.dead) continue;
    const dist = Math.hypot(p.x - z.x, p.y - z.y);
    if (dist > ZOMBIE_ACTIVATION) continue; // dormant

    const canSee = dist < z.sightRange * state.dayNight.zombieSight && hasLOS(z.x, z.y, p.x, p.y);
    if (canSee) { z.state = "chase"; z.targetX = p.x; z.targetY = p.y; z.lostSightTimer = 0; }
    let spd = 0, ang = z.dir;
    switch (z.state) {
      case "idle": z.wanderTimer -= dt; if (z.wanderTimer <= 0) { z.dir = Math.random() * Math.PI * 2; z.wanderTimer = 2 + Math.random() * 3; } spd = 25; ang = z.dir; break;
      case "alert": ang = Math.atan2(z.targetY - z.y, z.targetX - z.x); spd = 50; z.alertTimer -= dt; if (Math.hypot(z.targetX - z.x, z.targetY - z.y) < 20 || z.alertTimer <= 0) z.state = "idle"; break;
      case "chase": ang = Math.atan2(p.y - z.y, p.x - z.x); spd = z.speed * state.dayNight.zombieSpeed;
        if (!canSee) { z.lostSightTimer += dt; if (z.lostSightTimer > 3) z.state = "idle"; }
        z.biteCooldown -= dt;
        if (dist < (z.size + p.size) / 2 && z.biteCooldown <= 0) { bus.emit("player:bitten", { zombieId: z.id }); z.biteCooldown = 1.5; }
        break;
    }
    if (spd > 0) {
      const dx = Math.cos(ang) * spd * dt, dy = Math.sin(ang) * spd * dt, r = z.size / 2;
      if (!collidesWithWall(z.x + dx, z.y, r)) z.x += dx;
      else {
        if (z.state === "idle") z.dir = Math.random() * Math.PI * 2;
        // Zombie attacks barricade if chasing or alert
        if (z.state === "chase" || z.state === "alert") {
          const fc = Math.floor((z.x + dx + (dx > 0 ? r : -r)) / T);
          const fr = Math.floor(z.y / T);
          if (fc >= 0 && fc < MAP_COLS && fr >= 0 && fr < MAP_ROWS && MAP[fr][fc] === BARRICADE) {
            const bk = fc + "," + fr;
            if (barricades[bk]) { barricades[bk].hp -= 15 * dt; if (barricades[bk].hp <= 0) { MAP[fr][fc] = barricades[bk].baseTile; delete barricades[bk]; } }
          }
        }
      }
      if (!collidesWithWall(z.x, z.y + dy, r)) z.y += dy;
      else if (z.state === "chase" || z.state === "alert") {
        const fc = Math.floor(z.x / T);
        const fr = Math.floor((z.y + dy + (dy > 0 ? r : -r)) / T);
        if (fc >= 0 && fc < MAP_COLS && fr >= 0 && fr < MAP_ROWS && MAP[fr][fc] === BARRICADE) {
          const bk = fc + "," + fr;
          if (barricades[bk]) { barricades[bk].hp -= 15 * dt; if (barricades[bk].hp <= 0) { MAP[fr][fc] = barricades[bk].baseTile; delete barricades[bk]; } }
        }
      }
    }
    const minD = (p.size + z.size) / 2, dd = Math.hypot(p.x - z.x, p.y - z.y);
    if (dd < minD && dd > 0.1) {
      const ov = minD - dd, nx = (p.x - z.x) / dd, ny = (p.y - z.y) / dd;
      if (!collidesWithWall(p.x + nx * ov * 0.6, p.y, p.size / 2)) p.x += nx * ov * 0.6;
      if (!collidesWithWall(p.x, p.y + ny * ov * 0.6, p.size / 2)) p.y += ny * ov * 0.6;
      if (!collidesWithWall(z.x - nx * ov * 0.4, z.y, z.size / 2)) z.x -= nx * ov * 0.4;
      if (!collidesWithWall(z.x, z.y - ny * ov * 0.4, z.size / 2)) z.y -= ny * ov * 0.4;
    }
  }
}};

const ATTACK_RANGE = 45, ATTACK_ARC = Math.PI / 2, ATTACK_CD = 0.4;

// Track tree damage: key = "col,row", value = hits remaining
const treeDamage = {};
// Track barricade HP: key = "col,row", value = { hp, baseTile }
const barricades = {};
const BARRICADE_HP = 80;

const CombatSystem = { update(dt, state, bus) {
  const p = state.player; p.attackCooldown -= dt; p.attackTimer -= dt;
  if (state.inventory.open || p.hp <= 0) { state.input2.attackRequested = false; return; }

  const held = state.inventory.hotbar[state.inventory.selected];
  const info = held ? ITEM_INFO[held.type] : null;

  // Use item (E) — place barricade
  if (state.input2.useRequested && held && ITEM_INFO[held.type].placeable) {
    state.input2.useRequested = false;
    const cam = state.camera;
    const wmx = state.vision.mouseX + cam.x, wmy = state.vision.mouseY + cam.y;
    const tc = Math.floor(wmx / T), tr = Math.floor(wmy / T);
    const dist = Math.hypot(tc * T + T / 2 - p.x, tr * T + T / 2 - p.y);
    if (dist < 80 && tr > 0 && tr < MAP_ROWS - 1 && tc > 0 && tc < MAP_COLS - 1 && !isSolid(tc, tr)) {
      const bkey = tc + "," + tr;
      barricades[bkey] = { hp: BARRICADE_HP, baseTile: MAP[tr][tc] };
      MAP[tr][tc] = BARRICADE;
      held.count--; if (held.count <= 0) state.inventory.hotbar[state.inventory.selected] = null;
      bus.emit("player:noise", { x: p.x, y: p.y, radius: 150 });
    }
  }

  if (!state.input2.attackRequested || p.attackCooldown > 0) { state.input2.attackRequested = false; return; }

  // Need tool to attack
  if (!info || !info.tool) { state.input2.attackRequested = false; return; }

  state.input2.attackRequested = false;
  p.attackCooldown = ATTACK_CD; p.attackTimer = 0.15;

  const v = state.vision;
  const damage = info.damage || 35;

  // Check for barricade in attack arc
  const bRange = ATTACK_RANGE + T;
  for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
    const bc = Math.floor(p.x / T) + dc, br = Math.floor(p.y / T) + dr;
    if (br < 0 || br >= MAP_ROWS || bc < 0 || bc >= MAP_COLS || MAP[br][bc] !== BARRICADE) continue;
    const bx = bc * T + T / 2, by = br * T + T / 2;
    if (Math.hypot(bx - p.x, by - p.y) > bRange) continue;
    if (Math.abs(normalizeAngle(Math.atan2(by - p.y, bx - p.x) - v.angle)) > ATTACK_ARC / 2) continue;
    const bkey = bc + "," + br;
    const bd = barricades[bkey];
    if (bd) { MAP[br][bc] = bd.baseTile; delete barricades[bkey]; }
    else { MAP[br][bc] = GRASS; }
    state.groundItems.push({ x: bx, y: by, item: { type: "wood", count: 1 }, delay: 0.2 });
    bus.emit("player:noise", { x: p.x, y: p.y, radius: 180 });
    return;
  }

  // Check for tree in attack arc (scan nearby tiles)
  const treeRange = ATTACK_RANGE + T;
  let hitTree = null, hitDist = Infinity;
  const pc = Math.floor(p.x / T), pr = Math.floor(p.y / T);
  for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
    const tc = pc + dc, tr = pr + dr;
    if (tr < 0 || tr >= MAP_ROWS || tc < 0 || tc >= MAP_COLS || MAP[tr][tc] !== TREE) continue;
    const cx = tc * T + T / 2, cy = tr * T + T / 2;
    const d = Math.hypot(cx - p.x, cy - p.y);
    if (d > treeRange) continue;
    const a = Math.atan2(cy - p.y, cx - p.x);
    if (Math.abs(normalizeAngle(a - v.angle)) > ATTACK_ARC / 2) continue;
    if (d < hitDist) { hitDist = d; hitTree = { c: tc, r: tr }; }
  }

  if (hitTree) {
    const key = hitTree.c + "," + hitTree.r;
    if (!treeDamage[key]) treeDamage[key] = info.treeHits || 3;
    treeDamage[key]--;
    bus.emit("player:noise", { x: p.x, y: p.y, radius: 200 });
    if (treeDamage[key] <= 0) {
      MAP[hitTree.r][hitTree.c] = GRASS;
      delete treeDamage[key];
      bus.emit("player:noise", { x: p.x, y: p.y, radius: 350 });
      state.groundItems.push({ x: hitTree.c * T + T / 2, y: hitTree.r * T + T / 2, item: { type: "wood", count: 2 }, delay: 0.3 });
    }
    return;
  }

  // Attack zombies
  bus.emit("player:noise", { x: p.x, y: p.y, radius: 250 });
  for (const z of state.zombies) {
    if (z.dead || Math.hypot(z.x - p.x, z.y - p.y) > ATTACK_RANGE) continue;
    if (Math.abs(normalizeAngle(Math.atan2(z.y - p.y, z.x - p.x) - v.angle)) > ATTACK_ARC / 2) continue;
    z.hp -= damage;
    if (z.hp <= 0) { z.dead = true; bus.emit("zombie:killed", { id: z.id, x: z.x, y: z.y }); }
    else { z.state = "chase"; z.lostSightTimer = 0; }
  }
}};

const HUNGER_DRAIN = 0.15, HP_REGEN = 3, BREAD_HEAL = 25, BANDAGE_HEAL = 30, BITE_DMG = 15, INFECT_CHANCE = 0.2;
const SurvivalSystem = { update(dt, state) {
  const p = state.player; if (p.hp <= 0) return;
  p.hunger = Math.max(0, p.hunger - HUNGER_DRAIN * dt);
  if (p.hunger >= 90 && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + HP_REGEN * dt);
  if (state.input2.useRequested) {
    const slot = state.inventory.hotbar[state.inventory.selected];
    if (slot && ITEM_INFO[slot.type] && ITEM_INFO[slot.type].placeable) {
      // Handled by CombatSystem (barricade placement)
    } else {
      state.input2.useRequested = false;
      if (!slot) return;
      if (slot.type === "bread" && p.hunger < p.maxHunger) { p.hunger = Math.min(p.maxHunger, p.hunger + BREAD_HEAL); slot.count--; if (slot.count <= 0) state.inventory.hotbar[state.inventory.selected] = null; }
      else if (slot.type === "bandage" && p.hp < p.maxHp) { p.hp = Math.min(p.maxHp, p.hp + BANDAGE_HEAL); slot.count--; if (slot.count <= 0) state.inventory.hotbar[state.inventory.selected] = null; }
    }
  } else { state.input2.useRequested = false; }
}};

const PICKUP_RANGE = 28;
const InventorySystem = { update(_dt, state) {
  if (state.input2.toggleInventory) { state.input2.toggleInventory = false; if (state.inventory.open) closeInventory(state); else state.inventory.open = true; }
  const p = state.player;
  for (let i = state.groundItems.length - 1; i >= 0; i--) {
    const gi = state.groundItems[i]; if (gi.delay > 0) { gi.delay -= _dt; continue; }
    if (Math.hypot(gi.x - p.x, gi.y - p.y) <= PICKUP_RANGE) { if (addToInventory(state, gi.item)) state.groundItems.splice(i, 1); }
  }
}};

// ------------------------------------------------------------
//  Render
// ------------------------------------------------------------
function render(ctx, state) {
  const cam = state.camera, vw = cam.viewW, vh = cam.viewH, p = state.player;
  ctx.fillStyle = "#0a0b0f"; ctx.fillRect(0, 0, vw, vh);

  ctx.save(); ctx.translate(-cam.x, -cam.y);
  drawTiles(ctx, cam);
  drawGroundItems(ctx, state);
  drawZombies(ctx, state);
  if (p.attackTimer > 0) {
    ctx.save(); ctx.globalAlpha = p.attackTimer / 0.15;
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
    ctx.arc(p.x, p.y, ATTACK_RANGE, state.vision.angle - ATTACK_ARC / 2, state.vision.angle + ATTACK_ARC / 2);
    ctx.closePath(); ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fill(); ctx.restore();
  }
  ctx.fillStyle = p.hp <= 0 ? "#6a2a2a" : p.sneaking ? "#b8a038" : "#e2c044";
  ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  ctx.restore();

  drawFog(ctx, state);
  drawHud(ctx, state);
  drawInventoryUI(ctx, state);
}

function drawTiles(ctx, cam) {
  const sc = Math.max(0, Math.floor(cam.x / T)), ec = Math.min(MAP_COLS - 1, Math.floor((cam.x + cam.viewW) / T));
  const sr = Math.max(0, Math.floor(cam.y / T)), er = Math.min(MAP_ROWS - 1, Math.floor((cam.y + cam.viewH) / T));
  for (let r = sr; r <= er; r++) for (let c = sc; c <= ec; c++) {
    const tile = MAP[r][c], x = c * T, y = r * T;
    ctx.fillStyle = TILE_COL[tile]; ctx.fillRect(x, y, T, T);
    const stroke = TILE_STROKE[tile];
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = tile === WALL ? 2 : 1; ctx.strokeRect(x + 0.5, y + 0.5, T - 1, T - 1); }
  }
}

function drawGroundItems(ctx, state) {
  for (const gi of state.groundItems) {
    if (!isInVision(state, gi.x, gi.y)) continue;
    const info = ITEM_INFO[gi.item.type]; if (!info) continue;
    ctx.fillStyle = info.color; ctx.globalAlpha = 0.8;
    ctx.fillRect(gi.x - 5, gi.y - 5, 10, 10); ctx.globalAlpha = 1;
    if (gi.item.count > 1) { ctx.fillStyle = "#fff"; ctx.font = "9px ui-monospace,monospace"; ctx.textBaseline = "top"; ctx.fillText(String(gi.item.count), gi.x + 3, gi.y - 8); }
  }
}

const Z_COL = { idle: "#4a6a4a", alert: "#8a7a3a", chase: "#8a3a3a" };
function drawZombies(ctx, state) {
  const cam = state.camera;
  for (const z of state.zombies) {
    if (z.dead) continue;
    if (z.x < cam.x - 50 || z.x > cam.x + cam.viewW + 50 || z.y < cam.y - 50 || z.y > cam.y + cam.viewH + 50) continue;
    if (!isInVision(state, z.x, z.y)) continue;
    ctx.fillStyle = Z_COL[z.state]; ctx.fillRect(z.x - z.size / 2, z.y - z.size / 2, z.size, z.size);
    if (z.hp < 100) { const bx = z.x - z.size / 2, by = z.y - z.size / 2 - 6; ctx.fillStyle = "#333"; ctx.fillRect(bx, by, z.size, 3); ctx.fillStyle = "#c44"; ctx.fillRect(bx, by, z.size * (z.hp / 100), 3); }
  }
}

let _fogCanvas = null, _fogCtx = null;
function drawFog(ctx, state) {
  const cam = state.camera, vw = cam.viewW, vh = cam.viewH;
  const p = state.player, cone = state.vision.conePoly, amb = state.vision.ambientPoly;
  if (cone.length < 3 && amb.length < 3) return;
  if (!_fogCanvas) { _fogCanvas = document.createElement("canvas"); _fogCtx = _fogCanvas.getContext("2d"); }
  _fogCanvas.width = vw; _fogCanvas.height = vh; const fc = _fogCtx;
  fc.globalCompositeOperation = "source-over";
  fc.fillStyle = `rgba(0,0,0,${state.dayNight.fogAlpha.toFixed(2)})`; fc.fillRect(0, 0, vw, vh);
  fc.globalCompositeOperation = "destination-out";
  const sx = p.x - cam.x, sy = p.y - cam.y;
  if (cone.length >= 3) { fc.beginPath(); fc.moveTo(sx, sy); for (const pt of cone) fc.lineTo(pt.x - cam.x, pt.y - cam.y); fc.closePath(); fc.fillStyle = "rgba(0,0,0,1)"; fc.fill(); }
  if (amb.length >= 3) { fc.beginPath(); fc.moveTo(amb[0].x - cam.x, amb[0].y - cam.y); for (let i = 1; i < amb.length; i++) fc.lineTo(amb[i].x - cam.x, amb[i].y - cam.y); fc.closePath(); fc.fillStyle = "rgba(0,0,0,0.40)"; fc.fill(); }
  fc.globalCompositeOperation = "source-over";
  ctx.drawImage(_fogCanvas, 0, 0);
}

function drawHud(ctx, state) {
  if (state.inventory.open) return;
  const p = state.player, cam = state.camera, w = cam.viewW, h = cam.viewH;
  ctx.font = "12px ui-monospace,monospace"; ctx.textBaseline = "top";
  ctx.fillStyle = "#6a6b70"; ctx.fillText(`FPS: ${state.time.fps}  Z: ${state.zombies.filter(z=>!z.dead).length}`, 10, 10);
  const dn = state.dayNight, prog = dn.time / dn.cycle, isDay = dn.brightness > 0.5;
  const mins = Math.floor(dn.time / 60), secs = Math.floor(dn.time % 60);
  ctx.fillStyle = isDay ? "#e8c840" : "#7788bb"; ctx.font = "13px ui-monospace,monospace"; ctx.textAlign = "center";
  ctx.fillText(`${isDay?"☀":"☾"} ${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`, w / 2, 10);
  const barCW = 80, barCX = w / 2 - barCW / 2;
  ctx.fillStyle = "#333"; ctx.fillRect(barCX, 26, barCW, 4);
  ctx.fillStyle = isDay ? "#e8c840" : "#5566aa"; ctx.fillRect(barCX, 26, barCW * prog, 4); ctx.textAlign = "start";
  if (p.sneaking) { ctx.fillStyle = "#5a8a5a"; ctx.fillText("SNEAKING", 10, 28); }
  if (p.infected) { ctx.fillStyle = "#7a5aaa"; ctx.fillText("INFECTADO", 10, p.sneaking ? 46 : 28); }
  const bW = 140, bX = w - bW - 12;
  ctx.fillStyle = "#333"; ctx.fillRect(bX, 10, bW, 10);
  ctx.fillStyle = p.hp > 30 ? "#c44" : "#f44"; ctx.fillRect(bX, 10, bW * (p.hp / p.maxHp), 10);
  ctx.strokeStyle = "#555"; ctx.lineWidth = 1; ctx.strokeRect(bX, 10, bW, 10);
  ctx.fillStyle = "#ddd"; ctx.fillText(`HP ${Math.ceil(p.hp)}`, bX - 42, 9);
  ctx.fillStyle = "#333"; ctx.fillRect(bX, 26, bW, 10);
  ctx.fillStyle = p.hunger > 25 ? "#a87832" : "#e8a020"; ctx.fillRect(bX, 26, bW * (p.hunger / p.maxHunger), 10);
  ctx.strokeStyle = "#555"; ctx.strokeRect(bX, 26, bW, 10);
  ctx.fillStyle = "#ddd"; ctx.fillText("FOME", bX - 42, 25);
  const slS = 36, slG = 4, hx = (w - 5 * slS - 4 * slG) / 2, hy = h - slS - 8;
  for (let i = 0; i < 5; i++) {
    const sx = hx + i * (slS + slG), sel = i === state.inventory.selected;
    ctx.fillStyle = sel ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.5)"; ctx.fillRect(sx, hy, slS, slS);
    ctx.strokeStyle = sel ? "#e2c044" : "#555"; ctx.lineWidth = sel ? 2 : 1; ctx.strokeRect(sx, hy, slS, slS);
    ctx.fillStyle = "#888"; ctx.font = "10px ui-monospace,monospace"; ctx.fillText(String(i + 1), sx + 2, hy + 2);
    const item = state.inventory.hotbar[i];
    if (item) { const info = ITEM_INFO[item.type]; if (info) { ctx.fillStyle = info.color; ctx.font = "16px ui-monospace,monospace"; ctx.textBaseline = "middle"; ctx.textAlign = "center"; ctx.fillText(info.letter, sx + slS / 2, hy + slS / 2); ctx.textAlign = "start"; ctx.textBaseline = "top"; } if (item.count > 1) { ctx.fillStyle = "#ccc"; ctx.font = "10px ui-monospace,monospace"; ctx.fillText(String(item.count), sx + slS - 14, hy + slS - 14); } }
  }
  ctx.font = "12px ui-monospace,monospace"; ctx.textBaseline = "top";
  if (p.hp <= 0) { ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#c44"; ctx.font = "32px ui-monospace,monospace"; ctx.textBaseline = "middle"; ctx.textAlign = "center"; ctx.fillText("VOCÊ MORREU", w / 2, h / 2); ctx.fillStyle = "#888"; ctx.font = "14px ui-monospace,monospace"; ctx.fillText("F5 pra recomeçar", w / 2, h / 2 + 30); ctx.textAlign = "start"; ctx.textBaseline = "top"; }
}

function drawSlot(ctx, item, x, y, hl) { ctx.fillStyle = hl ? "rgba(255,255,200,0.15)" : "rgba(0,0,0,0.4)"; ctx.fillRect(x, y, SL, SL); ctx.strokeStyle = hl ? "#e2c044" : "#444"; ctx.lineWidth = 1; ctx.strokeRect(x, y, SL, SL); if (item) drawItemIcon(ctx, item, x, y); }
function drawItemIcon(ctx, item, x, y) { const info = ITEM_INFO[item.type]; if (!info) return; ctx.fillStyle = info.color; ctx.font = "16px ui-monospace,monospace"; ctx.textBaseline = "middle"; ctx.textAlign = "center"; ctx.fillText(info.letter, x + SL / 2, y + SL / 2); ctx.textAlign = "start"; ctx.textBaseline = "top"; if (item.count > 1) { ctx.fillStyle = "#ddd"; ctx.font = "10px ui-monospace,monospace"; ctx.fillText(String(item.count), x + SL - 14, y + SL - 14); } }
function drawInventoryUI(ctx, state) {
  if (!state.inventory.open) return;
  const inv = state.inventory, v = state.vision, cam = state.camera;
  ctx.fillStyle = "rgba(0,0,0,0.75)"; ctx.fillRect(0, 0, cam.viewW, cam.viewH);
  ctx.fillStyle = "rgba(20,22,30,0.95)"; ctx.fillRect(INV_PX, INV_PY, INV_PW, INV_PH);
  ctx.strokeStyle = "#555"; ctx.lineWidth = 1; ctx.strokeRect(INV_PX, INV_PY, INV_PW, INV_PH);
  ctx.fillStyle = "#ccc"; ctx.font = "13px ui-monospace,monospace"; ctx.textBaseline = "top";
  ctx.fillText("INVENTÁRIO", INV_GX, INV_PY + 18); ctx.fillText("CRIAR", CRA_GX, INV_PY + 18);
  for (let r = 0; r < INV_ROWS; r++) for (let c = 0; c < INV_COLS; c++) drawSlot(ctx, inv.grid[r * INV_COLS + c], INV_GX + c * (SL + SG), INV_GY + r * (SL + SG), false);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) drawSlot(ctx, inv.craft[r * 2 + c], CRA_GX + c * (SL + SG), CRA_GY + r * (SL + SG), false);
  ctx.fillStyle = "#666"; ctx.font = "20px ui-monospace,monospace"; ctx.textBaseline = "middle"; ctx.fillText("→", CRA_GX + 2 * (SL + SG) + 10, CRA_GY + SL + SG / 2); ctx.textBaseline = "top";
  drawSlot(ctx, inv.craftResult, CRA_OX, CRA_OY, !!inv.craftResult);
  ctx.fillStyle = "#555"; ctx.font = "10px ui-monospace,monospace"; ctx.fillText("2× Pano → Bandagem", CRA_GX, CRA_GY + 2 * (SL + SG) + 10);
  ctx.fillStyle = "#888"; ctx.font = "11px ui-monospace,monospace"; ctx.fillText("HOTBAR", HOT_IX, HOT_IY - 14);
  for (let i = 0; i < 5; i++) { const sx = HOT_IX + i * (SL + SG); drawSlot(ctx, inv.hotbar[i], sx, HOT_IY, i === inv.selected); ctx.fillStyle = "#888"; ctx.font = "10px ui-monospace,monospace"; ctx.fillText(String(i + 1), sx + 2, HOT_IY + 2); }
  if (inv.held) drawItemIcon(ctx, inv.held, v.mouseX - SL / 2, v.mouseY - SL / 2);
}

// ------------------------------------------------------------
//  main
// ------------------------------------------------------------
function main() {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const bus = new EventBus();
  const state = createState(canvas);
  const systems = [DayNightSystem, InventorySystem, MovementSystem, CameraSystem, CombatSystem, SurvivalSystem, VisionSystem, ZombieSystem];
  setupInput(state, canvas);

  bus.on("player:noise", ({ x, y, radius }) => {
    for (const z of state.zombies) { if (z.dead || z.state === "chase") continue; if (Math.hypot(z.x - x, z.y - y) <= radius * state.dayNight.noiseMulti) { z.state = "alert"; z.targetX = x; z.targetY = y; z.alertTimer = 5; } }
  });
  bus.on("player:bitten", () => { const p = state.player; p.hp = Math.max(0, p.hp - BITE_DMG); if (!p.infected && Math.random() < INFECT_CHANCE) p.infected = true; });
  bus.on("zombie:killed", ({ x, y }) => { for (const item of rollZombieLoot()) state.groundItems.push({ x: x + (Math.random() - 0.5) * 20, y: y + (Math.random() - 0.5) * 20, item, delay: 0.6 }); });

  const STEP = 1 / 60;
  let acc = 0, last = performance.now(), fpsCnt = 0, fpsT = 0;
  function frame(now) {
    let dt = (now - last) / 1000; last = now; if (dt > 0.25) dt = 0.25;
    acc += dt; state.time.now = now;
    while (acc >= STEP) { for (const sys of systems) sys.update(STEP, state, bus); acc -= STEP; state.time.frame++; }
    fpsCnt++; fpsT += dt;
    if (fpsT >= 0.5) { state.time.fps = Math.round(fpsCnt / fpsT); fpsCnt = 0; fpsT = 0; }
    render(ctx, state); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

window.addEventListener("DOMContentLoaded", main);
