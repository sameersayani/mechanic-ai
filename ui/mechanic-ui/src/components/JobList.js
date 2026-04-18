import { useEffect, useState } from "react";
import { getJobs } from "../api";
import { Wrench, Car } from "lucide-react";

export default function JobList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const data = await getJobs();
    setJobs(Array.isArray(data) ? data : []);
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-3">Jobs</h2>
      
      <div className="grid gap-3">
        {jobs.length === 0 ? (
          <p>No jobs found</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="card hover:shadow-md transition"
            >
              {/* Issue */}
              <p className="font-semibold text-lg">
                🔧 {job.issue}
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

              {/* Status */}
              <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                {job.status || "Pending"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}