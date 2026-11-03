import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Alumnus {
  id: string;
  name: string;
  role: string;
  company: string;
  batch: string;
  branch: string;
  image: string;
}

const alumniData: Alumnus[] = [
  {
    id: 'sidhanshu-monga',
    name: 'Sidhanshu Monga',
    role: 'Sr. Software Developer',
    company: 'Google',
    batch: '2018',
    branch: 'CSE',
    image: '/images/sidhanshu.png',
  },
  {
    id: 'aish-monga',
    name: 'Aish Monga',
    role: 'Software Dev Engineer',
    company: 'IBM',
    batch: '2019',
    branch: 'CSE',
    image: '/images/aish.png',
  },
  {
    id: 'yerramili-tarun',
    name: 'Yerramili Tarun',
    role: 'Head — Central Operations',
    company: 'Amazon',
    batch: '2019',
    branch: 'CSE',
    image: '/images/yerramili.png',
  },
  {
    id: 'raveena-monga',
    name: 'Raveena Monga',
    role: 'Sr. Analyst',
    company: 'Deloitte',
    batch: '2015',
    branch: 'CSE',
    image: '/images/raveena.png',
  },
];

const ALuminiAchievements = () => {
  return (
    <section className="bg-white py-12 md:py-20 w-full">
      <div className="w-full px-4 md:px-8 lg:px-16 xl:px-32">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">
              Alumni Spotlight
            </h2>
            <p className="text-gray-500 mt-2 text-sm max-w-xl">
              From these corridors to the world&apos;s biggest stages. Meet the
              leaders shaping the future.
            </p>
          </div>
          <Link
            href="/alumni"
            className="hidden md:inline-flex px-6 py-2 border border-[#a62025] text-[#a62025] hover:bg-[#a62025] hover:text-white rounded font-medium transition-colors cursor-pointer"
          >
            View Directory
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {alumniData.map((alum) => (
            <div
              key={alum.id}
              className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gray-100 -z-10" />

              <Image
                src={alum.image}
                alt={`Portrait of ${alum.name}`}
                fill
                className="object-cover transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-start justify-end">
                <span className="bg-[#a62025] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider mb-2">
                  {alum.company}
                </span>
                <h3 className="font-bold text-white text-xl leading-tight">
                  {alum.name}
                </h3>
                <p className="text-white/80 text-sm mt-1 font-medium">
                  {alum.role}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="text-white/60 text-xs border border-white/20 rounded px-2 py-0.5">
                    Batch {alum.batch}
                  </span>
                  <span className="text-white/60 text-xs border border-white/20 rounded px-2 py-0.5">
                    {alum.branch}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/alumni"
            className="px-6 py-2 border border-[#a62025] text-[#a62025] hover:bg-[#a62025] hover:text-white rounded font-medium transition-colors cursor-pointer w-full text-center"
          >
            View Directory
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ALuminiAchievements;
