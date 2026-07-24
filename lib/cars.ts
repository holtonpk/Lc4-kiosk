import {useEffect, useState} from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import {db} from "@/lib/firebase";

export interface CarSpec {
  engine: string[];
  drivetrain: string[];
  performance: string[];
  dimensions: string[];
}

export interface Car {
  id: string;
  year: number;
  model: string;
  shortName: string;
  edition?: string;
  productionNumber?: string;
  usCount?: string;
  tagline: string;
  heroImage: string;
  horsepower?: number;
  topSpeed?: number;
  zeroToSixty?: number;
  specs: CarSpec;
  videos: {title: string; url: string}[];
  photos: string[];
}

const CARS_COLLECTION = "cars";

export function useCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, CARS_COLLECTION), orderBy("year"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCars(snapshot.docs.map((d) => d.data() as Car));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return {cars, loading};
}

export function useCar(id: string) {
  const [car, setCar] = useState<Car | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, CARS_COLLECTION, id), (snapshot) => {
      setCar(snapshot.exists() ? (snapshot.data() as Car) : undefined);
      setLoading(false);
    });
    return unsubscribe;
  }, [id]);

  return {car, loading};
}

export function newCarId(): string {
  return `car-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

async function revalidateKiosk(): Promise<void> {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: {"x-revalidate-secret": process.env.NEXT_PUBLIC_ADMIN_PIN || ""},
    });
  } catch {
    // Best-effort — the kiosk will still pick up the change on its next
    // time-based revalidation even if this immediate refresh fails.
  }
}

export async function saveCar(car: Car): Promise<void> {
  await setDoc(doc(db, CARS_COLLECTION, car.id), car);
  await revalidateKiosk();
}

export async function deleteCar(id: string): Promise<void> {
  await deleteDoc(doc(db, CARS_COLLECTION, id));
  await revalidateKiosk();
}

export const emptyCar = (): Omit<Car, "id"> => ({
  year: new Date().getFullYear(),
  model: "",
  shortName: "",
  edition: "",
  productionNumber: "",
  usCount: "",
  tagline: "",
  heroImage: "",
  horsepower: undefined,
  topSpeed: undefined,
  zeroToSixty: undefined,
  specs: {engine: [], drivetrain: [], performance: [], dimensions: []},
  videos: [],
  photos: [],
});
