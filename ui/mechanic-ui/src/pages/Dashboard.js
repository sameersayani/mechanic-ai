import CustomerForm from "../components/CustomerForm";
import JobForm from "../components/JobForm";
import JobList from "../components/JobList";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="card">Total Jobs: 12</div>
        <div className="card">Pending: 5</div>
        <div className="card">Completed: 7</div>
      </div>

      {/* Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomerForm />
        <JobForm />
      </div>

      {/* Job List */}
      <JobList />
    </div>
  );
}