import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#1658a0] text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h2 className="text-lg font-bold mb-2">EXAMINATION SYSTEM</h2>
          <p>This is the final exam of math<br />6th semester</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">INFORMATION</h2>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
            <li><a href="#" className="hover:underline">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">QUICK LINKS</h2>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">Services</a></li>
            <li><a href="#" className="hover:underline">About Us</a></li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">CONTACT US</h2>
          <p>149 Majid, Ahmadzadz, district 14, KDR – Afghanistan</p>
          <p className="mt-1">+93796038589</p>
          <p className="mt-1">sohaila.wkb@gmail.com</p>
        </div>
      </div>

      <div className="border-t border-white py-4 text-center text-xs font-semibold">
        <p>COPYRIGHT 2022 KDR | ALL RIGHTS RESERVED</p>
      </div>
    </footer>
  );
};

export default Footer;
