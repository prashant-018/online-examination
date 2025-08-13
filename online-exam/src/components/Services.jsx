import React from 'react';
import { FaStar, FaLaptop, FaUserShield, FaChartLine, FaClock } from 'react-icons/fa';

const Services = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#003366] mb-4">Our Examination Services</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive online examination solutions designed for modern education needs
          </p>
          <div className="w-24 h-1 bg-[#003366] mx-auto mt-6"></div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Service Features */}
          <div>
            <h2 className="text-2xl font-semibold text-[#003366] mb-6">Core Features</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FaStar className="text-blue-700 text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Secure Exam Platform</h3>
                  <p className="text-gray-600 mt-1">
                    Robust system that prevents cheating and ensures exam integrity
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FaLaptop className="text-blue-700 text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Flexible Administration</h3>
                  <p className="text-gray-600 mt-1">
                    Easy creation and management of exams with various question types
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FaUserShield className="text-blue-700 text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Student-Friendly Interface</h3>
                  <p className="text-gray-600 mt-1">
                    Intuitive design that makes taking exams straightforward and stress-free
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Benefits Section */}
          <div>
            <h2 className="text-2xl font-semibold text-[#003366] mb-6">Key Benefits</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FaClock className="text-blue-700 mt-1" />
                  <span className="text-gray-700">Time-saving automated grading system</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaChartLine className="text-blue-700 mt-1" />
                  <span className="text-gray-700">Detailed performance analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaUserShield className="text-blue-700 mt-1" />
                  <span className="text-gray-700">Secure and reliable platform</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaLaptop className="text-blue-700 mt-1" />
                  <span className="text-gray-700">Accessible from any device</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold text-[#003366] mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-700 font-bold">1</span>
              </div>
              <h3 className="font-medium text-gray-800">Create Exam</h3>
              <p className="text-gray-600 text-sm mt-1">
                Instructors set up exams with various question types
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-700 font-bold">2</span>
              </div>
              <h3 className="font-medium text-gray-800">Students Take Exam</h3>
              <p className="text-gray-600 text-sm mt-1">
                Secure online access with time limits and monitoring
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-700 font-bold">3</span>
              </div>
              <h3 className="font-medium text-gray-800">Get Results</h3>
              <p className="text-gray-600 text-sm mt-1">
                Instant grading and comprehensive performance reports
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;