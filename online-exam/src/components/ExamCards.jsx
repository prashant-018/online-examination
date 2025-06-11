import React from 'react';
import { useNavigate } from 'react-router-dom';

const examData = [
  {
    title: 'Mathematics',
    image: '/maths.png', // adjust path if needed
  },
  {
    title: 'Programming',
    image: '/cs.png',
  },
  {
    title: 'Islamic Studies',
    image: '/islamic.png',
  },
  {
    title: 'Web Engineering',
    image: '/web engg.png',
  },
];

const ExamCards = () => {
  const navigate = useNavigate();

  const startExam = (subject) => {
    const formattedSubject = subject.toLowerCase().replace(/\s+/g, '-');
    navigate(`/exam/${formattedSubject}`);
  };

  return (
    <section className="bg-gray-100 py-10 px-4 md:px-12">
      <div className="mb-8">
        <h2 className="inline-block bg-[#1658a0] text-white px-4 py-2 text-lg font-semibold rounded shadow">
          OUR SOME EXAMS
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {examData.map((exam, index) => (
          <div
            key={index}
            onClick={() => startExam(exam.title)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 cursor-pointer"
          >
            <img
              src={exam.image}
              alt={exam.title}
              className="w-full h-48 object-cover"
            />
            <div className="py-4 text-center text-blue-800 font-semibold text-sm border-t">
              {exam.title}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExamCards;
