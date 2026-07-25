'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

export default function IncubationPage() {
  const startupLogos = [
    '/startups/1-2.jpg',
    '/startups/3-2.jpg',
    '/startups/4-2.jpg',
    '/startups/5-2.jpg',
    '/startups/6-2.jpg',
    '/startups/7-2.jpg',
    '/startups/8-2.jpg',
    '/startups/9-2.jpg',
    '/startups/10-2.jpg',
  ];

  const collaborationLogos = [
    '/collaborations/EPIC.jpg',
    '/collaborations/IITI-Drishti.png',
    '/collaborations/logo-innovation-mission-punjab.png',
    '/collaborations/logo-marwari-catalysts.jpg',
    '/collaborations/Santosh-Startups-Forum-e1693477043554.jpeg',
  ];

  const heroImages = ['/gallery/slider6-1.jpg', '/gallery/slide-bfcet-6.jpg'];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      );
    }, 8000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="relative w-full h-[400px] md:h-[550px] bg-gray-200 overflow-hidden group">
        {heroImages.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <Image
              src={src}
              alt={`Incubation Centre Slider ${index + 1}`}
              fill
              className="object-cover object-top"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      </div>

      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-bold text-[#142340] mb-8 border-b-2 border-[#142340] pb-2 inline-block">
          Incubation Centre
        </h1>
        <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
          <p>
            To create an ecosystem of Startups & inculcate the entrepreneurial
            traits. BFCET has established an Incubation centre with an objective
            to support the budding entrepreneurs to establish their new venture
            through constant guidance & mentoring through various training
            programs & industrial collaborations.
          </p>
          <p>
            Incubation Centre is registered under the Societies Registration
            Act, 1860 to promote innovation and entrepreneurship. To accomplish
            its goal, Incubation centre facilitates startups, enterprises,
            faculty and students by providing technical and business support &
            services. Incubation centre continuously interacts with various
            Government bodies and departments to enable the students to become
            job providers rather than job seekers.
          </p>
          <p>
            Entrepreneurship is essential for fostering innovation, creating
            employment opportunities, and driving economic development. By
            focusing on promoting innovation and entrepreneurship, Incubation is
            making a positive impact on the community it serves and contributing
            to the larger goal of building a thriving entrepreneurial ecosystem.
          </p>
          <p>
            Incubation program of BFCET aims to nurturing innovative business
            ideas and transforming them into successful ventures. By offering
            such support, it can help startups overcome initial challenges,
            improve their chances of success, and contribute to economic growth
            and job creation in the region. This support includes mentorship,
            access to resources and networks, guidance on business strategy,
            funding assistance, and other valuable assistance that can
            significantly contribute to the success of startups and
            entrepreneurial endeavors.
          </p>
        </div>
      </section>

      <section className="bg-[#f7f4f2] py-16">
        <div className="container mx-auto px-4 max-w-6xl space-y-12">
          <div>
            <h2 className="text-2xl font-bold text-[#142340] mb-4">Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              To foster the entrepreneurial culture and developing leaders from
              diverse backgrounds to address the real time problems with their
              innovative ideas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-[#142340] mb-6">
                Mission
              </h2>
              <ol className="list-decimal list-outside ml-5 space-y-3 text-gray-700 text-sm md:text-base">
                <li>
                  To assist the budding entrepreneurs at all levels from
                  pre-incubation to incubation to enterprise
                </li>
                <li>
                  To provide necessary business support services such as
                  infrastructure, mentoring, training, networking, Legal and
                  Funding etc.
                </li>
                <li>
                  To promote linkages with industries, research institutions,
                  Government agencies and other related organizations engaged in
                  promoting...
                </li>
                <li>Innovation and entrepreneurial spirit.</li>
                <li>
                  To make the School of Entrepreneurship a Self-Sustainable in
                  terms of administration, Process, Partnership & Network and
                  Profitability
                </li>
                <li>
                  To build an environment to motivate and support innovative
                  ideas for taking prototype of society to generate employment
                  opportunities.
                </li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#142340] mb-6">
                Services
              </h2>
              <ol className="list-decimal list-outside ml-5 space-y-3 text-gray-700 text-sm md:text-base">
                <li>Strategy and Business Plan Development</li>
                <li>Technology Validation</li>
                <li>Marketing and Sales Planning</li>
                <li>Financial Compliances</li>
                <li>Legal and Company Issues</li>
                <li>Regulatory Issues</li>
                <li>IP Issues</li>
                <li>HR Issues</li>
                <li>Funding/ Grants from government and private</li>
                <li>Any other support services as required by Incubatees</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl mb-8">
          <h2 className="text-2xl font-bold text-[#142340] border-b-2 border-yellow-500 pb-2 inline-block">
            Our Startups
          </h2>
        </div>
        <div className="relative w-full max-w-6xl mx-auto flex overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <div className="flex w-max">
            <div
              className="flex animate-marquee whitespace-nowrap items-center space-x-12 px-6 py-4"
              style={{ animation: 'marquee-seamless 120s linear infinite' }}
            >
              {Array(4)
                .fill(startupLogos)
                .flat()
                .map((src, idx) => (
                  <div
                    key={`startup-1-${idx}`}
                    className="relative h-24 w-40 flex-shrink-0 flex items-center justify-center"
                  >
                    <Image
                      src={src}
                      alt={`Startup ${idx}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
            </div>
            <div
              className="flex animate-marquee whitespace-nowrap items-center space-x-12 px-6 py-4"
              style={{ animation: 'marquee-seamless 120s linear infinite' }}
              aria-hidden="true"
            >
              {Array(4)
                .fill(startupLogos)
                .flat()
                .map((src, idx) => (
                  <div
                    key={`startup-2-${idx}`}
                    className="relative h-24 w-40 flex-shrink-0 flex items-center justify-center"
                  >
                    <Image
                      src={src}
                      alt={`Startup ${idx}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl mb-8">
          <h2 className="text-2xl font-bold text-[#142340] border-b-2 border-yellow-500 pb-2 inline-block">
            Collaborations
          </h2>
        </div>
        <div className="relative w-full max-w-6xl mx-auto flex overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <div className="flex w-max">
            <div
              className="flex animate-marquee whitespace-nowrap items-center space-x-16 px-8 py-4"
              style={{ animation: 'marquee-seamless 120s linear infinite' }}
            >
              {Array(6)
                .fill(collaborationLogos)
                .flat()
                .map((src, idx) => (
                  <div
                    key={`collab-1-${idx}`}
                    className="relative h-28 w-48 flex-shrink-0 flex items-center justify-center"
                  >
                    <Image
                      src={src}
                      alt={`Collaboration ${idx}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
            </div>
            <div
              className="flex animate-marquee whitespace-nowrap items-center space-x-16 px-8 py-4"
              style={{ animation: 'marquee-seamless 120s linear infinite' }}
              aria-hidden="true"
            >
              {Array(6)
                .fill(collaborationLogos)
                .flat()
                .map((src, idx) => (
                  <div
                    key={`collab-2-${idx}`}
                    className="relative h-28 w-48 flex-shrink-0 flex items-center justify-center"
                  >
                    <Image
                      src={src}
                      alt={`Collaboration ${idx}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 mt-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-[#142340] uppercase tracking-wide border-l-4 border-orange-500 pl-3">
                  OUR CONTACT
                </h3>
                <div className="w-8 h-1 bg-yellow-400 mt-3 mb-6 ml-3"></div>
                <div className="space-y-6 text-sm text-gray-700 ml-3">
                  <div>
                    <p className="font-bold text-gray-900 text-[15px]">
                      Dr. Manish Gupta
                    </p>
                    <p className="text-gray-500 mt-1">
                      Head, Incubation Centre
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-[15px]">
                      Er. Gaurav Narang
                    </p>
                    <p className="text-gray-500 mt-1">CEO, Incubation Centre</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-[15px]">
                      Ms. Tania Sachdeva
                    </p>
                    <p className="text-gray-500 mt-1">Incubation Manager</p>
                  </div>
                </div>
              </div>

              <div className="ml-3 mt-10">
                <h3 className="text-[19px] font-bold text-[#142340] mb-3">
                  For More Information
                </h3>
                <div className="w-8 h-1 bg-yellow-400 mt-2 mb-5"></div>
                <Link
                  href="/contact"
                  className="inline-block bg-[#5c5c5c] hover:bg-gray-700 text-white px-8 py-2.5 text-sm font-medium transition-colors"
                >
                  Click here
                </Link>
              </div>
            </div>

            <div className="space-y-10 pt-2">
              <div className="flex items-start gap-6">
                <div className="bg-[#ea3b3b] p-3.5 rounded-full text-white shrink-0 mt-1 shadow-sm">
                  <Mail size={22} fill="currentColor" className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-[#ea3b3b] text-[15px]">
                    Email Address
                  </p>
                  <div className="w-10 h-[2px] bg-yellow-400 mt-2 mb-3"></div>
                  <a
                    href="mailto:soe@babafaridgroup.edu.in"
                    className="text-sm text-gray-500 font-medium hover:text-gray-900"
                  >
                    soe@babafaridgroup.edu.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="bg-[#ea3b3b] p-3.5 rounded-full text-white shrink-0 mt-1 shadow-sm">
                  <Phone
                    size={22}
                    fill="currentColor"
                    className="text-white border-0"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#ea3b3b] text-[15px]">
                    Call Us
                  </p>
                  <div className="w-10 h-[2px] bg-yellow-400 mt-2 mb-3"></div>
                  <a
                    href="tel:9501117069"
                    className="text-sm text-gray-500 font-medium hover:text-gray-900"
                  >
                    9501117069
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="bg-[#ea3b3b] p-3.5 rounded-full text-white shrink-0 mt-1 shadow-sm">
                  <FaLinkedin size={22} />
                </div>
                <div>
                  <p className="font-bold text-[#ea3b3b] text-[15px]">
                    Social Media
                  </p>
                  <div className="w-10 h-[2px] bg-yellow-400 mt-2 mb-3"></div>
                  <a
                    href="#"
                    className="text-sm text-gray-500 font-medium hover:text-gray-900"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
