import {useLayoutEffect, useRef, useState} from "react";

// Measures a grid box: its size, its (token-based) gap, and the height of
// any per-tile element marked data-fit-extra (e.g. a caption under media).
function useGridBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({w: 0, h: 0, gap: 0, extra: 0});
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const extra = el.querySelector<HTMLElement>("[data-fit-extra]")?.offsetHeight ?? 0;
      const gap = parseFloat(getComputedStyle(el).rowGap) || 0;
      setBox({w: el.clientWidth, h: el.clientHeight, gap, extra});
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return {ref, ...box};
}

// Picks the column count that shows all `count` tiles in the grid at the
// largest size. Tiles are `aspect` (w/h) media plus any data-fit-extra
// height. Returns the tile width in px for grid columns and image sizes.
// The ref goes on the grid element itself, which must fill its parent.
export function useFitGrid(count: number, aspect: number) {
  const {ref, w, h, gap, extra} = useGridBox();
  let best = {cols: 1, tileW: 0};
  if (w > 0 && h > 0 && count > 0) {
    for (let cols = 1; cols <= count; cols++) {
      const rows = Math.ceil(count / cols);
      const byWidth = (w - gap * (cols - 1)) / cols;
      const byHeight = ((h - gap * (rows - 1)) / rows - extra) * aspect;
      const tileW = Math.floor(Math.min(byWidth, byHeight));
      if (tileW > best.tileW) best = {cols, tileW};
    }
  }
  return {ref, ...best};
}

// Shrinks content (via a --fit multiplier on its font sizes) until it fits
// its box, never below `min`. Content must not be clipped from view, so this
// is the last resort when a CMS entry is longer than the layout allows.
export function useFitScale(deps: unknown[], min = 0.84) {
  const box = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const b = box.current;
    const c = content.current;
    if (!b || !c) return;
    function fit() {
      let s = 1;
      c!.style.setProperty("--fit", "1");
      while (c!.scrollHeight > b!.clientHeight + 1 && s > min) {
        s = Math.max(min, s - 0.04);
        c!.style.setProperty("--fit", String(s));
      }
      setScale(s);
    }
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {box, content, scale};
}
