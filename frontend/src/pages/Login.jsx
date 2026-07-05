// ─── Login Page ────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-plum/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-sandlewood/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-brand shadow-brand-lg mb-4">
            <span className="text-almond font-display font-bold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-almond">Welcome back</h1>
          <p className="text-almond/40 text-sm mt-2 font-sans">Sign in to your Artisans&apos; Canvas</p>
        </div>

        {/* Card */}
        <div className="card border-sandlewood/20 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="artist@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="input-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
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
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-sandlewood/10">
            <p className="text-almond/40 text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-sandlewood hover:text-almond transition-colors font-medium">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
