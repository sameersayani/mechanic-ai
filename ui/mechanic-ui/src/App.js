import CustomerForm from "./components/CustomerForm";
import JobForm from "./components/JobForm";
import JobList from "./components/JobList";

function App() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mechanic AI Dashboard</h1>

      <CustomerForm />
      <JobForm />
      <JobList />
    </div>
  );
}

export default App;