import { useEffect, useState } from "react";
import { Wrench, Phone } from "lucide-react";
import { getMechanics, updateMechanic } from "../api";

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
      if (!res) { setMechanics([]); return; }
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

  const toggleActive = async (mechanic) => {
    const newStatus = !mechanic.is_active;

    // Optimistic update
    setMechanics((prev) =>
      prev.map((m) => (m.id === mechanic.id ? { ...m, is_active: newStatus } : m))
    );

    try {
      await updateMechanic(mechanic.id, { ...mechanic, is_active: newStatus });
    } catch (err) {
      console.error("Failed to update mechanic status:", err);
      // Revert on failure
      setMechanics((prev) =>
        prev.map((m) => (m.id === mechanic.id ? { ...m, is_active: mechanic.is_active } : m))
      );
    }
  };

  const totalPages = total ? Math.ceil(total / pageSize) : 0;
  const isLastPage = totalPages ? page >= totalPages : mechanics.length < pageSize;

  return (
    <div className="card mt-4">
      <h2 className="font-semibold mb-3">Mechanic List</h2>

      {/* Page Size Selector */}
      <div className="mb-3 flex items-center gap-2">
        <label>Page Size:</label>
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
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
            {/* Left: Name */}
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              <span className="font-medium">{m.name}</span>
            </div>

            {/* Right: Phone + Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4" />
                <span>{m.phone}</span>
              </div>

              {/* Active / Inactive Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(m)}
                  className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                    m.is_active ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${
                      m.is_active ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    m.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {m.is_active ? "Active" : "Inactive"}
                </span>
              </div>
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
        <span>Page {page} {totalPages ? `of ${totalPages}` : ""}</span>
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
