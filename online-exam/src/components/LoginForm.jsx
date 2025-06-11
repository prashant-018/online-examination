import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    if (onLogin) onLogin();
  };

  return (
    <div className="min-h-screen bg-[#1658a0] flex items-center justify-center">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-8">
        <h2 className="text-blue-800 font-semibold text-sm uppercase mb-6">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            <div className="w-1/2 border-b border-gray-300">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                className="w-full px-1 py-2 text-sm bg-transparent focus:outline-none"
              />
            </div>
            <div className="w-1/2 border-b border-gray-300">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                className="w-full px-1 py-2 text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="border-b border-gray-300">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full px-1 py-2 text-sm bg-transparent focus:outline-none"
            />
          </div>

          <div className="text-sm">
            <span className="text-gray-700">• Don’t have an account </span>
            <Link to="/register" className=" hover:underline">Register</Link>
          </div>

          <button
            type="submit"
            className="w-28 bg-[#1658a0] text-white py-2 px-4 rounded-full font-medium hover:bg-blue-900 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
