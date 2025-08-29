import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import { useExamContext } from './context/ExamContext';

// ✅ API base (Netlify: set VITE_API_BASE to Render URL)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const makeUrl = (path) => `${API_BASE}${path}`;
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "123243172421-28rsh7uj9gjiiimsa0r55tcjgc0qq2if.apps.googleusercontent.com";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useExamContext();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Google login callback
  const handleCallbackResponse = async (response) => {
    try {
      const userObject = jwt_decode(response.credential);

      const apiResponse = await fetch(makeUrl("/api/auth/google/success"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: userObject.sub,
          name: userObject.name,
          email: userObject.email,
          avatar: userObject.picture,
        }),
      });

      const data = await apiResponse.json();
      if (!apiResponse.ok) throw new Error(data.message || "Google login failed");

      login(data.user, data.token);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Load Google Sign-In
  useEffect(() => {
    if (window.google) {
      try {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCallbackResponse,
        });

        google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          { theme: "outline", size: "large", width: 300 }
        );
      } catch (error) {
        console.warn("Google OAuth init failed:", error);
        const googleDiv = document.getElementById("googleSignInDiv");
        if (googleDiv) googleDiv.style.display = "none";
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Manual login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const postJson = async (url, body) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      let data = null;
      try {
        data = await res.json();
      } catch { }
      return { ok: res.ok, status: res.status, data };
    };

    try {
      let result = await postJson(makeUrl("/api/auth/login"), formData);

      if (result.status === 404) {
        result = await postJson(makeUrl("/api/users/login"), formData);
      }

      if (!result.ok) {
        const msg = result?.data?.message || `Login failed (HTTP ${result.status})`;
        throw new Error(msg);
      }

      login(result.data.user, result.data.token);
      navigate("/home");
    } catch (err) {
      if (err?.message === "Failed to fetch") {
        console.error("❌ Unable to reach backend at", API_BASE || "/api");
      }
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1658a0] flex items-center justify-center">
      <div className="bg-gray-100 p-8 rounded-md shadow-md w-[90%] max-w-2xl">
        <h2 className="text-[#1658a0] font-bold text-sm mb-6">LOGIN</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border-b border-gray-300 bg-transparent focus:outline-none"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border-b border-gray-300 bg-transparent focus:outline-none"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="text-sm text-gray-600">
            • Don't have an account{" "}
            <Link to="/register" className="text-[#1658a0] hover:underline">
              Register
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1658a0] text-white py-2 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="mb-2 text-gray-500">OR</div>
          <div id="googleSignInDiv" className="flex justify-center" />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
