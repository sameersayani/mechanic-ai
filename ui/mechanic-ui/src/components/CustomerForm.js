import { useState } from "react";
import { createCustomer } from "../api";
import { toast } from "react-toastify";

export default function CustomerForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const validate = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return false;
    }

    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }

    // basic phone validation
    const phoneRegex = /^[0-9]{7,15}$/;

    if (!phoneRegex.test(form.phone)) {
      toast.error("Enter valid phone number (7-15 digits)");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const res = await createCustomer(form);

    if (res.id) {
      toast.success("Customer added successfully");

      setForm({
        name: "",
        phone: "",
        email: "",
      });

      onSuccess(); // refresh list
    } else {
      toast.error("Failed to add customer");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h2 className="font-semibold">Add Customer</h2>

      {/* Name */}
      <input
        type="text"
        placeholder="Customer Name *"
        className="input"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      {/* Phone */}
      <input
        type="text"
        placeholder="Phone Number *"
        className="input"
        value={form.phone}
        onChange={(e) =>
          setForm({ ...form, phone: e.target.value })
        }
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Email (optional)"
        className="input"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <button type="submit" className="btn">
        Add Customer
      </button>
    </form>
  );
}