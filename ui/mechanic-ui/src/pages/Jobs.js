import JobForm from "../components/JobForm";
import JobList from "../components/JobList";

export default function Jobs() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Jobs</h1>
      <JobForm />
      <JobList />
    </div>
  );
}