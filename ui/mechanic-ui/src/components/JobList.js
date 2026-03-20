import { useEffect, useState } from "react";
import { getJobs } from "../api";

export default function JobList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold">Jobs</h2>

      {jobs.map((job) => (
        <div key={job[0]} className="border p-2 mt-2 rounded">
          <p><b>ID:</b> {job[0]}</p>
          <p><b>Issue:</b> {job[2]}</p>
          <p><b>Status:</b> {job[3]}</p>
        </div>
      ))}
    </div>
  );
}