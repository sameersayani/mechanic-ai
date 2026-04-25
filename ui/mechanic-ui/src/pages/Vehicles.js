import { useState } from "react";
import VehicleForm from "../components/VehicleForm";
import VehicleList from "../components/VehicleList";

export default function Vehicles() {
  const [refreshVehicles, setRefreshVehicles] = useState(0);
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Vehicles</h1>
      <VehicleForm onVehicleAdded={() => setRefreshVehicles((n) => n + 1)} />
      <VehicleList refreshTrigger={refreshVehicles} />
    </div>
  );
}