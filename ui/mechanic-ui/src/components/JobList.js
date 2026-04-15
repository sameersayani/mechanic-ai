import { useEffect, useState } from "react";
import { getJobs } from "../api";

export default function JobList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Jobs</h2>

      <div className="grid gap-3">
        {jobs.map((job) => (
          <div key={job[0]} className="card">
            <p className="font-semibold">Issue: {job[2]}</p>
            <p className="text-sm text-gray-500">Status: {job[3]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}