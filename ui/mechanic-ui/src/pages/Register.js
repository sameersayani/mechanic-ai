import { useState } from "react";
import { toast } from "react-toastify";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "" });

  const [captcha, setCaptcha] = useState({
    num1: Math.floor(Math.random() * 10),
    num2: Math.floor(Math.random() * 10),
  });

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshCaptcha = () => {
    setCaptcha({
      num1: Math.floor(Math.random() * 10),
      num2: Math.floor(Math.random() * 10),
    });
  };

  const handleRegister = async () => {
    const correctAnswer = captcha.num1 + captcha.num2;

    if (parseInt(answer) !== correctAnswer) {
      toast.error("Incorrect captcha");
      refreshCaptcha();
      return;
    }

    if (!form.email || !form.password) {
      toast.warning("Email and password required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Registration successful 🎉");
        setTimeout(() => { window.location.href = "/login"; }, 1500);
      } else {
        toast.error(data.detail || "Registration failed");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
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

          {/* Logo for mobile */}
          <div className="flex justify-center mb-4 md:hidden">
            <img src="/mechanic-ai.png" alt="Mechanic AI" className="w-20 h-20 object-contain" />
          </div>

          <h2 className="text-xl font-bold mb-1">Create Account</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Join Mechanic AI today</p>

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

          {/* CAPTCHA */}
          <div className="mb-2">
            <label className="block text-sm mb-1">
              What is {captcha.num1} + {captcha.num2}?
            </label>
            <input
              className="input"
              placeholder="Your answer"
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            onClick={handleRegister}
            className="btn w-full"
            disabled={loading}
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <p className="text-sm mt-3 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600">
              Login
            </a>
          </p>

        </div>
      </div>

    </div>
  );
}
