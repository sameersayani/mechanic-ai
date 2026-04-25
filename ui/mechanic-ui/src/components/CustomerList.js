import { useEffect, useState } from "react";
import { getCustomers } from "../api";

export default function CustomerList({refreshTrigger}) {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const loadCustomers = async () => {
    const res = await getCustomers(page, pageSize);

    if (!res) return;

    setCustomers(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    loadCustomers();
  }, [page, pageSize, refreshTrigger]);

  return (
    <div className="card mt-4">
      <h2 className="font-semibold mb-3">Customer List</h2>

      {/* Page Size */}
      <div className="mb-3">
        <label className="mr-2">Page Size:</label>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          className="input w-32"
        >
            <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* LIST */}
      {customers.length === 0 ? (
        <p>No customers found</p>
      ) : (
        customers.map((c) => (
          <div key={c.id} className="border-b py-2">
            <b>{c.name}</b>
            <p>{c.phone}</p>
            <p>{c.email}</p>
          </div>
        ))
      )}

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          className="btn"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span>Page {page}</span>

        <button
          className="btn"
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}