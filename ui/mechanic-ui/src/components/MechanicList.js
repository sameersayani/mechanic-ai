import { useEffect, useState } from "react";
import { Wrench, Phone } from "lucide-react";
import { getMechanics } from "../api";

export default function MechanicList({ refreshTrigger }) {
  const [mechanics, setMechanics] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadMechanics();
  }, [page, pageSize, refreshTrigger]);

  const loadMechanics = async () => {
    try {
      const res = await getMechanics(page, pageSize);

      if (!res) {
        setMechanics([]);
        return;
      }

      if (Array.isArray(res)) {
        setMechanics(res);
      } else if (Array.isArray(res.data)) {
        setMechanics(res.data);
        setTotal(res.total || 0);
      } else {
        setMechanics([]);
      }
    } catch (err) {
      console.error("Failed to load mechanics:", err);
      setMechanics([]);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="card mt-4">
      <h2 className="font-semibold mb-3">Mechanic List</h2>

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
      {mechanics.length === 0 ? (
        <p>No mechanics found</p>
      ) : (
        mechanics.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between border-b py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
          >
            {/* Left: Mechanic */}
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              <span className="font-medium">{m.name}</span>
            </div>

            {/* Right: Phone */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Phone className="w-4 h-4" />
              <span>{m.phone}</span>
            </div>
          </div>
        ))
      )}

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="btn"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span>
          Page {page} {totalPages ? `of ${totalPages}` : ""}
        </span>

        <button
          className="btn"
          disabled={totalPages && page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}