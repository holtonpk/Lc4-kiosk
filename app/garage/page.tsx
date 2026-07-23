import {getAllCars} from "@/lib/cars-server";
import GarageView from "./GarageView";

export default async function GaragePage() {
  const cars = await getAllCars();
  return <GarageView cars={cars} />;
}
