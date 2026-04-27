'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MainNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const routes = ['Home', 'Events', 'Alumni', 'Gallery'];

  return (
    <div className="bg-white w-full shadow-sm border-b border-gray-100">
      <div className="w-full px-4 md:px-12 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Image
            src="/logo1.png"
            alt="College Logo"
            width={220}
            height={60}
            loading="eager"
            className="w-auto h-auto object-contain"
          />
          <Image
            src="/logo2.jpg"
            alt="NAAC Logo"
            width={110}
            height={60}
            className="w-auto h-auto object-contain hidden md:block"
          />
        </div>

        <div className="hidden lg:flex items-center space-x-8">
          {routes.map((route) => {
            const href =
              route === 'Home' ? '/' : `/${route.toLocaleLowerCase()}`;
            const isActive = pathname === href;

            return (
              <Link
                key={route}
                href={href}
                className={`text-sm md:text-base font-semibold py-4 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#d60000] text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-[#d60000]'
                }`}
              >
                {route}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-4">
          <button className="hidden lg:flex bg-[#d60000] hover:bg-[#b30000] text-white px-6 py-2.5 rounded items-center space-x-2 font-medium transition-colors">
            <span>Join Network</span>
            <ArrowRight size={18} />
          </button>

          <button
            className="lg:hidden text-gray-700 hover:text-[#d60000] focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-2 flex flex-col space-y-2 pb-6 shadow-inner">
          {routes.map((route) => (
            <a
              key={route}
              href="#"
              className={`text-base font-medium py-3 px-3 rounded ${
                route === 'Home'
                  ? 'bg-red-50 text-[#d60000]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {route}
            </a>
          ))}
          <button className="bg-[#d60000] hover:bg-[#b30000] text-white px-4 py-3 mt-4 rounded flex items-center justify-center space-x-2 font-medium w-full">
            <span>Join Network</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MainNav;
