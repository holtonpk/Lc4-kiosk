"use client";
import {useEffect} from "react";

// Kiosk touch hygiene: no long-press menus or image drags anywhere, except in
// text fields (the admin still needs copy/paste there).

const EDITABLE = "input, textarea, select, [contenteditable='true']";

export default function TouchGuards() {
  useEffect(() => {
    function block(e: Event) {
      if (!(e.target instanceof Element && e.target.closest(EDITABLE))) e.preventDefault();
    }
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
    };
  }, []);
  return null;
}
