"use client";
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import type {Car} from "@/lib/cars";
import Image from "next/image";

type Tab = "specs" | "videos" | "photos";
type LightboxMedia = {type: "image" | "video"; src: string; title?: string};
type LightboxState = {items: LightboxMedia[]; index: number} | null;

function ExpandIcon() {
  return (
    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center pointer-events-none">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function PlayIcon() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
          <path d="M5 3l8 5-8 5V3z" fill="white" />
        </svg>
      </div>
    </div>
  );
}

function NavArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={direction === "prev" ? "Previous" : "Next"}
      className={`absolute top-1/2 -translate-y-1/2 ${direction === "prev" ? "left-3 sm:left-6" : "right-3 sm:right-6"} w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white transition-colors z-10`}
    >
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <path
          d={direction === "prev" ? "M12 4l-6 6 6 6" : "M8 4l6 6-6 6"}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function Lightbox({
  state,
  onClose,
  onNavigate,
}: {
  state: LightboxState;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const count = state?.items.length ?? 0;
  const item = state ? state.items[state.index] : null;

  useEffect(() => {
    if (!state) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((state!.index - 1 + count) % count);
      if (e.key === "ArrowRight") onNavigate((state!.index + 1) % count);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, count, onClose, onNavigate]);

  if (!state || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 sm:p-12"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white transition-colors z-10"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 4l12 12M16 4L4 16"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {count > 1 && (
        <>
          <NavArrow
            direction="prev"
            onClick={() => onNavigate((state.index - 1 + count) % count)}
          />
          <NavArrow
            direction="next"
            onClick={() => onNavigate((state.index + 1) % count)}
          />
        </>
      )}

      <div
        className="flex flex-col items-center gap-3 max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt=""
            className="max-w-full max-h-[85vh] object-contain"
          />
        ) : (
          <video
            key={item.src}
            src={item.src}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[85vh]"
          />
        )}
        {item.title && (
          <p className="font-inter text-sm text-zinc-300">{item.title}</p>
        )}
        {count > 1 && (
          <p className="font-inter text-xs tracking-[0.2em] text-zinc-500">
            {state.index + 1} / {count}
          </p>
        )}
      </div>
    </div>
  );
}

