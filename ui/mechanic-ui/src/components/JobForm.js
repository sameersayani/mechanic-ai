import { useEffect, useState } from "react";
import { createJob, getCustomers, getVehicles, getMechanics } from "../api";
import { toast } from "react-toastify";

export default function JobForm({ onJobAdded }) {
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [mechanics, setMechanics] = useState([]);
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
  const m = await getMechanics();

  console.log("Customers:", c);
  console.log("Vehicles:", v);
  console.log("Mechanics:", m);

  setCustomers(Array.isArray(c) ? c : c?.data || []);
  setVehicles(Array.isArray(v) ? v : v?.data || []);
  setMechanics(Array.isArray(m) ? m : m?.data || []);
};

  const handleSubmit = async () => {
    if (!form.vehicle_id) {
      toast.error("Select vehicle");
      return;
    }

    const res = await createJob({
      vehicle_id: form.vehicle_id,
      issue_description: form.issue,
      mechanic_id: form.mechanic_id,
    });

    if (res.id) {
      onJobAdded?.();
      toast.success("Job created");
    }
  };

  return (
    <div className="card p-4 space-y-2">
       <h2 className="text-xl font-bold mb-2">Add Job</h2>
      <select
        className="input"
        onChange={(e) => {
        setForm({ ...form, customer_id: e.target.value });
      }}
      >
        <option>Select Customer</option>
        {(Array.isArray(customers) ? customers : []).map((c) => (
            <option key={c.id} value={c.id}>
            {c.name}
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
            .filter(v => Number(v.customer_id) === Number(form.customer_id))
            .map((v) => (
              <option key={v.id} value={v.id}>
                {v.make} {v.model}
              </option>
            ))}
      </select>

      <select
        className="input"
        onChange={(e) =>
          setForm({ ...form, mechanic_id: e.target.value })
        }
      >
        <option value="">Select Mechanic</option>

        {(Array.isArray(mechanics) ? mechanics : []).map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
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