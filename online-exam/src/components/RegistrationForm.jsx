import React, { useState } from 'react';
import API_BASE from '../config';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useExamContext } from './context/ExamContext';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useExamContext();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: location.state?.role || 'Student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Centralized API base

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
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
    <div className="min-h-screen flex items-center justify-center bg-[#1658a0] px-4">
      <div className="bg-white rounded-md shadow-md p-8 w-full max-w-2xl">
        <h2 className="text-sm font-bold text-[#1658a0] tracking-wider mb-6">REGISTRATION</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border-b border-gray-300 py-2 px-1 focus:outline-none focus:border-[#1658a0]"
            />
          </div>

          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border-b border-gray-300 py-2 px-1 focus:outline-none focus:border-[#1658a0]"
            />
          </div>

          <div className="mb-4">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full border-b border-gray-300 py-2 px-1 bg-white focus:outline-none focus:border-[#1658a0]"
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border-b border-gray-300 py-2 px-1 focus:outline-none focus:border-[#1658a0]"
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border-b border-gray-300 py-2 px-1 focus:outline-none focus:border-[#1658a0]"
            />
          </div>

          <div className="mb-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1658a0] underline">
              Sign In
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#1658a0] text-white font-medium py-2 px-6 rounded-full hover:bg-[#124b8a] transition disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
