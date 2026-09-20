export function hash2(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

export function smoothT(t) {
  return t * t * (3 - 2 * t);
}

export function noise2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = smoothT(xf), v = smoothT(yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

export function fbm(x, y, oct = 5) {
  let v = 0, amp = 0.5, f = 1, norm = 0;
  for (let i = 0; i < oct; i++) {
    v += amp * noise2(x * f, y * f);
    norm += amp;
    f *= 2;
    amp *= 0.5;
  }
  return v / norm;
}

export function smootherstep(e0, e1, x) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function damp(cur, target, lambda, dt) {
  return cur + (target - cur) * (1 - Math.exp(-lambda * dt));
}

export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export const ISLAND_RADIUS = 950;
export const WATER_LEVEL = 0;

export function terrainHeight(x, z) {
  const d = Math.sqrt(x * x + z * z) / ISLAND_RADIUS;
  const island = 1 - smootherstep(0.42, 1.0, d);
  const n = fbm(x * 0.0022 + 13.7, z * 0.0022 + 7.3, 5);
  let h = (n - 0.34) * 320;
  h = h * island - 75 * (1 - island);
  h += (fbm(x * 0.011 + 100.5, z * 0.011 + 51.2, 3) - 0.5) * 7 * island;
  return h;
}

export function sampleGround(x, z, radius) {
  const center = terrainHeight(x, z);
  let maxH = center;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const h = terrainHeight(x + Math.cos(a) * radius, z + Math.sin(a) * radius);
    if (h > maxH) maxH = h;
  }
  if (maxH - center > 1.0) return center;
  return maxH;
}
