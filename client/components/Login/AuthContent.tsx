import React from 'react';
import { GraduationCap, Users, Briefcase, Award } from 'lucide-react';

const AuthContent = () => {
  return (
    <div className="w-full lg:w-1/2 flex flex-col text-white z-10 pt-10 lg:pt-0">
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight text-white drop-shadow-md">
        Connecting BFGI Alumni <br className="hidden lg:block"/> with BFGI Students
      </h1>
      
      <p className="text-gray-200 text-lg max-w-lg mb-10 leading-relaxed drop-shadow-sm">
        Bridge the gap between experience and ambition. Join a powerful network where graduates empower the next generation of BFGI students through mentorship, opportunities, and shared knowledge.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-lg">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded border border-white/30 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-white">5,000+</h3>
            <p className="text-gray-300 text-sm">Active Network</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded border border-white/30 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <Briefcase className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-white">200+</h3>
            <p className="text-gray-300 text-sm">Top Recruiters</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded border border-white/30 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <Award className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-white">42 LPA</h3>
            <p className="text-gray-300 text-sm">Highest Package</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded border border-white/30 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <GraduationCap className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-white">NAAC A+</h3>
            <p className="text-gray-300 text-sm">Accreditation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContent;
