import {useEffect, useState} from "react";
import type {Car} from "@/lib/cars";

// Live kiosk data. Pages render instantly from the server-provided cars, then
// — once the browser is idle, so first paint isn't slowed — Firestore is
// loaded lazily and any admin change is applied in place, with no refresh.

type Unsubscribe = () => void;

function afterIdle(start: () => Promise<Unsubscribe>): Unsubscribe {
  let unsubscribe: Unsubscribe | null = null;
  let cancelled = false;
  let idleId = 0;
  const run = () =>
    start().then((u) => {
      if (cancelled) u();
      else unsubscribe = u;
    });
  // Wait for the page (images included) to finish loading, then for an idle
  // moment, so the live connection never competes with what's on screen.
  const schedule = () => {
    if (!cancelled) idleId = window.requestIdleCallback(run, {timeout: 2000});
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, {once: true});
  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    window.cancelIdleCallback(idleId);
    unsubscribe?.();
  };
}

// All visible cars, in the same order as the server query.
export function useLiveCars(initial: Car[]): Car[] {
  const [cars, setCars] = useState(initial);
  useEffect(
    () =>
      afterIdle(async () => {
        const [{collection, onSnapshot, orderBy, query}, {db}] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebaseCore"),
        ]);
        return onSnapshot(query(collection(db, "cars"), orderBy("year")), (snap) => {
          // Offline, Firestore reports an empty local cache — never let that blank the garage.
          if (snap.metadata.fromCache) return;
          setCars(snap.docs.map((d) => d.data() as Car).filter((c) => !c.hidden));
        });
      }),
    [],
  );
  return cars;
}

// One car; null once it's deleted or hidden in the admin.
export function useLiveCar(initial: Car): Car | null {
  const [car, setCar] = useState<Car | null>(initial);
  useEffect(
    () =>
      afterIdle(async () => {
        const [{doc, onSnapshot}, {db}] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebaseCore"),
        ]);
        return onSnapshot(doc(db, "cars", initial.id), (snap) => {
          // Offline, a cache miss looks like "deleted" — only trust the server.
          if (snap.metadata.fromCache) return;
          const next = snap.exists() ? (snap.data() as Car) : null;
          setCar(next && !next.hidden ? next : null);
        });
      }),
    [initial.id],
  );
  return car;
}
