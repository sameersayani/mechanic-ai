import { useState } from "react";
import { createMechanic } from "../api";
import { toast } from "react-toastify";

export default function MechanicForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Mechanic name is required");
      return;
    }

    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    const res = await createMechanic(form);

    if (res.id) {
      toast.success("Mechanic added");
      setForm({ name: "", phone: "" });
      onSuccess();
    } else {
      toast.error("Failed to add mechanic");
    }
  };

  return (
    <div className="card space-y-2">

      <input
        className="input"
        placeholder="Mechanic Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        className="input"
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <button onClick={handleSubmit} className="btn">
        Add Mechanic
      </button>
    </div>
  );
}