import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#003366] mb-4">About Our Online Examination Platform</h1>
          <div className="w-24 h-1 bg-[#003366] mx-auto"></div>
        </div>

        {/* Mission Section */}
        <div className="mb-12 bg-gray-50 p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-[#003366] mb-4">Our Mission</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            We're revolutionizing the way students take exams by providing a secure, accessible, 
            and user-friendly online examination platform. Our goal is to make testing more efficient 
            for both students and educators while maintaining the highest standards of academic integrity.
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-[#003366] mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium text-[#003366] mb-3">Secure Testing Environment</h3>
              <p className="text-gray-700">Advanced proctoring and security measures to ensure exam integrity.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium text-[#003366] mb-3">Instant Results</h3>
              <p className="text-gray-700">Automated grading for objective questions with immediate feedback.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium text-[#003366] mb-3">Accessible Anywhere</h3>
              <p className="text-gray-700">Take exams from any device with internet access.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium text-[#003366] mb-3">Comprehensive Analytics</h3>
              <p className="text-gray-700">Detailed performance reports for students and instructors.</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-[#003366] mb-6">Our Team</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            We're a team of educators, developers, and designers passionate about improving the 
            examination experience. With backgrounds in education technology and software development, 
            we've created a platform that addresses the real challenges of online assessment.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="bg-[#003366] text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">Have Questions?</h2>
          <p className="mb-6">We'd love to hear from you! Contact our support team for more information.</p>
          <button className="bg-white text-[#003366] px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition duration-300">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;