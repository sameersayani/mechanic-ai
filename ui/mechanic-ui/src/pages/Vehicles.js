import VehicleForm from "../components/VehicleForm";
import VehicleList from "../components/VehicleList";

export default function Vehicles() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Vehicles</h1>
      <VehicleForm />
      <VehicleList />
    </div>
  );
}