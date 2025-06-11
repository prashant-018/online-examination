import React from 'react';
import CommentSection from './CommentSection';
import Footer from './Footer';
import ExamCards from './ExamCards';

const Home = () => {
  return (
    <div className="p-8 min-h-screen bg-white flex flex-col justify-between">
      <div>
        <h2 className="text-3xl font-bold text-[#003366] mb-4">
          ONLINE EXAMINATION SYSTEM
        </h2>
        <p className="text-gray-700 text-lg mb-10">
          This is a Website for Online Examination that students can attend exams online.
        </p>

<br>
</br>
<br>
</br>
<br>
</br>
<br>
</br>

<br>
</br>
<br>
</br>
<br>
</br>
<br>
</br>
<br>
</br>
<br>
</br>
<br>
</br>
<br>
</br>
<br>
</br>
<br>
</br>
<br>
</br>
<br>
</br>

<br>
</br>

<br>
</br>

<br>
</br>
<br>
</br>



        {/* Exam Cards Section */}
        <div className="mb-10">
          <ExamCards />
        </div>

        {/* Comment Section */}
        <CommentSection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
