"use client";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Logo from "@/components/Logo";

export default function Screensaver() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div
      className="relative w-screen h-screen bg-black flex flex-col items-center justify-center overflow-hidden"
      onClick={() => router.push("/garage")}
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-radial-[ellipse_60%_40%_at_50%_50%] from-zinc-800/30 to-transparent pointer-events-none" />

      {/* Top rule */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-[#5B9BD5] transition-all duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* Content */}
      <div
        className={`flex flex-col items-center gap-10 transition-all duration-1000 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* LC4 Logo */}
        <Logo
          onDark
          className="w-[clamp(280px,40vw,560px)] h-auto max-h-[150px]"
        />

        {/* Divider */}
        <div className="w-24 h-[1px] bg-zinc-700" />

        {/* Tagline */}
        <p className="text-sm font-inter text-[clamp(14px,1.8vw,22px)] tracking-[0.2em] uppercase text-zinc-300 font-light">
          There is no substitute.
        </p>
      </div>

      {/* Touch prompt */}
      <div
        className={`absolute bottom-16 flex flex-col items-center gap-3 transition-all duration-1000 delay-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="animate-bounce w-6 h-6 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="#666"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="font-inter text-xs tracking-[0.3em] uppercase text-zinc-600">
          Touch to explore
        </span>
      </div>

      {/* Bottom rule */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[#5B9BD5] transition-all duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
