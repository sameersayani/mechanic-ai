import { useEffect, useState } from "react";
import { getCustomers, createVehicle } from "../api";
import { toast } from "react-toastify";

export default function VehicleForm({ onVehicleAdded }) {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customer_id: "",
    make: "",
    model: "",
  });

  useEffect(() => {
    const loadCustomers = async () => {
      const res = await getCustomers();

      if (Array.isArray(res)) {
        setCustomers(res);
      } else if (Array.isArray(res?.data)) {
        setCustomers(res.data);
      } else {
        setCustomers([]);
      }
    };

    loadCustomers();
  }, []);

  const handleSubmit = async () => {
    if (!form.customer_id) {
      toast.error("Select customer");
      return;
    }
       if (!form.make.trim()) {
          toast.error("Vehicle make is required");
          return;
        }
    
        if (!form.model.trim()) {
          toast.error("Vehicle model is required");
          return;
        }
    
    try {
      const res = await createVehicle(form);

      if (res?.id) {
        toast.success("Vehicle added");

        // Reset form
        setForm({ customer_id: "", make: "", model: "" });

        // Notify parent to refresh VehicleList
        onVehicleAdded?.();
      }
    } catch (err) {
      toast.error("Failed to add vehicle");
    }
  };

  return (
    <div className="card space-y-2">
      <select
        className="input"
        value={form.customer_id}
        onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
      >
        <option value="">Select Customer</option>
        {(Array.isArray(customers) ? customers : []).map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Make"
        className="input"
        value={form.make}
        onChange={(e) => setForm({ ...form, make: e.target.value })}
      />

      <input
        placeholder="Model"
        className="input"
        value={form.model}
        onChange={(e) => setForm({ ...form, model: e.target.value })}
      />

      <button onClick={handleSubmit} className="btn">
        Add Vehicle
      </button>
    </div>
  );
}
