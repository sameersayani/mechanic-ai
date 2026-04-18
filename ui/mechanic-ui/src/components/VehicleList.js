import { useEffect, useState } from "react";
import { Car, User } from "lucide-react";
import { getVehicles } from "../api";

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);

  const loadVehicles = async () => {
    const data = await getVehicles();
    setVehicles(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <div className="card mt-4">
      <h2 className="font-semibold mb-2">Vehicle List</h2>

      {vehicles.length === 0 ? (
        <p>No vehicles found</p>
      ) : (
        vehicles.map((v) => (
  <div
    key={v.id}
    className="flex items-center justify-between border-b py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
  >
    {/* Left: Vehicle */}
    <div className="flex items-center gap-2">
      <Car className="w-5 h-5 text-blue-500" />
      <span className="font-medium">
        {v.make} {v.model}
      </span>
    </div>

    {/* Right: Customer */}
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
    <User className="w-4 h-4" />
    <span>{v.customer_name || "Unknown"}</span>
    </div>
    </div>
        ))
      )}
    </div>
  );
}