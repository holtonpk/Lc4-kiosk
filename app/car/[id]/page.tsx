import {getAllCars, getCarById} from "@/lib/cars-server";
import CarView from "./CarView";

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({id: car.id}));
}

export default async function CarPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const car = await getCarById(id);

  if (!car)
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500">Vehicle not found.</p>
      </div>
    );

  return <CarView car={car} />;
}
