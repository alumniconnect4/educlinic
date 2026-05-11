import React from 'react';
import { ArrowRight, ArrowDown, Award } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="w-full bg-white flex flex-col min-h-[calc(100vh-100px)]">
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between py-12 px-6 md:px-12 lg:px-32 xl:px-58 lg:py-20 gap-12 w-full">
        <div className="flex-1 flex flex-col items-start space-y-6 max-w-4xl z-10 w-full">

          <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-bold text-[#111827] leading-[1.1] tracking-tight">
            Connecting <br className="hidden lg:block" />
            Generations of Excellence
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed py-2">
            Join 5,000+ BFCET alumni shaping the world's most innovative
            organizations. Your network, your legacy — stronger together.
          </p>

          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2 w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-[#d60000] hover:bg-[#b80000] text-white px-8 py-3.5 rounded-md font-semibold transition-all shadow-md hover:shadow-lg">
              Explore Alumni Network
            </button>
            <button className="w-full sm:w-auto bg-transparent border border-gray-300 hover:border-gray-800 text-gray-800 px-8 py-3.5 rounded-md font-semibold transition-all flex items-center justify-center space-x-2 hover:bg-gray-50">
              <span>View Events</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="w-full lg:w-auto flex justify-center lg:justify-end z-10 relative mt-8 lg:mt-0">
          <div className="relative w-full max-w-[400px]">
            <div className="absolute -inset-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-[2rem] blur-2xl opacity-60 pointer-events-none"></div>

            <div className="relative bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex flex-col transform transition-transform hover:translate-y-[-4px] duration-300">
              <div className="bg-[#1e2336] p-8 pb-10">
                <div className="flex items-center space-x-2 text-yellow-600 mb-4">
                  <Award size={14} className="stroke-[2.5]" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Alumni Spotlight
                  </span>
                </div>
                <h3 className="text-[26px] font-bold text-white mb-1">
                  Sidhanshu Monga
                </h3>
                <p className="text-gray-300 text-sm">
                  Sr. Software Developer — Google
                </p>
              </div>

              <div className="p-8 pt-7 relative bg-white flex flex-col">
                <p className="text-gray-600 mb-8 leading-relaxed text-[15px]">
                  "BFCET shaped my journey. The faculty and environment here
                  prepared me for the global tech industry."
                </p>
                <div className="flex items-center space-x-3 mb-8">
                  <span className="bg-[#eff6ff] text-[#1e40af] px-3.5 py-1.5 rounded-full text-xs font-semibold">
                    Batch 2018
                  </span>
                  <span className="bg-[#ecfdf5] text-[#047857] px-3.5 py-1.5 rounded-full text-xs font-semibold">
                    Google
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-auto relative">
        <div className="bg-[#161f36] w-full">
          <div className="px-6 md:px-12 lg:px-32 xl:px-58 py-10 w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-gray-700">
              <div className="flex flex-col items-center sm:items-start md:px-8 text-center sm:text-left first:pl-0">
                <span className="text-[2rem] font-bold text-white mb-1">
                  5000+
                </span>
                <span className="text-gray-400 text-xs sm:text-sm">
                  Alumni Worldwide
                </span>
              </div>

              <div className="flex flex-col items-center sm:items-start md:px-8 text-center sm:text-left">
                <span className="text-[2rem] font-bold text-white mb-1">
                  200+
                </span>
                <span className="text-gray-400 text-xs sm:text-sm">
                  Top Recruiters
                </span>
              </div>

              <div className="flex flex-col items-center sm:items-start md:px-8 text-center sm:text-left">
                <span className="text-[2rem] font-bold text-white mb-1">
                  42 LPA
                </span>
                <span className="text-gray-400 text-xs sm:text-sm">
                  Highest Package
                </span>
              </div>

              <div className="flex flex-col items-center sm:items-start md:px-8 text-center sm:text-left last:pr-0">
                <span className="text-[2rem] font-bold text-white mb-1">
                  NAAC A+
                </span>
                <span className="text-gray-400 text-xs sm:text-sm">
                  Accreditation
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
