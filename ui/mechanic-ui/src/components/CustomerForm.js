import { useState } from "react";
import { createCustomer } from "../api";

export default function CustomerForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const handleSubmit = async () => {
    await createCustomer(form);
    alert("Customer Created");
  };

  return (
    <div className="p-4 border rounded-xl shadow">
      <h2 className="text-xl font-bold mb-2">Add Customer</h2>

      <input placeholder="Name" className="input" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Phone" className="input" onChange={e => setForm({...form, phone: e.target.value})} />
      <input placeholder="Email" className="input" onChange={e => setForm({...form, email: e.target.value})} />

      <button onClick={handleSubmit} className="btn mt-2">Save</button>
    </div>
  );
}