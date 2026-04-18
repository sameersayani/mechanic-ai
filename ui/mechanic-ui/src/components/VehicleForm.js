import { useEffect, useState } from "react";
import { getCustomers, createVehicle } from "../api";
import { toast } from "react-toastify";

export default function VehicleForm() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customer_id: "",
    make: "",
    model: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
  };

  const handleSubmit = async () => {
    if (!form.customer_id) {
      toast.error("Select customer");
      return;
    }

    const res = await createVehicle(form);

    if (res.id) {
      toast.success("Vehicle added");
    }
  };

  return (
    <div className="card space-y-2">

      <select
        className="input"
        onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
      >
        <option>Select Customer</option>
        {customers.map((c) => (
            <option key={c.id} value={c.id}>
            {c.name}
            </option>
        ))}
      </select>

      <input
        placeholder="Make"
        className="input"
        onChange={(e) => setForm({ ...form, make: e.target.value })}
      />

      <input
        placeholder="Model"
        className="input"
        onChange={(e) => setForm({ ...form, model: e.target.value })}
      />

      <button onClick={handleSubmit} className="btn">
        Add Vehicle
      </button>
    </div>
  );
}