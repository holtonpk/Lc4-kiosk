"use client";
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import type {Car} from "@/lib/cars";
import Image from "next/image";
import {youTubeId, youTubeThumbnail, youTubeEmbed} from "@/lib/youtube";
import {useFitGrid, useFitScale} from "@/lib/useFit";

type Tab = "specs" | "videos" | "photos";
type LightboxMedia = {type: "image" | "video" | "youtube"; src: string; title?: string};
type LightboxState = {items: LightboxMedia[]; index: number} | null;

function ExpandIcon() {
  return (
    <div className="absolute top-s2 right-s2 size-s6 rounded-full bg-black/50 flex items-center justify-center pointer-events-none">
      <svg className="size-s3" viewBox="0 0 16 16" fill="none">
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
      <div className="size-s8 rounded-full bg-black/60 flex items-center justify-center">
        <svg className="size-s4" viewBox="0 0 16 16" fill="none">
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
      className={`absolute top-1/2 -translate-y-1/2 ${direction === "prev" ? "left-s3" : "right-s3"} pressable size-touch rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white transition-colors z-10`}
    >
      <svg className="size-s4" viewBox="0 0 20 20" fill="none">
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
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-page"
      onClick={onClose}
      data-nav-scope
      data-nav-own-arrows="x"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-s3 right-s3 pressable size-touch rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white transition-colors z-10"
      >
        <svg className="size-s3" viewBox="0 0 20 20" fill="none">
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
        className="flex flex-col items-center gap-s2 max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt=""
            className="max-w-full max-h-[85vh] object-contain"
          />
        ) : item.type === "youtube" ? (
          <div className="w-[min(88vw,calc(80vh*16/9))] aspect-video rounded-lg overflow-hidden bg-black shadow-2xl">
            <iframe
              key={item.src}
              src={youTubeEmbed(item.src, {autoplay: true})}
              title={item.title || "Video"}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
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
          <p className="font-inter text-body text-zinc-300">{item.title}</p>
        )}
        {count > 1 && (
          <p className="font-inter text-caption tracking-[0.2em] text-zinc-500">
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
    <div className="flex-1 flex flex-col items-center py-s2 border-r border-zinc-800 last:border-r-0">
      <div className="flex items-end gap-0.5 leading-none mb-s1">
        <span className="font-bebas text-headline text-white tabular-nums leading-none">
          {display}
        </span>
        <span className="font-bebas text-lead text-zinc-500 leading-none mb-1">
          {unit}
        </span>
      </div>
      <span className="font-inter text-caption tracking-[0.3em] uppercase text-white">
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

  const hp =
    car.horsepower ??
    parseInt(
      car.specs.engine
        .find((s) => s.includes("hp"))
        ?.match(/(\d+)\s*hp/)?.[1] || "0",
    );
  const speed =
    car.topSpeed ??
    parseInt(
      car.specs.performance
        .find((s) => s.includes("Top Speed"))
        ?.match(/(\d+)\s*mph/)?.[1] || "0",
    );
  const zeroSixty =
    car.zeroToSixty ??
    parseFloat(
      car.specs.performance
        .find((s) => s.includes("0–60"))
        ?.match(/([\d.]+)\s*seconds/)?.[1] || "0",
    );
  const hasStats = hp > 0 || speed > 0 || zeroSixty > 0;

  const tabs: {key: Tab; label: string; icon: React.ReactNode}[] = [
    {
      key: "specs",
      label: "Specs",
      icon: (
        <svg className="size-s3" viewBox="0 0 16 16" fill="none">
          <path d="M2.5 12a5.5 5.5 0 1 1 11 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 12l3-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="12" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      key: "photos",
      label: "Photos",
      icon: (
        <svg className="size-s3" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      key: "videos",
      label: "Videos",
      icon: (
        <svg className="size-s3" viewBox="0 0 16 16" fill="none">
          <path d="M4 3l9 5-9 5V3z" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <div className="screen bg-black">
      {/* Header */}
      <header
        className={`flex items-center justify-between gap-s4 px-page pt-s4 pb-s3 border-b border-[#5B9BD5]/50 transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <button
          onClick={() => router.push("/garage")}
          className="pressable min-h-touch flex items-center gap-s2 pl-s3 pr-s4 rounded-full border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 active:bg-zinc-900"
          aria-label="Back to all vehicles"
        >
          <svg className="size-s3" viewBox="0 0 20 20" fill="none">
            <path
              d="M13 4l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-inter text-caption tracking-[0.2em] uppercase">
            All Vehicles
          </span>
        </button>
        <div className="text-right">
          <p className="font-inter text-caption tracking-[0.3em] uppercase text-zinc-500">
            {car.year}
          </p>
          <h1 className="font-bebas text-title tracking-wider">
            {car.shortName}
          </h1>
        </div>
      </header>

      {/* Main layout: hero beside the info (landscape) or above it (portrait) */}
      <div className="min-h-0 grid grid-cols-[36fr_64fr] portrait:grid-cols-1 portrait:grid-rows-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Hero image */}
        <div
          className={`relative min-h-0 bg-zinc-950 border-zinc-900 landscape:border-r portrait:border-b transition-all duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
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
              className="pressable absolute inset-0 cursor-pointer"
              aria-label="View full screen"
            >
              <Image
                src={car.heroImage}
                alt={car.model}
                fill
                loading="eager"
                sizes="(orientation: portrait) 100vw, 36vw"
                className="object-contain p-s6"
              />
              <ExpandIcon />
            </button>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-s2 text-zinc-700">
              <svg className="w-1/3 h-auto" viewBox="0 0 100 50" fill="currentColor">
                <path d="M15 35 C15 35 20 20 35 18 L45 15 C50 13 55 13 60 15 L75 20 C82 22 85 28 85 35 L85 38 C85 40 83 42 81 42 L78 42 C77 38 74 35 70 35 C66 35 63 38 62 42 L38 42 C37 38 34 35 30 35 C26 35 23 38 22 42 L19 42 C17 42 15 40 15 38 Z" />
              </svg>
              <span className="font-inter text-caption tracking-widest uppercase">
                Photo coming soon
              </span>
            </div>
          )}

          {/* Ghosted production watermark */}
          {car.productionNumber && (
            <div className="absolute bottom-s3 left-s4 right-s4 pointer-events-none">
              <p className="font-bebas text-[clamp(40px,4.815vmin,72px)] text-white/[0.05] leading-none tracking-widest truncate">
                {car.productionNumber}
              </p>
              {car.usCount && (
                <p className="font-inter text-caption text-zinc-800 tracking-wider">
                  {car.usCount}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Info, stats, tabs — the tab panel takes whatever height is left */}
        <div
          className={`min-h-0 flex flex-col gap-s3 px-page pt-s4 pb-s6 transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}
        >
          <div className="flex-none">
            <h2 className="font-bebas text-headline tracking-wide">
              {car.model}
            </h2>
            <p className="font-inter text-body text-zinc-500 mt-s1">
              {car.tagline}
            </p>
          </div>

          {hasStats && (
            <div className="flex-none flex border border-zinc-800 rounded-2xl overflow-hidden">
              {hp > 0 && <StatPill value={hp} unit="hp" label="Power" animate={statsVisible} />}
              {speed > 0 && <StatPill value={speed} unit="mph" label="Top Speed" animate={statsVisible} />}
              {zeroSixty > 0 && (
                <StatPill value={zeroSixty} decimals={1} unit="sec" label="0 – 60 mph" animate={statsVisible} />
              )}
            </div>
          )}

          {/* Tab buttons */}
          <div className="flex-none flex gap-s2 pb-s3 border-b border-zinc-900" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`pressable min-h-touch flex items-center gap-s2 px-s4 rounded-xl font-inter text-caption tracking-[0.2em] uppercase ${
                  tab === t.key
                    ? "bg-white text-black"
                    : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 active:bg-zinc-800"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content — sized to fit, never scrolls */}
          <div className="flex-1 min-h-0">
            {tab === "specs" && <SpecsTab car={car} />}
            {tab === "videos" && (
              <VideosTab
                car={car}
                onOpen={(index) =>
                  setLightbox({
                    items: car.videos.map((v): LightboxMedia => {
                      const ytId = youTubeId(v.url);
                      return ytId
                        ? {type: "youtube", src: ytId, title: v.title}
                        : {type: "video", src: v.url, title: v.title};
                    }),
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

function SpecItem({text}: {text: string}) {
  const i = text.indexOf(":");
  if (i === -1) return <>{text}</>;
  return (
    <>
      <span className="font-semibold text-white">{text.slice(0, i + 1)}</span>
      {text.slice(i + 1)}
    </>
  );
}

// Every spec stays on screen at once: two balanced columns at body size,
// shrinking slightly (to no less than ~20px) only if a long CMS entry needs it.
function SpecsTab({car}: {car: Car}) {
  const sections = [
    {label: "Engine", items: car.specs.engine},
    {label: "Drivetrain & Transmission", items: car.specs.drivetrain},
    {label: "Performance", items: car.specs.performance},
    {label: "Body & Dimensions", items: car.specs.dimensions},
  ].filter((s) => s.items.length > 0);
  const {box, content} = useFitScale([car.id]);
  return (
    <div ref={box} className="h-full">
      <div ref={content} className="columns-2 gap-x-s6">
        {sections.map((section) => (
          <div key={section.label} className="break-inside-avoid pb-s4">
            <h3 className="font-inter text-caption tracking-[0.3em] uppercase text-zinc-500 mb-s2 pb-s1 border-b border-zinc-900">
              {section.label}
            </h3>
            <div className="flex flex-col gap-s1">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-start gap-s2">
                  <span className="mt-[0.6em] size-1.5 rounded-full bg-[#5B9BD5] flex-none" />
                  <span className="font-inter text-[calc(var(--text-body)*var(--fit,1))] leading-[1.35] text-zinc-300">
                    <SpecItem text={item} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoThumb({url, width}: {url: string; width: number}) {
  const ytId = youTubeId(url);
  if (ytId)
    return (
      <Image
        src={youTubeThumbnail(ytId)}
        alt=""
        fill
        sizes={`${width}px`}
        className="object-cover"
      />
    );
  return (
    <video
      src={url}
      playsInline
      muted
      className="w-full h-full object-cover"
    />
  );
}

function EmptyTab({icon, label}: {icon: React.ReactNode; label: string}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-s3">
      <div className="size-s8 rounded-full bg-zinc-900 flex items-center justify-center">
        {icon}
      </div>
      <p className="font-inter text-caption text-zinc-600 tracking-widest uppercase">
        {label}
      </p>
    </div>
  );
}

// All videos on screen at once; the grid picks the largest tile that fits.
function VideosTab({car, onOpen}: {car: Car; onOpen: (index: number) => void}) {
  const {ref, cols, tileW} = useFitGrid(car.videos.length, 16 / 9);
  if (car.videos.length === 0)
    return (
      <EmptyTab
        label="Videos coming soon"
        icon={
          <svg className="size-s4" viewBox="0 0 22 22" fill="none">
            <path d="M5 4l12 7-12 7V4z" fill="#444" />
          </svg>
        }
      />
    );
  return (
    <div
      ref={ref}
      className="h-full grid gap-s2 content-start"
      style={{gridTemplateColumns: `repeat(${cols}, ${tileW}px)`}}
    >
      {car.videos.map((v, i) => (
        <button
          key={i}
          onClick={() => onOpen(i)}
          className="pressable flex flex-col text-left rounded-xl overflow-hidden bg-zinc-900 cursor-pointer"
        >
          <div className="relative w-full aspect-video bg-black">
            <VideoThumb url={v.url} width={tileW} />
            <PlayIcon />
          </div>
          <div data-fit-extra className="w-full px-s2 py-s1 font-inter text-body text-zinc-300">
            <p className="h-[2.7em] line-clamp-2">{v.title || " "}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// All photos on screen at once as tiles; tap one for the full-screen viewer.
function PhotosTab({car, onOpen}: {car: Car; onOpen: (index: number) => void}) {
  const {ref, cols, tileW} = useFitGrid(car.photos.length, 16 / 9);
  if (car.photos.length === 0)
    return (
      <EmptyTab
        label="Photos coming soon"
        icon={
          <svg className="size-s4" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="4" width="18" height="14" rx="2" stroke="#444" strokeWidth="1.5" />
            <circle cx="11" cy="11" r="3" stroke="#444" strokeWidth="1.5" />
          </svg>
        }
      />
    );
  return (
    <div
      ref={ref}
      className="h-full grid gap-s2 content-start"
      style={{gridTemplateColumns: `repeat(${cols}, ${tileW}px)`}}
    >
      {car.photos.map((src, i) => (
        <button
          key={i}
          onClick={() => onOpen(i)}
          className="pressable aspect-video relative rounded-xl overflow-hidden bg-zinc-900 cursor-pointer"
          aria-label={`View photo ${i + 1} full screen`}
        >
          <Image
            src={src}
            alt={`Photo ${i + 1}`}
            fill
            sizes={`${tileW}px`}
            className="object-cover"
          />
          <ExpandIcon />
        </button>
      ))}
    </div>
  );
}
