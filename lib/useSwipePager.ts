import {useCallback, useLayoutEffect, useRef, useState} from "react";

// Touch carousel for full-width pages laid side by side in a track:
// - the track follows the finger 1:1 while dragging (no React re-render per move)
// - on release it settles to the nearest page, or the next one on a flick
// - past the first/last page it stretches with resistance and springs back
// - horizontal drags never become taps; vertical drags are ignored
// Pages always move at most one step per gesture, like native pagers.

const DRAG_START_PX = 10; // movement before a press becomes a drag
const EDGE_RESISTANCE = 0.35; // how far past the ends the track stretches
const FLICK_VELOCITY = 0.35; // px/ms — a quick flick turns the page...
const FLICK_MIN_PX = 24; // ...as long as it moved at least this far
const SETTLE = "transform 420ms cubic-bezier(0.22, 0.8, 0.24, 1)";

type Drag = {
  pointerId: number;
  x0: number;
  y0: number;
  base: number; // track position when the press started
  startPage: number;
  lastX: number;
  lastT: number;
  velocity: number;
  dragging: boolean;
};

export function useSwipePager(pageCount: number, page: number, onPage: (page: number) => void) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const width = useRef(0);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const settled = useRef(false);
  const [dragging, setDragging] = useState(false);

  const moveTo = useCallback((x: number, animate: boolean) => {
    const t = track.current;
    if (!t) return;
    t.style.transition = animate ? SETTLE : "none";
    t.style.transform = `translate3d(${x}px, 0, 0)`;
  }, []);

  // Rest on the current page; animate page changes, but not the first layout.
  const pageRef = useRef(page);
  useLayoutEffect(() => {
    pageRef.current = page;
    moveTo(-page * width.current, settled.current);
    settled.current = true;
  }, [page, moveTo]);

  // Keep the resting position correct when the screen size/orientation changes.
  useLayoutEffect(() => {
    const v = viewport.current;
    if (!v) return;
    width.current = v.clientWidth;
    const ro = new ResizeObserver(() => {
      if (v.clientWidth === width.current) return;
      width.current = v.clientWidth;
      if (!drag.current?.dragging) moveTo(-pageRef.current * width.current, false);
    });
    ro.observe(v);
    return () => ro.disconnect();
  }, [moveTo]);

  function currentX() {
    const t = track.current;
    return t ? new DOMMatrixReadOnly(getComputedStyle(t).transform).m41 : 0;
  }

  const handlers = {
    onPointerDown(e: React.PointerEvent) {
      if (e.button !== 0 || drag.current) return;
      suppressClick.current = false;
      // Catch a page that's still settling exactly where it is.
      const x = currentX();
      moveTo(x, false);
      drag.current = {
        pointerId: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
        base: x,
        startPage: page,
        lastX: e.clientX,
        lastT: e.timeStamp,
        velocity: 0,
        dragging: false,
      };
    },

    onPointerMove(e: React.PointerEvent) {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      const dx = e.clientX - d.x0;
      const dy = e.clientY - d.y0;

      if (!d.dragging) {
        if (Math.abs(dy) > DRAG_START_PX && Math.abs(dy) > Math.abs(dx)) {
          drag.current = null; // vertical — not ours
          return;
        }
        if (Math.abs(dx) < DRAG_START_PX) return;
        d.dragging = true;
        suppressClick.current = true;
        // Capture only once it's a drag, so plain taps still click the card.
        viewport.current?.setPointerCapture(e.pointerId);
        setDragging(true);
      }

      let x = d.base + dx;
      const min = -(pageCount - 1) * width.current;
      if (x > 0) x *= EDGE_RESISTANCE;
      else if (x < min) x = min + (x - min) * EDGE_RESISTANCE;
      moveTo(x, false);

      const dt = e.timeStamp - d.lastT;
      if (dt > 0) d.velocity = 0.8 * ((e.clientX - d.lastX) / dt) + 0.2 * d.velocity;
      d.lastX = e.clientX;
      d.lastT = e.timeStamp;
    },

    onPointerUp(e: React.PointerEvent) {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      drag.current = null;
      if (!d.dragging) return;
      setDragging(false);

      const dx = e.clientX - d.x0;
      // A finger that stopped before lifting isn't a flick.
      const velocity = e.timeStamp - d.lastT > 80 ? 0 : d.velocity;
      let target = d.startPage;
      if (Math.abs(velocity) > FLICK_VELOCITY && Math.abs(dx) > FLICK_MIN_PX) {
        target += velocity < 0 ? 1 : -1;
      } else if (Math.abs(dx) > width.current / 2) {
        target += dx < 0 ? 1 : -1;
      }
      target = Math.max(0, Math.min(pageCount - 1, target));

      if (target === page) moveTo(-page * width.current, true);
      else onPage(target);
    },

    onPointerCancel(e: React.PointerEvent) {
      handlers.onPointerUp(e);
    },

    // Never let the browser start dragging a photo out of the carousel.
    onDragStart(e: React.DragEvent) {
      e.preventDefault();
    },

    // A drag that ends over a card must not open it.
    onClickCapture(e: React.MouseEvent) {
      if (suppressClick.current) {
        e.stopPropagation();
        e.preventDefault();
        suppressClick.current = false;
      }
    },
  };

  return {viewport, track, dragging, handlers};
}
