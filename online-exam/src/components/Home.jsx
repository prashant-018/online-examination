import React from 'react';
import CommentSection from './CommentSection';
import Footer from './Footer';
import ExamCards from './ExamCards';
import { FaChalkboardTeacher, FaUserGraduate, FaClock, FaChartLine } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#003366] mb-6">
              Online Examination System
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              A modern, secure platform for conducting and taking exams online with ease and efficiency.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-[#003366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#002244] transition duration-300">
                Take an Exam
              </button>
              <button className="bg-white text-[#003366] px-6 py-3 rounded-lg font-medium border border-[#003366] hover:bg-gray-50 transition duration-300">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-[#003366] text-center mb-12">
              Why Choose Our Platform
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <FaChalkboardTeacher className="text-blue-700 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Administration</h3>
                <p className="text-gray-600">
                  Create and manage exams effortlessly with our intuitive interface.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <FaUserGraduate className="text-blue-700 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Student-Friendly</h3>
                <p className="text-gray-600">
                  Simple interface designed for stress-free exam taking.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <FaClock className="text-blue-700 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Time Efficient</h3>
                <p className="text-gray-600">
                  Automated grading saves hours of manual work.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <FaChartLine className="text-blue-700 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Detailed Analytics</h3>
                <p className="text-gray-600">
                  Comprehensive reports to track student performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Exam Cards Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-[#003366] text-center mb-12">
              Available Exams
            </h2>
            <ExamCards />
          </div>
        </section>

        {/* Testimonials/Comment Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-[#003366] text-center mb-12">
              What Our Users Say
            </h2>
            <CommentSection />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;