import React from 'react';

const comments = [
  {
    name: "CRISTINA JENSON",
    avatar: "./public/cooment1.jpg",
    text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit...",
    highlight: false,
  },
  {
    name: "MAX JEFFERSON",
    avatar: "./public/cooment2.jpg",
    text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit...",
    highlight: true,
  },
  {
    name: "MARK JOGEL",
    avatar: "./public/comment2.jpg",
    text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit...",
    highlight: false,
  },
];

const CommentsSection = () => {
  return (
    <div className="p-8 bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Comments</h2>
      {comments.map((comment, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-4 p-4 mb-4 rounded-md ${
            comment.highlight ? 'bg-gray-200' : 'bg-gray-100'
          }`}
        >
          <img src={comment.avatar} alt={comment.name} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h3 className="font-semibold text-sm">{comment.name}</h3>
            <p className="text-gray-700 text-sm">{comment.text}</p>
          </div>
        </div>
      ))}

      <div className="mt-8">
        <h3 className="text-red-600 font-bold mb-2">WRITE A COMMENT</h3>
        <form className="flex flex-col gap-3 max-w-md">
          <input type="text" placeholder="Name" className="border border-red-400 px-4 py-2" />
          <input type="email" placeholder="E-mail" className="border border-red-400 px-4 py-2" />
          <textarea placeholder="Comment..." rows="4" className="border border-red-400 px-4 py-2"></textarea>
          <button type="submit" className="bg-gray-500 text-white px-6 py-2 w-fit rounded">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentsSection;
