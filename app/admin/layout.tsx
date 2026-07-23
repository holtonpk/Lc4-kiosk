"use client";
import {useState} from "react";
import {useAdminAuth} from "@/lib/adminAuth";

const PIN_LENGTH = (process.env.NEXT_PUBLIC_ADMIN_PIN || "").length || 4;

function PinScreen({unlock}: {unlock: (pin: string) => Promise<boolean>}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  async function press(digit: string) {
    if (checking) return;
    const next = (pin + digit).slice(0, PIN_LENGTH);
    setPin(next);
    setError(false);

    if (next.length === PIN_LENGTH) {
      setChecking(true);
      const ok = await unlock(next);
      if (!ok) {
        setError(true);
        setPin("");
      }
      setChecking(false);
    }
  }

  function backspace() {
    if (checking) return;
    setPin((p) => p.slice(0, -1));
    setError(false);
  }

  return (
    <div className="h-screen overflow-y-auto scroll-container bg-zinc-100 flex flex-col items-center justify-center px-6 py-12">
      <p className="font-bebas text-5xl tracking-widest text-zinc-900 mb-2">
        LC<span className="text-[#FF0000]">4</span> Vehicle Manager
      </p>
      <p className="text-zinc-500 text-lg mb-10">Enter the PIN to make changes</p>

      <div className="flex gap-4 mb-10" aria-live="polite">
        {Array.from({length: PIN_LENGTH}).map((_, i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full border-2 transition-colors ${
              i < pin.length ? "bg-zinc-900 border-zinc-900" : "border-zinc-400"
            } ${error ? "border-red-500" : ""}`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-600 text-lg font-semibold mb-6">
          That PIN isn&apos;t right — try again.
        </p>
      )}

      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            disabled={checking}
            className="aspect-square rounded-2xl bg-white shadow text-3xl font-semibold text-zinc-900 active:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {d}
          </button>
        ))}
        <button
          onClick={backspace}
          disabled={checking}
          className="aspect-square rounded-2xl bg-white shadow text-lg font-semibold text-zinc-500 active:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          Clear
        </button>
        <button
          onClick={() => press("0")}
          disabled={checking}
          className="aspect-square rounded-2xl bg-white shadow text-3xl font-semibold text-zinc-900 active:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          0
        </button>
        <div />
      </div>
    </div>
  );
}

export default function AdminLayout({children}: {children: React.ReactNode}) {
  const {ready, authed, unlock, lock} = useAdminAuth();

  if (!ready) {
    return <div className="min-h-screen bg-zinc-100" />;
  }

  if (!authed) {
    return <PinScreen unlock={unlock} />;
  }

  return (
    <div className="h-screen overflow-y-auto scroll-container bg-zinc-100">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 sticky top-0 z-40">
        <p className="font-bebas text-2xl tracking-widest text-zinc-900">
          LC<span className="text-[#FF0000]">4</span> Vehicle Manager
        </p>
        <button
          onClick={lock}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
        >
          Lock
        </button>
      </header>
      <main className="px-6 py-8 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
