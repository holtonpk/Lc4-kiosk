"use client";
import {use} from "react";
import {useRouter} from "next/navigation";
import {useCar} from "@/lib/cars";
import CarForm from "@/components/CarForm";

export default function EditCarPage({params}: {params: Promise<{id: string}>}) {
  const {id} = use(params);
  const router = useRouter();
  const {car, loading} = useCar(id);

  if (loading) return <p className="text-lg text-zinc-500">Loading vehicle…</p>;

  if (!car)
    return (
      <div>
        <p className="text-lg text-zinc-500 mb-4">That vehicle couldn&apos;t be found.</p>
        <button
          onClick={() => router.push("/admin")}
          className="text-sm font-semibold text-zinc-700 hover:text-zinc-900"
        >
          ← Back to All Vehicles
        </button>
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl font-bold text-zinc-900 mb-6">
        Edit {car.shortName || "Vehicle"}
      </h1>
      <CarForm mode="edit" car={car} />
    </div>
  );
}
