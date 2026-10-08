"use client";
import {useState, useEffect, useRef} from "react";
import {useRouter} from "next/navigation";
import Logo from "@/components/Logo";
import type {Car} from "@/lib/cars";
import Image from "next/image";

// 3×2 in landscape, 2×3 in portrait — six cars per page either way.
const PER_PAGE = 6;
const SWIPE_PX = 60;

// Renders "(…)" segments of a title smaller and dimmer than the main text.
function CarTitle({name}: {name: string}) {
  return name.split(/(\([^)]*\))/).map((part, i) =>
    part.startsWith("(") ? (
      <span key={i} className="text-lead text-zinc-400">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function PageArrow({dir, disabled, onClick}: {dir: "prev" | "next"; disabled: boolean; onClick: () => void}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous page" : "Next page"}
      className="pressable size-touch rounded-full border border-zinc-700 text-zinc-300 flex items-center justify-center active:bg-zinc-900 disabled:opacity-30"
    >
      <svg className="size-s4" viewBox="0 0 20 20" fill="none">
        <path
          d={dir === "prev" ? "M12 4l-6 6 6 6" : "M8 4l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function GarageView({cars}: {cars: Car[]}) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(cars.length / PER_PAGE));
  const pageCars = cars.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  // Horizontal swipe pages the grid; a swipe must not also open a car.
  const swipe = useRef<{x: number; moved: boolean} | null>(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  function go(delta: number) {
    setPage((p) => Math.min(pageCount - 1, Math.max(0, p + delta)));
  }

  return (
    <div className="screen bg-black">
      {/* Header */}
      <header
        className={`mx-page flex items-center justify-between gap-s4 pt-s6 pb-s3 border-b border-zinc-800 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <button
          onClick={() => router.push("/")}
          aria-label="Home"
          className="pressable min-h-touch flex items-center"
        >
          <Logo onDark className="w-[clamp(140px,16vmin,240px)] h-auto" />
        </button>

        <p className="font-inter text-caption tracking-[0.3em] uppercase text-zinc-500 text-right">
          Select a vehicle
        </p>
      </header>

      {/* Car Grid */}
      <main
        className="min-h-0 px-page py-s4"
        onPointerDown={(e) => (swipe.current = {x: e.clientX, moved: false})}
        onPointerMove={(e) => {
          if (swipe.current && Math.abs(e.clientX - swipe.current.x) > 12) swipe.current.moved = true;
        }}
        onPointerUp={(e) => {
          const s = swipe.current;
          if (!s) return;
          const dx = e.clientX - s.x;
          if (pageCount > 1 && Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
        }}
        onClickCapture={(e) => {
          if (swipe.current?.moved) {
            e.stopPropagation();
            e.preventDefault();
          }
          swipe.current = null;
        }}
      >
        {cars.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-inter text-caption tracking-[0.3em] uppercase text-zinc-600">
              No vehicles found
            </p>
          </div>
        ) : (
          <div
            key={page}
            className="h-full grid gap-s3 grid-cols-3 grid-rows-2 portrait:grid-cols-2 portrait:grid-rows-3"
          >
            {pageCars.map((car, i) => (
              <button
                key={car.id}
                onClick={() => router.push(`/car/${car.id}`)}
                data-nav-default={i === 0 ? "" : undefined}
                className="rise-in pressable group min-h-0 flex flex-col relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 active:border-white text-left"
                style={{animationDelay: `${150 + i * 60}ms`}}
              >
                {/* Car image area — w-full: older Chromium (webOS) doesn't stretch flex children of a <button> */}
                <div className="relative w-full flex-1 min-h-0 bg-zinc-950 overflow-hidden">
                  {/* Gradient floor */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />

                  {car.heroImage ? (
                    <Image
                      src={car.heroImage}
                      alt={car.model}
                      fill
                      loading="eager"
                      sizes="(orientation: portrait) 50vw, 33vw"
                      className="object-contain px-s3 pt-s3 transition-transform duration-500 group-active:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-1/3 h-auto text-zinc-700"
                        viewBox="0 0 100 50"
                        fill="currentColor"
                      >
                        <path d="M15 35 C15 35 20 20 35 18 L45 15 C50 13 55 13 60 15 L75 20 C82 22 85 28 85 35 L85 38 C85 40 83 42 81 42 L78 42 C77 38 74 35 70 35 C66 35 63 38 62 42 L38 42 C37 38 34 35 30 35 C26 35 23 38 22 42 L19 42 C17 42 15 40 15 38 Z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="w-full flex-none px-s3 pt-s2 pb-s3">
                  <p className="font-inter text-caption tracking-[0.3em] uppercase text-zinc-500 mb-s1">
                    {car.year}
                  </p>
                  <h2 className="font-bebas text-title tracking-wider text-white portrait:min-h-[2.2em]">
                    <CarTitle name={car.shortName} />
                  </h2>
                </div>

                {/* Tap / focus arrow */}
                <div className="absolute top-s2 right-s2 size-s6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-active:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200">
                  <svg className="size-s3" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7h8M7 3l4 4-4 4"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Footer: page controls (only when needed) + tagline */}
      <footer
        className={`flex flex-col items-center gap-s2 pb-s4 transition-all duration-700 delay-700 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        {pageCount > 1 && (
          <div className="flex items-center gap-s4">
            <PageArrow dir="prev" disabled={page === 0} onClick={() => go(-1)} />
            <div className="flex items-center gap-s1" aria-label={`Page ${page + 1} of ${pageCount}`}>
              {Array.from({length: pageCount}).map((_, i) => (
                <span
                  key={i}
                  className={`size-s2 rounded-full transition-colors ${i === page ? "bg-white" : "bg-zinc-700"}`}
                />
              ))}
            </div>
            <PageArrow dir="next" disabled={page === pageCount - 1} onClick={() => go(1)} />
          </div>
        )}
        <p className="font-inter text-caption tracking-[0.35em] uppercase text-zinc-700">
          There is no substitute.
        </p>
      </footer>
    </div>
  );
}
