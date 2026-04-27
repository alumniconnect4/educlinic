import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#101828] text-white pt-16 pb-8 border-t border-gray-800">
      <div className="px-6 md:px-12 lg:px-32 xl:px-58 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
          <div className="flex flex-col pr-4 lg:pr-8">
            <h2 className="text-[26px] font-bold text-white mb-2">BFCET</h2>
            <p className="text-gray-300 text-sm mb-4">
              Baba Farid College of Engineering & Technology
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empowering generations of engineers, innovators and entrepreneurs
              since 1998.
            </p>
            <div className="flex items-center space-x-3">
              <Link
                href="#"
                className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z" />
                </svg>
              </Link>
              <Link
                href="#"
                className="w-8 h-8 rounded-full bg-linear-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </Link>
              <Link
                href="#"
                className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </Link>
              <Link
                href="#"
                className="w-8 h-8 rounded-full bg-[#0077B5] flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667h-3.554V9h3.411v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.269 2.37 4.269 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-[#eab308] font-semibold mb-6 text-[15px]">
              Quick Links
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  About BFCET
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Alumni Portal
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h3 className="text-[#eab308] font-semibold mb-6 text-[15px]">
              Alumni Services
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Register as Alumni
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Update Profile
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Job Board
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Mentorship
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Alumni Benefits
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Chapters
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h3 className="text-[#eab308] font-semibold mb-6 text-[15px]">
              Contact
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>Muktsar Road, Bathinda</li>
              <li>Punjab, India - 151001</li>
              <li>+91 8081-100-200</li>
              <li>alumni@bfcet.com</li>
              <li>Mon-Fri: 08:50 - 04:00</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-700/50 flex justify-center text-center">
          <p className="text-gray-400 text-xs text-center w-full">
            © 2025 Baba Farid College of Engineering & Technology. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
