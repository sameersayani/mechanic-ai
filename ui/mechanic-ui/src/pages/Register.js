import { useState } from "react";
import { toast } from "react-toastify";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "" });

  const [captcha, setCaptcha] = useState({
    num1: Math.floor(Math.random() * 10),
    num2: Math.floor(Math.random() * 10),
  });

  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Registration successful 🎉");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } else {
      toast.error(data.detail || "Registration failed");
    }

  } catch (err) {
    toast.error("Server error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="card w-80">

        <h2 className="text-xl font-bold mb-4">Create Account</h2>

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

        {/* CAPTCHA */}
        <div className="mb-2">
          <label className="block text-sm mb-1">
            What is {captcha.num1} + {captcha.num2}?
          </label>
          <input
            className="input"
            placeholder="Your answer"
            onChange={(e) => setAnswer(e.target.value)}
          />
        </div>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}

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
  );
}