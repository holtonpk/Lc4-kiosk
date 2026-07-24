"use client";
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import type {Car} from "@/lib/cars";
import Image from "next/image";

export default function GarageView({cars}: {cars: Car[]}) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  return (
    <div className="w-screen h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <header
        className={`flex-none flex items-center justify-between px-12 pt-10 pb-6 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <button
          onClick={() => router.push("/")}
          className="flex flex-col gap-0.5 group"
        >
          <span className="font-bebas text-4xl leading-none tracking-widest">
            LC<span className="text-[#FF0000]">4</span>
          </span>
          <span className="font-inter text-[10px] tracking-[0.35em] uppercase text-zinc-500">
            La Casita 4
          </span>
        </button>

        <div className="text-right">
          <p className="font-inter text-xs tracking-[0.3em] uppercase text-zinc-500">
            Select a vehicle
          </p>
        </div>
      </header>

      {/* Red rule */}
      <div
        className={`flex-none h-[1px] bg-zinc-800 mx-12 transition-all duration-700 delay-100 ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* Car Grid */}
      <main className="flex-1 overflow-y-auto scroll-container px-20 py-8 ">
        {cars.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-inter text-xs tracking-[0.3em] uppercase text-zinc-600">
              No vehicles found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 pb-8">
            {cars.map((car, i) => (
              <button
                key={car.id}
                onClick={() => router.push(`/car/${car.id}`)}
                className={`group flex flex-col relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 active:border-white transition-all duration-300 text-left ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{transitionDelay: `${150 + i * 60}ms`}}
              >
                {/* Car image area */}
                <div className="relative h-44 bg-zinc-950 flex items-end justify-center overflow-hidden">
                  {/* Gradient floor */}
                  <div className="absolute h-full bottom-0 left-0 right-0  bg-gradient-to-t from-zinc-900 to-transparent" />

                  {car.heroImage ? (
                    <Image
                      src={car.heroImage}
                      alt={car.model}
                      fill
                      className="object-contain group-hover:scale-105 p-4 pb-0 transition-transform duration-500 car-image "
                      onError={() => {}}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-24 h-24 text-zinc-700"
                        viewBox="0 0 100 50"
                        fill="currentColor"
                      >
                        <path d="M15 35 C15 35 20 20 35 18 L45 15 C50 13 55 13 60 15 L75 20 C82 22 85 28 85 35 L85 38 C85 40 83 42 81 42 L78 42 C77 38 74 35 70 35 C66 35 63 38 62 42 L38 42 C37 38 34 35 30 35 C26 35 23 38 22 42 L19 42 C17 42 15 40 15 38 Z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 pt-2">
                  <p className="font-inter text-[10px] tracking-[0.3em] uppercase text-zinc-500 mb-1">
                    {car.year}
                  </p>
                  <h2 className="font-bebas text-2xl tracking-wider text-white leading-tight">
                    {car.shortName}
                  </h2>
                  {/* {car.productionNumber && (
                    <p className="font-inter text-[10px] text-zinc-500 mt-1">
                      #{car.productionNumber}
                    </p>
                  )}
                  {car.usCount && (
                    <p className="font-inter text-[10px] text-zinc-600 mt-0.5">
                      {car.usCount}
                    </p>
                  )} */}
                </div>

                {/* Hover arrow */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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

      {/* Bottom tagline */}
      <div
        className={`flex-none pb-6 flex justify-center transition-all duration-700 delay-700 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <p className="font-inter text-[10px] tracking-[0.35em] uppercase text-zinc-700">
          There is no substitute.
        </p>
      </div>
    </div>
  );
}
