import { useEffect, useState } from "react";
import { getJobs, updateJob } from "../api";
import { Wrench, Car } from "lucide-react";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadJobs();
  }, [page, pageSize]);

  const loadJobs = async () => {
    try {
      const res = await getJobs(page, pageSize);
      if (!res) { setJobs([]); return; }
      if (Array.isArray(res)) {
        setJobs(res);
      } else if (Array.isArray(res.data)) {
        setJobs(res.data);
        setTotal(res.total || 0);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
      setJobs([]);
    }
  };

  const toggleStatus = async (job) => {
    const newStatus = job.status === "Done" ? "Pending" : "Done";

    // Optimistically update UI
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
    );

    try {
      await updateJob(job.id, { ...job, status: newStatus });
    } catch (err) {
      console.error("Failed to update job status:", err);
      // Revert on failure
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: job.status } : j))
      );
    }
  };

  const totalPages = total ? Math.ceil(total / pageSize) : 0;
  const isLastPage = totalPages ? page >= totalPages : jobs.length < pageSize;

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-3">Jobs</h2>

      {/* Page Size Selector */}
      <div className="mb-3 flex items-center gap-2">
        <label>Page Size:</label>
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="input w-28"
        >
          <option value={2}>2</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* LIST */}
      <div className="grid gap-3">
        {jobs.length === 0 ? (
          <p>No jobs found</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="card hover:shadow-md transition">

              {/* Issue */}
              <p className="font-semibold text-lg">
                🔧 {job.issue || "No issue"}
              </p>

              {/* Vehicle */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Car className="w-4 h-4" />
                {job.vehicle_name || "Unknown Vehicle"}
              </div>

              {/* Mechanic */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Wrench className="w-4 h-4" />
                {job.mechanic_name || "Unassigned"}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => toggleStatus(job)}
                  className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                    job.status === "Done" ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${
                      job.status === "Done" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    job.status === "Done"
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {job.status === "Done" ? "Done" : "Pending"}
                </span>
              </div>

            </div>
          ))
        )}
      </div>

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
