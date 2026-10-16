"use client";
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import Logo from "@/components/Logo";
import type {Car} from "@/lib/cars";
import {useLiveCars} from "@/lib/useLiveCars";
import {useSwipePager} from "@/lib/useSwipePager";
import Image from "next/image";

// 3×2 in landscape, 2×3 in portrait — six cars per page either way.
const PER_PAGE = 6;

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

export default function GarageView({cars: initialCars}: {cars: Car[]}) {
  const router = useRouter();
  const cars = useLiveCars(initialCars);
  const [visible, setVisible] = useState(false);
  const [requestedPage, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(cars.length / PER_PAGE));
  // A car removed in the admin can shrink the page count under us.
  const page = Math.min(requestedPage, pageCount - 1);
  const pages = Array.from({length: pageCount}, (_, i) => cars.slice(i * PER_PAGE, (i + 1) * PER_PAGE));
  const {viewport, track, dragging, handlers} = useSwipePager(pageCount, page, setPage);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  function go(delta: number) {
    setPage(Math.min(pageCount - 1, Math.max(0, page + delta)));
  }

  // Remote: → from the last card in a row (← from the first) turns the page
  // and keeps focus on the same row.
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-card-index]");
    if (!card) return;
    const cols = matchMedia("(orientation: portrait)").matches ? 2 : 3;
    const i = Number(card.dataset.cardIndex);
    const col = i % cols;
    const delta = e.key === "ArrowRight" && col === cols - 1 ? 1 : e.key === "ArrowLeft" && col === 0 ? -1 : 0;
    const next = page + delta;
    if (!delta || next < 0 || next >= pageCount) return;
    e.preventDefault();
    setPage(next);
    const row = Math.floor(i / cols);
    const targetIndex = Math.min(row * cols + (delta > 0 ? 0 : cols - 1), pages[next].length - 1);
    requestAnimationFrame(() =>
      viewport.current
        ?.querySelector<HTMLElement>(`[data-page="${next}"] [data-card-index="${targetIndex}"]`)
        ?.focus({preventScroll: true}),
    );
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

      {/* Car grid — pages sit side by side; the track follows the finger */}
      <main
        ref={viewport}
        className="min-h-0 overflow-hidden"
        data-dragging={dragging ? "" : undefined}
        onKeyDown={onKeyDown}
        {...handlers}
      >
        {cars.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-inter text-caption tracking-[0.3em] uppercase text-zinc-600">
              No vehicles found
            </p>
          </div>
        ) : (
          <div ref={track} className="flex h-full will-change-transform">
            {pages.map((pageCars, p) => (
              <div
                key={p}
                data-page={p}
                inert={p !== page}
                aria-hidden={p !== page}
                className="w-full h-full flex-none px-page py-s4 grid gap-s3 grid-cols-3 grid-rows-2 portrait:grid-cols-2 portrait:grid-rows-3"
              >
                {pageCars.map((car, i) => (
                  <button
                    key={car.id}
                    onClick={() => router.push(`/car/${car.id}`)}
                    data-card-index={i}
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
                          // The current page and its neighbours load up front so a swipe never reveals blanks.
                          loading={Math.abs(p - page) <= 1 ? "eager" : "lazy"}
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
                    <div className="tap-arrow absolute top-s2 right-s2 size-s6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-active:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200">
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
                  className={`h-s2 rounded-full transition-all duration-300 ${i === page ? "w-s4 bg-white" : "w-s2 bg-zinc-700"}`}
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
