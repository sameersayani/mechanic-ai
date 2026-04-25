import { useEffect, useState } from "react";
import { Car, User } from "lucide-react";
import { getVehicles } from "../api";

export default function VehicleList({ refreshTrigger }) {
  const [vehicles, setVehicles] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadVehicles();
  }, [page, pageSize, refreshTrigger]); // 👈 re-fetch when a new vehicle is added

  const loadVehicles = async () => {
    try {
      const res = await getVehicles(page, pageSize);

      if (!res) {
        setVehicles([]);
        return;
      }

      if (Array.isArray(res)) {
        setVehicles(res);
        setTotal(0);
      } else if (Array.isArray(res.data)) {
        setVehicles(res.data);
        setTotal(res.total || 0);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      setVehicles([]);
    }
  };

  const totalPages = total ? Math.ceil(total / pageSize) : 0;
  const isLastPage = totalPages ? page >= totalPages : vehicles.length < pageSize;

  return (
    <div className="card mt-4">
      <h2 className="font-semibold mb-3">Vehicle List</h2>

      {/* Page Size Selector */}
      <div className="mb-3 flex items-center gap-2">
        <label>Page Size:</label>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          className="input w-28"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* LIST */}
      {vehicles.length === 0 ? (
        <p>No vehicles found</p>
      ) : (
        vehicles.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between border-b py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
          >
            {/* Vehicle */}
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-500" />
              <span className="font-medium">
                {v.make} {v.model}
              </span>
            </div>

            {/* Customer */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <User className="w-4 h-4" />
              <span>{v.customer_name || "Unknown"}</span>
            </div>
          </div>
        ))
      )}

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="btn"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span>
          Page {page} {totalPages ? `of ${totalPages}` : ""}
        </span>

        <button
          className="btn"
          disabled={isLastPage}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
