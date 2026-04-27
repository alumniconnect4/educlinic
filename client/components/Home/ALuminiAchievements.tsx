import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AlumniCardProps {
  name: string;
  role: string;
  company: string;
  batch: string;
  branch: string;
  image?: string;
}

const alumniData: AlumniCardProps[] = [
  {
    name: 'Sidhanshu Monga',
    role: 'Sr. Software Developer',
    company: 'Google',
    batch: 'Batch 2018',
    branch: 'CSE',
    image: '/alumini/sidhanshu.png',
  },
  {
    name: 'Aish Monga',
    role: 'Software Dev Engineer',
    company: 'IBM',
    batch: 'Batch 2019',
    branch: 'CSE',
    image: '/alumini/aish.png',
  },
  {
    name: 'Yerramili Tarun',
    role: 'Head - Central Operations',
    company: 'Amazon',
    batch: 'Batch 2019',
    branch: 'CSE',
    image: '/alumini/yerramili.png',
  },
  {
    name: 'Raveena Monga',
    role: 'Sr. Analyst',
    company: 'Deloitte',
    batch: 'Batch 2015',
    branch: 'CSE',
    image: '/alumini/raveena.png',
  },
];

const AlumniCard: React.FC<AlumniCardProps> = ({
  name,
  role,
  company,
  batch,
  branch,
  image,
}) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 flex flex-col transition-transform hover:-translate-y-1 duration-300">
      <div className="h-48 lg:h-78 bg-[#b8cffa] relative p-4 flex justify-end overflow-hidden">
        {image && (
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover object-center z-0"
          />
        )}
        <div className="bg-white text-gray-800 text-xs font-bold px-4 py-1.5 rounded-full h-fit flex items-center shadow-sm relative z-10">
          {company}
        </div>
      </div>

      <div className="px-6 pt-12 pb-6 relative flex-grow flex flex-col">
        <div className="flex-grow">
          <h3 className="font-bold text-[#111827] text-lg leading-tight">
            {name}
          </h3>
          <p className="text-gray-500 text-sm mt-1">{role}</p>
        </div>

        <div className="flex gap-2 mt-6">
          <span className="bg-[#f1f5f9] text-[#475569] text-xs px-3 py-1.5 rounded-full font-medium">
            {batch}
          </span>
          <span className="bg-[#f1f5f9] text-[#475569] text-xs px-3 py-1.5 rounded-full font-medium">
            {branch}
          </span>
        </div>
      </div>
    </div>
  );
};

const ALuminiAchievements = () => {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12 lg:px-32 xl:px-58 w-full bg-white">
      <div className="flex flex-col mb-14">
        <div className="inline-flex items-center justify-center space-x-2 bg-[#fee2e2] text-[#d60000] px-4 py-1.5 rounded-full text-xs font-bold tracking-wide w-fit mb-6 uppercase">
          OUR DISTINGUISHED ALUMNI
        </div>

        <h2 className="text-4xl md:text-[2.75rem] font-bold text-[#111827] leading-[1.1] tracking-tight mb-4">
          Alumni Achievements
        </h2>
        <p className="text-base sm:text-lg text-gray-500 max-w-2xl leading-relaxed">
          Our graduates are making an impact at the world's most prestigious
          organizations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {alumniData.map((alumni, index) => (
          <AlumniCard key={index} {...alumni} />
        ))}
      </div>

      <Link
        href="/alumni"
        className="inline-flex items-center justify-center space-x-2 bg-[#d60000] hover:bg-[#b80000] text-white px-6 py-3.5 rounded-md font-semibold transition-all shadow-md hover:shadow-lg w-fit"
      >
        <span>View All Alumni Stories</span>
        <ArrowRight size={18} />
      </Link>
    </section>
  );
};

export default ALuminiAchievements;
