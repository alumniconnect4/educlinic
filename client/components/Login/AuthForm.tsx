'use client';

import React, { useState } from 'react';

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div className="w-full lg:w-5/12 max-w-md z-10 relative">
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden relative border-t-4 border-[#d60000]">
        
        <div className="relative flex p-1 bg-gray-100 border-b border-gray-200">
          <div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded shadow-sm border border-gray-200 transition-all duration-300 ease-in-out"
            style={{ 
              transform: activeTab === 'login' ? 'translateX(0)' : 'translateX(100%)',
              left: activeTab === 'login' ? '4px' : 'calc(4px)'
            }}
          />
          <button 
            onClick={() => setActiveTab('login')}
            className={`relative flex-1 py-3 text-center font-bold text-sm z-10 transition-colors duration-300 ${activeTab === 'login' ? 'text-[#d60000]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setActiveTab('register')}
            className={`relative flex-1 py-3 text-center font-bold text-sm z-10 transition-colors duration-300 ${activeTab === 'register' ? 'text-[#d60000]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Register
          </button>
        </div>

        <div className="p-8 relative">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {activeTab === 'login' ? 'Welcome Back!' : 'Join the Network'}
          </h2>

          <form className="relative overflow-hidden" onSubmit={(e) => e.preventDefault()}>
            <div 
              className="transition-all duration-500 ease-in-out grid"
              style={{
                gridTemplateRows: activeTab === 'register' ? '1fr' : '0fr',
                opacity: activeTab === 'register' ? 1 : 0,
                visibility: activeTab === 'register' ? 'visible' : 'hidden',
                marginBottom: activeTab === 'register' ? '1rem' : '0'
              }}
            >
              <div className="overflow-hidden space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Graduation Year</label>
                  <select className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white text-gray-700">
                    <option value="">Select Year</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="older">Older</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input type="email" className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white" placeholder="you@example.com" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <div className={`transition-all duration-300 ${activeTab === 'login' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <a href="#" className="text-xs text-[#d60000] hover:underline font-bold">Forgot?</a>
                  </div>
                </div>
                <input type="password" className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white" placeholder="••••••••" />
              </div>
            </div>

            <div 
              className="transition-all duration-500 ease-in-out grid"
              style={{
                gridTemplateRows: activeTab === 'register' ? '1fr' : '0fr',
                opacity: activeTab === 'register' ? 1 : 0,
                marginTop: activeTab === 'register' ? '1rem' : '0'
              }}
            >
              <div className="overflow-hidden">
                <div className="flex items-start space-x-3 pt-2">
                  <input type="checkbox" id="terms" className="mt-1 rounded border-gray-300 text-[#d60000] focus:ring-[#d60000] w-4 h-4 cursor-pointer" />
                  <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer font-medium">
                    I agree to connect with the BFGI student network and abide by the community guidelines.
                  </label>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#d60000] hover:bg-[#b80000] text-white font-bold py-3 rounded-md transition-all mt-6 shadow-md"
            >
              {activeTab === 'login' ? 'LOGIN' : 'REGISTER'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
