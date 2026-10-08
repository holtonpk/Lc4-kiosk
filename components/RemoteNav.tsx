"use client";
import {useEffect} from "react";

// Arrow-key (LG remote) navigation between visible controls, plus the
// webOS Back key. Dialogs mark themselves with data-nav-scope so focus stays
// inside them; data-nav-own-arrows="x" lets a dialog keep ←/→ for itself.

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([type="hidden"]):not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
const WEBOS_BACK = 461;

type Dir = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

function visibleRect(el: Element) {
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  if (r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) return null;
  const c = getComputedStyle(el);
  if (c.visibility === "hidden" || c.opacity === "0") return null;
  return r;
}

function activeScope(): ParentNode {
  const scopes = document.querySelectorAll("[data-nav-scope]");
  return scopes.length ? scopes[scopes.length - 1] : document;
}

function pick(from: DOMRect, candidates: {el: HTMLElement; r: DOMRect}[], dir: Dir) {
  const cx = from.left + from.width / 2;
  const cy = from.top + from.height / 2;
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  for (const {el, r} of candidates) {
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const along = dir === "ArrowRight" ? dx : dir === "ArrowLeft" ? -dx : dir === "ArrowDown" ? dy : -dy;
    const across = dir === "ArrowLeft" || dir === "ArrowRight" ? Math.abs(dy) : Math.abs(dx);
    if (along <= 1) continue;
    const score = along + across * 2;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best;
}

export default function RemoteNav() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented) return;

      if (e.keyCode === WEBOS_BACK) {
        e.preventDefault();
        if (document.querySelector("[data-nav-scope]")) {
          window.dispatchEvent(new KeyboardEvent("keydown", {key: "Escape"}));
        } else if (location.pathname !== "/") {
          history.back();
        }
        return;
      }

      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const dir = e.key as Dir;
      const target = e.target as HTMLElement;
      if (target.matches?.("input, textarea, select, [contenteditable='true']")) return;

      const scope = activeScope();
      if (scope instanceof HTMLElement && scope.dataset.navOwnArrows === "x" && (dir === "ArrowLeft" || dir === "ArrowRight")) return;

      const candidates = [...scope.querySelectorAll<HTMLElement>(FOCUSABLE)]
        .map((el) => ({el, r: visibleRect(el)}))
        .filter((c): c is {el: HTMLElement; r: DOMRect} => c.r !== null);
      if (!candidates.length) return;

      const current = document.activeElement as HTMLElement | null;
      const from = current && current !== document.body && scope.contains(current) ? visibleRect(current) : null;
      const next = from
        ? pick(from, candidates.filter((c) => c.el !== current), dir)
        : (candidates.find((c) => c.el.hasAttribute("data-nav-default")) ?? candidates[0]).el;
      if (next) {
        e.preventDefault();
        next.focus({preventScroll: true});
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
