import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone } from 'lucide-react';

const AuthNav = () => {
  return (
    <nav className="w-full absolute top-0 left-0 z-50 px-6 lg:px-12 py-4 flex flex-col md:flex-row items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="flex items-center justify-center md:justify-start w-[180px] md:w-[220px] h-[60px] md:h-[50px]">
        <Image src="/logo3.png" alt="BFGI Logo" width={170} height={60} className="object-contain drop-shadow-sm scale-[1.5] md:scale-[1.2] origin-center md:origin-left lg:mt-6" />
      </div>
      
      <div className="flex items-center space-x-6 text-sm font-medium text-white mt-8 md:mt-0">
        <div className="hidden md:flex items-center space-x-2">
          <Mail size={16} className="text-white/80" />
          <span>alumni@bfcet.com</span>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <Phone size={16} className="text-white/80" />
          <span>+91 8081-100-200</span>
        </div>
        <Link href="/" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-all ml-4 px-4 py-2 rounded border border-white/30 hover:bg-white/10">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    </nav>
  );
};

export default AuthNav;
