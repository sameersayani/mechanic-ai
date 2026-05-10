import { useState } from "react";
import { toast } from "react-toastify";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    const res = await fetch("http://localhost:8001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ id: data.user_id, email: data.email }));
      window.location.href = "/";
    } else {
      toast.error("Invalid email or password");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Left — Image Panel */}
      <div className="hidden md:flex w-1/2 relative bg-black">
        <img
          src="/mechanic-ai.png"
          alt="Mechanic AI"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay text on image */}
        <div className="absolute bottom-10 left-8 text-white">
          <h1 className="text-3xl font-bold">Mechanic AI</h1>
          <p className="text-gray-300 mt-1 text-sm">Your smart workshop manager</p>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="card w-80">

          {/* Logo for mobile (hidden on desktop since image is shown) */}
          <div className="flex justify-center mb-4 md:hidden">
            <img src="/mechanic-ai.png" alt="Mechanic AI" className="w-20 h-20 object-contain" />
          </div>

          <h2 className="text-xl font-bold mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Sign in to your account</p>

          <input
            placeholder="Email"
            className="input"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onKeyDown={handleKeyDown}
          />

          <input
            type="password"
            placeholder="Password"
            className="input"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={handleKeyDown}
          />

          <button onClick={handleLogin} className="btn w-full mt-3">
            Login
          </button>

          <p className="text-sm mt-3 text-center">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600">
              Register
            </a>
          </p>

        </div>
      </div>

    </div>
  );
}
