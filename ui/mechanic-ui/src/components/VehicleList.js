import { useEffect, useState } from "react";
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
          <div key={v.id} className="border-b py-2">
            {v.make} {v.model} (Customer ID: {v.customer_id})
          </div>
        ))
      )}
    </div>
  );
}