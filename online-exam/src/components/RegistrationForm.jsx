import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RegistrationForm = ({ role, onRegister }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    faculty: '',
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
    console.log({ role, ...formData });
    if (onRegister) onRegister();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1658a0] px-4">
      <div className="bg-white rounded-md shadow-md p-8 w-full max-w-2xl">
        <h2 className="text-sm font-bold text-[#1658a0] tracking-wider mb-6">REGISTRATION</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="border-b border-gray-300 py-2 px-1 focus:outline-none focus:border-[#1658a0]"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="border-b border-gray-300 py-2 px-1 focus:outline-none focus:border-[#1658a0]"
            />
          </div>

          <div className="mb-4">
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              required
              className="w-full border-b border-gray-300 py-2 px-1 bg-white focus:outline-none focus:border-[#1658a0]"
            >
              <option value="">Faculty</option>
              <option value="Engineering">Engineering</option>
              <option value="Science">Science</option>
              <option value="Arts">Arts</option>
            </select>
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

          <div className="mb-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1658a0] underline">
              Sign In
            </Link>
          </div>

          <button
            type="submit"
            className="bg-[#1658a0] text-white font-medium py-2 px-6 rounded-full hover:bg-[#124b8a] transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
