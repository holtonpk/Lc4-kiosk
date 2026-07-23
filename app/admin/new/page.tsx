"use client";
import CarForm from "@/components/CarForm";

export default function NewCarPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-zinc-900 mb-6">Add New Vehicle</h1>
      <CarForm mode="new" />
    </div>
  );
}