function useCountUp(
  target: number,
  duration: number = 1400,
  start: boolean = false,
) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let step = 0;
    const steps = 30;
    const timer = setInterval(() => {
      step++;
      const progress = 1 - Math.pow(1 - step / steps, 3);
      setValue(Math.round(progress * target));
      if (step >= steps) {
        setValue(target);
        clearInterval(timer);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return value;
}

function StatPill({
  value,
  decimals = 0,
  unit,
  label,
  animate,
}: {
  value: number;
  decimals?: number;
  unit: string;
  label: string;
  animate: boolean;
}) {
  const raw = useCountUp(
    Math.round(value * Math.pow(10, decimals)),
    1400,
    animate,
  );
  const display =
    decimals > 0
      ? (raw / Math.pow(10, decimals)).toFixed(decimals)
      : raw.toString();
  return (
    <div className="flex-1 flex flex-col items-center py-5 border-r border-zinc-800 last:border-r-0">
      <div className="flex items-end gap-1 leading-none mb-1.5">
        <span className="font-bebas text-[clamp(32px,3.5vw,48px)] text-white tabular-nums leading-none">
          {display}
        </span>
        <span className="font-bebas text-[clamp(14px,1.5vw,20px)] text-zinc-500 leading-none mb-0.5">
          {unit}
        </span>
      </div>
      <span className="font-inter text-[9px] tracking-[0.3em] uppercase text-zinc-600">
        {label}
      </span>
    </div>
  );
}

export default function CarView({car}: {car: Car}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("specs");
  const [visible, setVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => setStatsVisible(true), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const hp = parseInt(
    car.specs.engine.find((s) => s.includes("hp"))?.match(/(\d+)\s*hp/)?.[1] ||
      "0",
  );
  const speed = parseInt(
    car.specs.performance
      .find((s) => s.includes("Top Speed"))
      ?.match(/(\d+)\s*mph/)?.[1] || "0",
  );
  const zeroSixty = parseFloat(
    car.specs.performance
      .find((s) => s.includes("0–60"))
      ?.match(/([\d.]+)\s*seconds/)?.[1] || "0",
  );
  const hasStats = hp > 0 || speed > 0 || zeroSixty > 0;

  return (
    <div className="w-screen h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <header
        className={`flex-none flex items-center justify-between px-10 pt-8 pb-4 transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center group"
            aria-label="Home"
          >
            <span className="font-bebas text-3xl leading-none tracking-widest group-hover:text-zinc-300 transition-colors">
              LC<span className="text-[#FF0000]">4</span>
            </span>
          </button>
          <button
            onClick={() => router.push("/garage")}
            className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 active:bg-zinc-900 transition-colors"
            aria-label="Back to all vehicles"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M13 4l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-inter text-xs tracking-[0.2em] uppercase">
              All Vehicles
            </span>
          </button>
        </div>
        <div className="text-right">
          <p className="font-inter text-[10px] tracking-[0.3em] uppercase text-zinc-500">
            {car.year}
          </p>
          <h1 className="font-bebas text-2xl tracking-wider">
            {car.shortName}
          </h1>
        </div>
      </header>

      <div className="flex-none h-[1px] bg-[#FF0000] opacity-50" />

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — pure hero image */}
        <div
          className={`w-[42%] flex-none relative bg-zinc-950 border-r border-zinc-900 transition-all duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_55%,rgba(55,55,55,0.2),transparent)]" />

          {car.heroImage ? (
            <button
              onClick={() =>
                setLightbox({
                  items: [{type: "image", src: car.heroImage}],
                  index: 0,
                })
              }
              className="absolute inset-0 cursor-pointer"
              aria-label="View full screen"
            >
              <Image
                src={car.heroImage}
                alt={car.model}
                fill
                className="object-contain p-10"
              />
              <ExpandIcon />
            </button>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-zinc-700">
              <svg
                className="w-32 h-32"
                viewBox="0 0 100 50"
                fill="currentColor"
              >
                <path d="M15 35 C15 35 20 20 35 18 L45 15 C50 13 55 13 60 15 L75 20 C82 22 85 28 85 35 L85 38 C85 40 83 42 81 42 L78 42 C77 38 74 35 70 35 C66 35 63 38 62 42 L38 42 C37 38 34 35 30 35 C26 35 23 38 22 42 L19 42 C17 42 15 40 15 38 Z" />
              </svg>
              <span className="font-inter text-xs tracking-widest uppercase">
                Photo coming soon
              </span>
            </div>
          )}

          {/* Ghosted production watermark */}
          {car.productionNumber && (
            <div className="absolute bottom-6 left-8">
              <p className="font-bebas text-[52px] text-white/[0.05] leading-none tracking-widest select-none">
                {car.productionNumber}
              </p>
              {car.usCount && (
                <p className="font-inter text-[10px] text-zinc-800 tracking-wider">
                  {car.usCount}
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — info, stats, tabs */}
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}
        >
          {/* Car name + tagline + stats */}
          <div className="flex-none px-10 pt-8 pb-5">
            <h2 className="font-bebas text-[clamp(30px,3.8vw,56px)] leading-none tracking-wide">
              {car.model}
            </h2>
            <p className="font-inter text-sm text-zinc-500 mt-2 leading-relaxed">
              {car.tagline}
            </p>

            {hasStats && (
              <div className="flex mt-5 border border-zinc-800 rounded-2xl overflow-hidden">
                {hp > 0 && (
                  <StatPill
                    value={hp}
                    unit="hp"
                    label="Power"
                    animate={statsVisible}
                  />
                )}
                {speed > 0 && (
                  <StatPill
                    value={speed}
                    unit="mph"
                    label="Top Speed"
                    animate={statsVisible}
                  />
                )}
                {zeroSixty > 0 && (
                  <StatPill
                    value={zeroSixty}
                    decimals={1}
                    unit="sec"
                    label="0 – 60 mph"
                    animate={statsVisible}
                  />
                )}
              </div>
            )}
          </div>

          {/* Tab buttons */}
          <div className="flex-none px-10">
            <div className="flex gap-2">
              {[
                {
                  key: "specs" as Tab,
                  label: "Specs",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2.5 12a5.5 5.5 0 1 1 11 0"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8 12l3-4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle cx="8" cy="12" r="1" fill="currentColor" />
                    </svg>
                  ),
                },

                {
                  key: "photos" as Tab,
                  label: "Photos",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <rect
                        x="1"
                        y="3"
                        width="14"
                        height="10"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="8"
                        cy="8"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  ),
                },
                {
                  key: "videos" as Tab,
                  label: "Videos",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M4 3l9 5-9 5V3z" fill="currentColor" />
                    </svg>
                  ),
                },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-inter text-xs tracking-[0.2em] uppercase transition-all duration-200 ${
                    tab === t.key
                      ? "bg-white text-black"
                      : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-none h-[1px] bg-zinc-900 mx-10 mt-5" />

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto scroll-container px-10 py-6">
            {tab === "specs" && <SpecsTab car={car} />}
            {tab === "videos" && (
              <VideosTab
                car={car}
                onOpen={(index) =>
                  setLightbox({
                    items: car.videos.map((v) => ({
                      type: "video",
                      src: v.url,
                      title: v.title,
                    })),
                    index,
                  })
                }
              />
            )}
            {tab === "photos" && (
              <PhotosTab
                car={car}
                onOpen={(index) =>
                  setLightbox({
                    items: car.photos.map((src) => ({type: "image", src})),
                    index,
                  })
                }
              />
            )}
          </div>
        </div>
      </div>

      <Lightbox
        state={lightbox}
        onClose={() => setLightbox(null)}
        onNavigate={(index) =>
          setLightbox((prev) => (prev ? {...prev, index} : prev))
        }
      />
    </div>
  );
}

function SpecsTab({car}: {car: Car}) {
  const sections = [
    {label: "Engine", items: car.specs.engine},
    {label: "Drivetrain & Transmission", items: car.specs.drivetrain},
    {label: "Performance", items: car.specs.performance},
    {label: "Body & Dimensions", items: car.specs.dimensions},
  ];
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
      {sections.map((section) => (
        <div key={section.label}>
          <h3 className="font-inter text-[10px] tracking-[0.4em] uppercase text-zinc-500 mb-3 pb-2 border-b border-zinc-900">
            {section.label}
          </h3>
          <div className="flex flex-col gap-2">
            {section.items.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-[7px] w-1 h-1 rounded-full bg-[#FF0000] flex-none" />
                <span className="font-inter text-sm text-zinc-300 leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function VideosTab({car, onOpen}: {car: Car; onOpen: (index: number) => void}) {
  if (car.videos.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-4">
        <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M5 4l12 7-12 7V4z" fill="#444" />
          </svg>
        </div>
        <p className="font-inter text-xs text-zinc-600 tracking-widest uppercase">
          Videos coming soon
        </p>
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-4">
      {car.videos.map((v, i) => (
        <button
          key={i}
          onClick={() => onOpen(i)}
          className="text-left rounded-xl overflow-hidden bg-zinc-900 cursor-pointer"
        >
          <div className="relative w-full aspect-video bg-black">
            <video
              src={v.url}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <PlayIcon />
          </div>
          {v.title && (
            <p className="font-inter text-sm text-zinc-300 px-3 py-2">
              {v.title}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}

function PhotosTab({car, onOpen}: {car: Car; onOpen: (index: number) => void}) {
  if (car.photos.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-4">
        <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect
              x="2"
              y="4"
              width="18"
              height="14"
              rx="2"
              stroke="#444"
              strokeWidth="1.5"
            />
            <circle cx="11" cy="11" r="3" stroke="#444" strokeWidth="1.5" />
          </svg>
        </div>
        <p className="font-inter text-xs text-zinc-600 tracking-widest uppercase">
          Photos coming soon
        </p>
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-3">
      {car.photos.map((src, i) => (
        <button
          key={i}
          onClick={() => onOpen(i)}
          className="aspect-video relative rounded-xl overflow-hidden bg-zinc-900 cursor-pointer"
          aria-label="View full screen"
        >
          <Image
            src={src}
            alt={`Photo ${i + 1}`}
            fill
            className="object-cover"
          />
          <ExpandIcon />
        </button>
      ))}
    </div>
  );
}
