// Prepares a car's main photo for the kiosk before upload: trims empty edges,
// centres the car on a 2:1 canvas (max 2000×1000, never upscaled) and encodes
// it as WebP with transparency, under ~1 MB. Everything runs in the browser.

export const HERO_WIDTH = 2000;
export const HERO_HEIGHT = 1000;
const MAX_BYTES = 1_000_000;
// Big camera originals are scaled to this before scanning pixels, to keep memory sane.
const WORK_MAX = 4000;
// Alpha at or below this counts as empty; colour distance for opaque backgrounds.
const ALPHA_EMPTY = 8;
const BG_TOLERANCE = 24;

export type PreparedHero = {file: File; width: number; height: number; trimmed: boolean};

type Box = {x: number; y: number; w: number; h: number};

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", {willReadFrequently: true});
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  return {c, ctx};
}

// Bounding box of the "car" pixels. Transparent images trim by alpha; fully
// opaque ones (JPEGs) trim edges that match the top-left corner colour.
function contentBox(data: Uint8ClampedArray, w: number, h: number): Box {
  let hasAlpha = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      hasAlpha = true;
      break;
    }
  }
  const [r0, g0, b0] = [data[0], data[1], data[2]];
  const isContent = hasAlpha
    ? (i: number) => data[i + 3] > ALPHA_EMPTY
    : (i: number) =>
        Math.abs(data[i] - r0) + Math.abs(data[i + 1] - g0) + Math.abs(data[i + 2] - b0) > BG_TOLERANCE;

  let top = h, left = w, right = -1, bottom = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!isContent((y * w + x) * 4)) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  if (right < 0) return {x: 0, y: 0, w, h}; // nothing found — keep the whole image
  return {x: left, y: top, w: right - left + 1, h: bottom - top + 1};
}

function toBlob(c: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't encode the image."))), type, quality),
  );
}

export async function prepareHeroImage(file: File): Promise<PreparedHero> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This browser can't read that image. Please use a PNG, JPG or WebP.");
  }

  // 1. Working copy, downscaled if huge.
  const ws = Math.min(1, WORK_MAX / Math.max(bitmap.width, bitmap.height));
  const work = canvas(Math.round(bitmap.width * ws), Math.round(bitmap.height * ws));
  work.ctx.drawImage(bitmap, 0, 0, work.c.width, work.c.height);
  bitmap.close();

  // 2. Trim to the car.
  const {data} = work.ctx.getImageData(0, 0, work.c.width, work.c.height);
  const box = contentBox(data, work.c.width, work.c.height);
  const trimmed = box.w < work.c.width || box.h < work.c.height;

  // 3. Fit onto a 2:1 canvas, centred, without upscaling.
  const s = Math.min(1, HERO_WIDTH / box.w, HERO_HEIGHT / box.h);
  const carW = box.w * s;
  const carH = box.h * s;
  const outW = Math.round(Math.max(carW, carH * 2));
  const outH = Math.round(outW / 2);
  const out = canvas(outW, outH);
  out.ctx.imageSmoothingQuality = "high";
  out.ctx.drawImage(work.c, box.x, box.y, box.w, box.h, (outW - carW) / 2, (outH - carH) / 2, carW, carH);

  // 4. Encode: WebP keeps transparency and stays small. Browsers that can't
  //    encode WebP (older Safari) hand back PNG instead, which is still fine.
  let blob = await toBlob(out.c, "image/webp", 0.9);
  for (const q of [0.82, 0.74, 0.66]) {
    if (blob.size <= MAX_BYTES || blob.type !== "image/webp") break;
    blob = await toBlob(out.c, "image/webp", q);
  }

  const ext = blob.type === "image/webp" ? "webp" : "png";
  const name = `${file.name.replace(/\.[^.]+$/, "") || "hero"}.${ext}`;
  return {file: new File([blob], name, {type: blob.type}), width: outW, height: outH, trimmed};
}
