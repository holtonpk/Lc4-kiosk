import {unstable_cache} from "next/cache";
import {collection, doc, getDoc, getDocs, orderBy, query} from "firebase/firestore";
import {db} from "@/lib/firebase";
import type {Car} from "@/lib/cars";

export const CARS_TAG = "cars";

export const getAllCars = unstable_cache(
  async (): Promise<Car[]> => {
    const q = query(collection(db, "cars"), orderBy("year"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Car);
  },
  ["cars-all"],
  {tags: [CARS_TAG], revalidate: 3600},
);

export const getCarById = unstable_cache(
  async (id: string): Promise<Car | null> => {
    const snap = await getDoc(doc(db, "cars", id));
    return snap.exists() ? (snap.data() as Car) : null;
  },
  ["cars-by-id"],
  {tags: [CARS_TAG], revalidate: 3600},
);
