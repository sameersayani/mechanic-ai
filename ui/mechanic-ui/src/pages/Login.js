import { useState } from "react";
import { toast } from "react-toastify";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    const res = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="card w-80">
        <h2 className="text-xl font-bold mb-4">Mechanic AI Login</h2>

        <input
          placeholder="Email"
          className="input"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="input"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        
        <button onClick={handleLogin} className="btn w-full mt-3">
          Login     
        </button>   
              <p className="text-sm mt-3">
        Don't have an account?{" "}
            <a href="/register" className="text-blue-600">
                Register
            </a>
        </p>
      </div>
    </div>
  );
}