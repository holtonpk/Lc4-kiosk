"use client";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Logo from "@/components/Logo";

// A pointing hand that taps, with a ring rippling out from the fingertip.
function TapHint() {
  return (
    <svg className="size-s6 overflow-visible" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="tap-ripple" cx="8" cy="3" r="3" stroke="#5B9BD5" strokeWidth="1" />
      <g
        className="tap-hand"
        stroke="#71717a"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 11v-1a2 2 0 0 0-4 0" />
        <path d="M14 10V9a2 2 0 0 0-4 0v1" />
        <path d="M10 9.5V4a2 2 0 0 0-4 0v10" />
        <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </g>
    </svg>
  );
}

export default function Screensaver() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="screen relative bg-black">
      {/* The whole screen is one target: tap anywhere, or press OK on the remote. */}
      <button
        type="button"
        autoFocus
        aria-label="Touch to explore"
        className="absolute inset-0 focus-visible:outline-none"
        onClick={() => router.push("/garage")}
      />

      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-radial-[ellipse_60%_40%_at_50%_50%] from-zinc-800/30 to-transparent pointer-events-none" />

      {/* Top rule */}
      <div
        className={`h-[2px] bg-[#5B9BD5] pointer-events-none transition-all duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* Content */}
      <div
        className={`flex flex-col items-center justify-center gap-s6 min-h-0 pointer-events-none transition-all duration-1000 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* LC4 Logo */}
        <Logo onDark className="w-[min(60vw,52vmin)] h-auto" />

        {/* Divider */}
        <div className="w-s8 h-[1px] bg-zinc-700" />

        {/* Tagline */}
        {/* pl matches the tracking so the trailing letter-space doesn't pull it off-centre */}
        <p className="font-inter text-lead tracking-[0.2em] pl-[0.2em] uppercase text-zinc-300 font-light text-center">
          There is no substitute.
        </p>
      </div>

      {/* Touch prompt + bottom rule — overlaid so the logo centres on the full screen */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pointer-events-none">
        <div
          className={`flex flex-col items-center gap-s2 pt-s2 pb-s8 transition-all duration-1000 delay-500 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <TapHint />
          <span className="font-inter text-caption tracking-[0.3em] pl-[0.3em] uppercase text-zinc-600">
            Touch to explore
          </span>
        </div>
        <div
          className={`self-stretch h-[2px] bg-[#5B9BD5] transition-all duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  );
}
