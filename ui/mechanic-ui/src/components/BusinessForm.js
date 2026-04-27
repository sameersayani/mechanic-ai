import { useState } from "react";
import { createBusiness } from "../api";
import { toast } from "react-toastify";

export default function BusinessForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    is_active: true,
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Business name is required");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    const res = await createBusiness(form);

    if (res.id) {
      toast.success("Business added");
      setForm({ name: "", address: "", phone: "", email: "", website: "", is_active: true });
      onSuccess();
    } else {
      toast.error("Failed to add business");
    }
  };

  return (
    <div className="card space-y-2">

      <input
        type="text"
        className="input"
        placeholder="Business Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="text"
        className="input"
        placeholder="Phone Number"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <input
        type="text"
        className="input"
        placeholder="Address (optional)"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <input
        type="text"
        className="input"
        placeholder="Email (optional)"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="text"
        className="input"
        placeholder="Website (optional)"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
      />

      {/* Active / Inactive Toggle */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
          className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
            form.is_active ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${
              form.is_active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            form.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
          }`}
        >
          {form.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <button onClick={handleSubmit} className="btn">
        Add Business
      </button>
    </div>
  );
}
