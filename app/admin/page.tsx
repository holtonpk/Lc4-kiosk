"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {useCars, deleteCar, type Car} from "@/lib/cars";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function AdminHomePage() {
  const router = useRouter();
  const {cars, loading} = useCars();
  const [toDelete, setToDelete] = useState<Car | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    await deleteCar(toDelete.id);
    setDeleting(false);
    setToDelete(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">Your Vehicles</h1>
        <button
          onClick={() => router.push("/admin/new")}
          className="rounded-xl bg-[#FF0000] px-6 py-4 text-lg font-semibold text-white shadow hover:bg-red-700 transition-colors"
        >
          + Add New Vehicle
        </button>
      </div>

      {loading ? (
        <p className="text-lg text-zinc-500">Loading vehicles…</p>
      ) : cars.length === 0 ? (
        <p className="text-lg text-zinc-500">
          No vehicles yet. Tap &quot;Add New Vehicle&quot; to add your first
          one.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {cars.map((car) => (
            <div
              key={car.id}
              className="rounded-2xl bg-white shadow overflow-hidden flex flex-col"
            >
              <button
                onClick={() => router.push(`/admin/${car.id}`)}
                className="text-left flex-1"
              >
                <div className="relative h-36 bg-zinc-100">
                  {car.heroImage ? (
                    <Image
                      src={car.heroImage}
                      alt={car.shortName}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
                      No photo yet
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-zinc-500">{car.year}</p>
                  <p className="text-xl font-bold text-zinc-900">
                    {car.shortName || "Untitled Vehicle"}
                  </p>
                </div>
              </button>
              <div className="flex gap-2 px-4 pb-4">
                <button
                  onClick={() => router.push(`/admin/${car.id}`)}
                  className="flex-1 rounded-lg bg-zinc-900 text-white py-2.5 text-sm font-semibold hover:bg-zinc-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => setToDelete(car)}
                  className="rounded-lg border border-zinc-300 text-zinc-600 px-3 py-2.5 text-sm font-semibold hover:bg-zinc-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Remove this vehicle?"
        message={`"${toDelete?.shortName || "This vehicle"}" will be permanently removed from the kiosk. This can't be undone.`}
        confirmLabel={deleting ? "Removing…" : "Yes, Remove It"}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
