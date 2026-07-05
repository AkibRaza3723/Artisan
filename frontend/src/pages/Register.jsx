// ─── Register Page ─────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: name === "username"
        ? value.toLowerCase().replace(/[^a-z0-9_-]/g, "")
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { fullName, username, email, password, confirmPassword } = form;
    if (!fullName || !username || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await register({ fullName, username, email, password });
      navigate("/login", {
        state: { message: "Account created! Please sign in." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-plum/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-sandlewood/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-brand shadow-brand-lg mb-4">
            <span className="text-almond font-display font-bold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-almond">Create your canvas</h1>
          <p className="text-almond/40 text-sm mt-2 font-sans">
            Join Artisans&apos; Canvas — showcase your vision to the world
          </p>
        </div>

        <div className="card border-sandlewood/20 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label" htmlFor="fullName">Full Name</label>
              <input
                id="fullName" name="fullName" type="text" autoComplete="name"
                className="input-field" placeholder="Your full name"
                value={form.fullName} onChange={handleChange}
              />
            </div>

            <div>
              <label className="input-label" htmlFor="username">
                Username{" "}
                <span className="text-almond/30 normal-case tracking-normal font-normal">
                  (your portfolio URL: /portfolio/<span className="text-sandlewood">{form.username || "..."}</span>)
                </span>
              </label>
              <input
                id="username" name="username" type="text" autoComplete="username"
                className="input-field" placeholder="e.g. janearts"
                value={form.username} onChange={handleChange}
              />
            </div>

            <div>
              <label className="input-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email" name="email" type="email" autoComplete="email"
                className="input-field" placeholder="artist@example.com"
                value={form.email} onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password" name="password" type="password" autoComplete="new-password"
                  className="input-field" placeholder="Min 8 chars"
                  value={form.password} onChange={handleChange}
                />
              </div>
              <div>
                <label className="input-label" htmlFor="confirmPassword">Confirm</label>
                <input
                  id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
                  className="input-field" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-900/30 border border-red-800/40 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-almond/30 border-t-almond rounded-full animate-spin" />
                  Creating account...
                </>
              ) : "Create Account"}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-sandlewood/10">
            <p className="text-almond/40 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-sandlewood hover:text-almond transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
