import { useEffect, useState } from "react";
import { createJob, getCustomers, getVehicles } from "../api";
import { toast } from "react-toastify";

export default function JobForm() {
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    customer_id: "",
    vehicle_id: "",
    issue: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const c = await getCustomers();
    const v = await getVehicles();

    setCustomers(c);
    setVehicles(v);
  };

  const handleSubmit = async () => {
    if (!form.vehicle_id) {
      toast.error("Select vehicle");
      return;
    }

    const res = await createJob({
      vehicle_id: form.vehicle_id,
      issue_description: form.issue,
      assigned_mechanic: "Raju",
    });

    if (res.id) {
      toast.success("Job created");
    }
  };

  return (
    <div className="card space-y-2">

      <select
        className="input"
        onChange={(e) => {
        console.log("Selected:", e.target.value);
        setForm({ ...form, customer_id: e.target.value });
      }}
      >
        <option>Select Customer</option>
        {Array.isArray(customers) && customers.map((c) => (
        <option key={c[0]} value={c[0]}>
          {c[1]}
        </option>
      ))}
      </select>

      <select
        className="input"
        disabled={!form.customer_id}
        onChange={(e) =>{
          setForm({ ...form, vehicle_id: e.target.value })
        }}
      >
        <option>Select Vehicle</option>

        {Array.isArray(vehicles) &&
          vehicles
            .filter(v => Number(v[3]) === Number(form.customer_id))
            .map((v) => (
              <option key={v[0]} value={v[0]}>
                {v[1]} {v[2]}
              </option>
            ))}
      </select>

      <textarea
        className="input"
        placeholder="Issue"
        onChange={(e) => setForm({ ...form, issue: e.target.value })}
      />

      <button onClick={handleSubmit} className="btn">
        Create Job
      </button>
    </div>
  );
}