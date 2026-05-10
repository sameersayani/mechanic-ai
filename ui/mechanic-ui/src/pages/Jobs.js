import { useState } from "react";
import JobForm from "../components/JobForm";
import JobList from "../components/JobList";

export default function Jobs() {
  const [refreshJobs, setRefreshJobs] = useState(0);
  const [editJob, setEditJob] = useState(null); // job being edited, or null

  const handleEditJob = (job) => {
    setEditJob(job);
    // Scroll to top so the form (which sits above the list) is visible
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditDone = () => {
    setEditJob(null);
    setRefreshJobs((n) => n + 1);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Jobs</h1>
      <JobForm
        onJobAdded={() => setRefreshJobs((n) => n + 1)}
        editJob={editJob}
        onEditDone={handleEditDone}
      />
      <JobList
        refreshTrigger={refreshJobs}
        onEditJob={handleEditJob}
        onJobDeleted={() => setRefreshJobs((n) => n + 1)}
      />
    </div>
  );
}