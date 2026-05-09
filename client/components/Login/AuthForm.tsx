'use client';

import { useUserStore } from '@/store/useUserStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router=useRouter()

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (activeTab === 'register') {
        const res = await axios.post(`http://localhost:4000/api/auth/register`, {
          name: e.target.name.value,
          email: e.target.email.value,
          password: e.target.password.value,
          role: e.target.role.value,
          schoolCategory: e.target.schoolCategory.value,
        }, { withCredentials: true });
        
        setSuccess('Registered successfully! Logging you in...');
        e.target.reset();
        useUserStore.getState().setUser(res.data.user);
        toast.success("Registered successfully! Logging you in...");
        router.push('/');
      } else {
        const res = await axios.post(`http://localhost:4000/api/auth/login`, {
          email: e.target.email.value,
          password: e.target.password.value,
        }, { withCredentials: true });
        
        setSuccess('Logged in successfully!');
        e.target.reset();
        useUserStore.getState().setUser(res.data.user);
        toast.success("Logged in successfully! ");
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
      console.log(err);
    }
  }

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
            type="button"
            onClick={() => setActiveTab('login')}
            className={`relative flex-1 py-3 text-center font-bold text-sm z-10 transition-colors duration-300 ${activeTab === 'login' ? 'text-[#d60000]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Login
          </button>
          <button 
            type="button"
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

          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
          {success && <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded">{success}</div>}

          <form className="relative overflow-hidden" onSubmit={handleSubmit}>
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
                  <input type="text" name="name" className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white" placeholder="John Doe" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                    <select name="role" className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white text-gray-700">
                      <option value="USER">Student</option>
                      <option value="ALUMNI">Alumni</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">School</label>
                    <select name="schoolCategory" className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white text-gray-700">
                      <option value="School_of_Engineering">Engineering</option>
                      <option value="School_of_law">Law</option>
                      <option value="School_of_agriculture">Agriculture</option>
                      <option value="School_of_Medicine">Medicine</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input type="email" name="email" required className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white" placeholder="you@example.com" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <div className={`transition-all duration-300 ${activeTab === 'login' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <a href="#" className="text-xs text-[#d60000] hover:underline font-bold">Forgot?</a>
                  </div>
                </div>
                <input type="password" name="password" required className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white" placeholder="••••••••" />
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
                  <input type="checkbox" id="terms" required={activeTab === 'register'} className="mt-1 rounded border-gray-300 text-[#d60000] focus:ring-[#d60000] w-4 h-4 cursor-pointer" />
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
