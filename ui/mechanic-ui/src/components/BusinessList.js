import { useEffect, useState } from "react";
import { getBusinesses } from "../api";
import { Building2, Phone, Mail, Globe, MapPin } from "lucide-react";

export default function BusinessList({ refreshTrigger }) {
  const [businesses, setBusinesses] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadBusinesses();
  }, [page, pageSize, refreshTrigger]);

  const loadBusinesses = async () => {
    try {
      const res = await getBusinesses();
      if (!res) { setBusinesses([]); return; }
      if (Array.isArray(res)) {
        setBusinesses(res);
        setTotal(0);
      } else if (Array.isArray(res.data)) {
        setBusinesses(res.data);
        setTotal(res.total || 0);
      } else {
        setBusinesses([]);
      }
    } catch (err) {
      console.error("Failed to load businesses:", err);
      setBusinesses([]);
    }
  };

  const totalPages = total ? Math.ceil(total / pageSize) : 0;
  const isLastPage = totalPages ? page >= totalPages : businesses.length < pageSize;

  // Paginate client-side if API returns full array
  const paginated = total === 0
    ? businesses.slice((page - 1) * pageSize, page * pageSize)
    : businesses;

  return (
    <div className="card mt-4">
      <h2 className="font-semibold mb-3">Business List</h2>

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
      {paginated.length === 0 ? (
        <p className="text-gray-500 text-sm">No businesses found</p>
      ) : (
        paginated.map((b) => (
          <div
            key={b.id}
            className="flex flex-col gap-1 border-b py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
          >
            {/* Name + Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">{b.name}</span>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  b.is_active
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {b.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Phone */}
            {b.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4" />
                <span>{b.phone}</span>
              </div>
            )}

            {/* Email */}
            {b.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Mail className="w-4 h-4" />
                <span>{b.email}</span>
              </div>
            )}

            {/* Website */}
            {b.website && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Globe className="w-4 h-4" />
                <a
                  href={b.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {b.website}
                </a>
              </div>
            )}

            {/* Address */}
            {b.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>{b.address}</span>
              </div>
            )}
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
          Page {page}{" "}
          {totalPages
            ? `of ${totalPages}`
            : businesses.length > 0
            ? `of ${Math.ceil(businesses.length / pageSize)}`
            : ""}
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
