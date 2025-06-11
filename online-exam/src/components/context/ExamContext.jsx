import React, { createContext, useContext, useState } from 'react';

const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [exams, setExams] = useState([
    { title: 'Mathematics', image: '/maths.png' },
    { title: 'Programming', image: '/cs.png' },
    { title: 'Islamic Studies', image: '/islamic.png' },
    { title: 'Web Engineering', image: '/web engg.png' },
  ]);

  const addExam = (title, description) => {
    setExams((prev) => [
      ...prev,
      { title, description, image: '/default.png' },
    ]);
  };

  return (
    <ExamContext.Provider value={{ exams, addExam }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExamContext = () => useContext(ExamContext);
