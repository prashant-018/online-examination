import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import { useExamContext } from './context/ExamContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useExamContext();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Google login callback
  const handleCallbackResponse = async (response) => {
    try {
      const userObject = jwt_decode(response.credential);
      console.log("Google User:", userObject);

      // Send Google user data to backend
      const apiResponse = await fetch('http://localhost:5000/api/auth/google/success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: userObject.sub,
          name: userObject.name,
          email: userObject.email,
          avatar: userObject.picture
        }),
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      // Use context to login
      login(data.user, data.token);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Load Google Sign-In on mount
  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: "123243172421-28rsh7uj9gjiiimsa0r55tcjgc0qq2if.apps.googleusercontent.com", // ✅ Your real client ID
        callback: handleCallbackResponse,
      });

      google.accounts.id.renderButton(document.getElementById("googleSignInDiv"), {
        theme: "outline",
        size: "large",
        width: "100%",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Manual form login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Use context to login
      login(data.user, data.token);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-800 flex items-center justify-center">
      <div className="bg-gray-100 p-8 rounded-md shadow-md w-[90%] max-w-2xl">
        <h2 className="text-blue-800 font-bold text-sm mb-6">LOGIN</h2>

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
            <Link to="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
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
