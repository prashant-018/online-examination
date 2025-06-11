// import React from 'react';
import { FaStar } from 'react-icons/fa';

// const Services = () => {
//   return (
//     <div className="p-6 max-w-md text-[#003366]">
//       <h2 className="text-sm font-bold mb-4 uppercase">Services</h2>

//       <p className="text-xs mb-6">
//         <a
//           href="#"
//           className="text-blue-700 underline font-semibold"
//         >
//           This is a Website for Online Examination that students can attend exams online.
//         </a>
//       </p>

//       <ul className="space-y-4 text-sm">
//         <li className="flex items-start gap-2">
//           <FaStar className="text-blue-700 mt-1" />
//           Taking exams from students
//         </li>
//         <li className="flex items-start gap-2">
//           <FaStar className="text-blue-700 mt-1" />
//           Making exams for students
//         </li>
//         <li className="flex items-start gap-2">
//           <FaStar className="text-blue-700 mt-1" />
//           Students can give exams online
//         </li>
//       </ul>
//     </div>
//   );
// };

// export default Services;







import React from 'react';

const Home = () => {
  return (
    <div className="p-15 min-h-screen bg-white">
      <h2 className="text-3xl font-bold text-[#003366] mb-6">Services</h2>
      <p className="text-gray-700 text-lg leading-relaxed">
         This is a Website for Online Examination that students can attend exams online.
       
      </p>
<br>
</br>
<br>
</br>

      
       <ul className="space-y-4 text-sm">
       <li className="flex items-start gap-2">
          <FaStar className="text-blue-700 mt-1" />
          Taking exams from students
        </li>
        <br>
</br>
        <li className="flex items-start gap-2">
         <FaStar className="text-blue-700 mt-1" />
           Making exams for students
        </li>
        <br>
</br>
        <li className="flex items-start gap-2">
           <FaStar className="text-blue-700 mt-1" />
         Students can give exams online
        </li>
      </ul>
    </div>
  );
};

export default Home;
