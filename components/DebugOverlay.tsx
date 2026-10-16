"use client";
import {useEffect, useState} from "react";

// On-device layout check. Open any page with ?debug=1 (stays on while you
// navigate; ?debug=0 turns it off). Shows the viewport and outlines in red any
// element that sticks out of its parent or the viewport, and in magenta any
// element that has scrollable overflow.

const KEY = "lc4-debug";
const MARK = "data-debug-outline";

function readFlag() {
  const q = new URLSearchParams(location.search).get("debug");
  try {
    if (q === "1") sessionStorage.setItem(KEY, "1");
    if (q === "0") sessionStorage.removeItem(KEY);
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return q === "1";
  }
}

type Stats = {w: number; h: number; dpr: number; orientation: string; overflow: number; scrolling: number; docScroll: string};

function scan(): Stats {
  document.querySelectorAll(`[${MARK}]`).forEach((el) => {
    (el as HTMLElement).style.outline = "";
    el.removeAttribute(MARK);
  });
  const W = innerWidth;
  const H = innerHeight;
  let overflow = 0;
  let scrolling = 0;
  for (const el of document.body.querySelectorAll<HTMLElement>("*")) {
    // SVG internals are clipped by their viewBox (the logo crops on purpose).
    // Off-screen carousel pages are inert and clipped on purpose.
    if (el.closest("[data-debug-overlay], nextjs-portal, [inert]") || el.parentElement?.closest("svg")) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const p = el.parentElement?.getBoundingClientRect();
    const outViewport = r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1;
    const outParent = !!p && (r.left < p.left - 1 || r.top < p.top - 1 || r.right > p.right + 1 || r.bottom > p.bottom + 1);
    const scrolls = el.scrollHeight > el.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(el).overflowY);
    if (outViewport || outParent) {
      overflow++;
      el.style.outline = "2px solid red";
      el.setAttribute(MARK, "");
    } else if (scrolls) {
      scrolling++;
      el.style.outline = "2px dashed magenta";
      el.setAttribute(MARK, "");
    }
  }
  const de = document.documentElement;
  return {
    w: W,
    h: H,
    dpr: devicePixelRatio,
    orientation: W >= H ? "landscape" : "portrait",
    overflow,
    scrolling,
    docScroll: `${de.scrollWidth}×${de.scrollHeight}`,
  };
}

export default function DebugOverlay() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!readFlag()) return;
    const tick = () => setStats(scan());
    tick();
    const id = setInterval(tick, 1000);
    addEventListener("resize", tick);
    return () => {
      clearInterval(id);
      removeEventListener("resize", tick);
    };
  }, []);

  if (!stats) return null;
  return (
    <div
      data-debug-overlay
      className="fixed top-2 left-2 z-[1000] pointer-events-none rounded-lg bg-black/80 px-3 py-2 font-mono text-[16px] leading-snug text-lime-300"
    >
      <div>
        viewport {stats.w} × {stats.h} @ {stats.dpr}x · {stats.orientation}
      </div>
      <div>document {stats.docScroll}</div>
      <div className={stats.overflow ? "text-red-400" : ""}>overflowing: {stats.overflow}</div>
      <div className={stats.scrolling ? "text-fuchsia-400" : ""}>scrollable: {stats.scrolling}</div>
    </div>
  );
}
