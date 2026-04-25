import { useState } from "react";
import JobForm from "../components/JobForm";
import JobList from "../components/JobList";

export default function Jobs() {
  const [refreshJobs, setRefreshJobs] = useState(0);
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Jobs</h1>
      <JobForm onJobAdded={() => setRefreshJobs((n) => n + 1)} />
      <JobList refreshTrigger={refreshJobs} />
    </div>
  );
}