'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast as hotToast } from 'react-hot-toast';

export default function RNDCellPage() {
  const heroImages = ['/gallery/slider6-1.jpg', '/gallery/slide-bfcet-6.jpg'];

  const [currentSlide, setCurrentSlide] = useState(0);

  const handleExternalLink = (
    e: React.MouseEvent,
    url: string,
    name?: string
  ) => {
    if (url.startsWith('http')) {
      e.preventDefault();
      hotToast(
        (t) => (
          <div className="flex flex-col gap-4 min-w-[280px] p-2">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                External Link
              </h3>
              <p className="text-[15px] text-gray-600">
                Continue to {name ? <b>{name}</b> : 'external site'}?
              </p>
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => hotToast.dismiss(t.id)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer rounded-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  hotToast.dismiss(t.id);
                  window.open(url, '_blank');
                }}
                className="px-4 py-2 text-sm font-medium bg-[#d60000] text-white hover:bg-[#b30000] transition-colors cursor-pointer rounded-none"
              >
                Continue
              </button>
            </div>
          </div>
        ),
        {
          duration: 6000,
          position: 'bottom-right',
          style: { borderRadius: '0px' },
        }
      );
    }
  };

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

  const teamMembers = [
    { name: 'Dr. Nitin Kumar Saxena', role: 'Associate Dean, R & D' },
    { name: 'Dr. Amandeep', role: 'Coordinator, SSD Department' },
    { name: 'Dr. Nisha Raheja', role: 'Co-coordinator, Electrical Department' },
    {
      name: 'Dr. Nitika',
      role: 'Co-coordinator, Computer Science & Engineering Department',
    },
    { name: 'Dr. Rahul Sen', role: 'Co-coordinator, Mechanical Department' },
    { name: 'Dr. Navneet Kaur', role: 'Co-coordinator, Civil Department' },
    { name: 'Dr. Gagandeep Singh', role: 'Co-coordinator, SSD Department' },
    {
      name: 'Dr. Manish Singla',
      role: 'Co-coordinator, CSE (AIML) Department',
    },
  ];

  const collaborations = [
    { name: 'IIT ROPAR', src: '/mous/IIT_MOU-1024x678.jpg' },
    { name: 'INTEL', src: '/mous/intel.jpg' },
    { name: 'FESTO', src: '/mous/festo.jpg' },
    { name: 'EDGATE', src: '/mous/edgate.jpg' },
    { name: 'INFOSYS', src: '/mous/infosys.jpg' },
    { name: 'WADHWANI FOUNDATION', src: '/mous/Wadhwani.jpg' },
    { name: 'AIIMS, BATHINDA', src: '/mous/aiims.jpg' },
    { name: 'NIT DELHI', src: '/mous/nit.jpg' },
  ];

  const coeLogos = [
    '/coe/intel.png',
    '/coe/schneider.jpeg',
    '/coe/festo.png',
    '/coe/awadh.png',
    '/coe/edgate.jpg',
    '/coe/qvolv.webp',
  ];

  return (
    <div className="min-h-screen">
      <div className="relative w-full h-[400px] md:h-[550px] bg-gray-200 overflow-hidden group">
        {heroImages.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <Image
              src={src}
              alt={`R&D Cell Slider ${index + 1}`}
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
              className={`w-2.5 h-2.5  rounded-full transition-all ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      </div>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-[#b91c1c] mb-2">
            Research & Innovation
          </h2>
          <div className="w-10 h-1 bg-yellow-400 mb-6"></div>
          <div className="space-y-6 text-gray-700 leading-relaxed text-justify text-sm">
            <p>
              Baba Farid College of Engineering and Technology always promote
              the research culture in the emerging areas of Engineering &
              Technology and would strive to provide the necessary environment
              and facilities to nurture the creative minds. The institution is
              committed to promote research activities to address global
              challenges and well-being of the society. To build on these aims,
              BFCET has exclusively established the Research & Development Cell
              to promote quality research and research infrastructure.
            </p>
            <p>
              We believe in treading our path to success and our achievements
              over the last few years from its establishment in 2008, stands
              witness to this fact. BFCET has organised a number of
              international and national conferences & faculty development
              programme sponsored by Council of Scientific & Industrial Research
              (CSIR), All India Council for Technical Education (AICTE), Indian
              Society for Technical Education (ISTE), Maharaja Ranjit Singh
              Punjab Technical University (MRSPTU), etc. The faculty is actively
              engaged in cutting edge research in the frontier areas. BFCET has
              signed the MoU with International & National Institutes and
              Industries like the University of Arad Romania, AIIMS, INTEL,
              FESTO, EdGate, Central University of Punjab, Council of Engineers
              and Valuers, Sportking Industries Enovation Lab LLP, Jay Bee
              Industry, are few names.
            </p>
            <p>
              BFCET with the mission to promote the research in the campus,
              every year subscribes the package of high-quality Research
              Journals for its faculty and students. BFCET has subscribed the
              packages from world reputed publishers IEEE, EBSCO and INFLIBNET
              with the E-Books package as well. BFCET always support the faculty
              for capacity building and under its R & D policy faculty members
              are provided with financial grant to present the paper in
              conferences within India as well as abroad.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-center text-black mb-8">
              Policies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  title: 'R&D Policy',
                  link: 'https://www.bfcet.com/wp-content/uploads/2025/03/BFGI-RESEARCH-AND-DEVELOPMENT-POLICY.pdf',
                },
                {
                  title: 'Consultancy Policy',
                  link: 'https://www.bfcet.com/wp-content/uploads/2025/07/Consultancy-Policy.pdf',
                },
                {
                  title: 'IPR Policy',
                  link: 'https://www.bfcet.com/wp-content/uploads/2025/07/IPR-Policy.pdf',
                },
                {
                  title: 'Student Project Policy',
                  link: 'https://www.bfcet.com/wp-content/uploads/2025/07/Consultancy-Policy.pdf',
                },
              ].map((policy, i) => (
                <div
                  key={i}
                  className="group bg-white py-8 px-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center flex flex-col items-center justify-between min-h-[160px]"
                >
                  <h4 className="font-bold text-[#b91c1c] mb-5 text-base">
                    {policy.title}
                  </h4>
                  <Link
                    href={policy.link}
                    onClick={(e) =>
                      handleExternalLink(e, policy.link, policy.title)
                    }
                    className="bg-[#333333] cursor-pointer hover:bg-[#222222] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-colors inline-block w-full"
                  >
                    Click here to view
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-center text-black mb-8">
              <span className="text-[#b91c1c]">Institution's</span> Innovation
              Council
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  title: 'IIC Cell',
                  link: 'https://www.bfcet.com/research-development/institutions-innovation-council-iic-cell/',
                },
                { title: 'Resolution', link: '#' },
                { title: 'Activities', link: '#' },
                { title: 'Achievements', link: '#' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group bg-white py-8 px-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center flex flex-col items-center justify-between min-h-[160px]"
                >
                  <h4 className="font-bold text-[#b91c1c] mb-5 text-base">
                    {item.title}
                  </h4>
                  <Link
                    href={item.link}
                    onClick={(e) => {
                      if (item.link === '#') {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        handleExternalLink(e, item.link, item.title);
                      }
                    }}
                    className="bg-[#333333] cursor-pointer hover:bg-[#222222] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-colors inline-block w-full"
                  >
                    Click here to view
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h3 className="text-3xl font-bold text-center text-black mb-10">
            <span className="text-[#b91c1c]">Patents</span> & Publications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center flex flex-col items-center justify-between border border-gray-100">
              <h4 className="font-bold text-[#b91c1c] mb-6 text-lg">Patents</h4>
              <div className="w-full relative aspect-video rounded-lg overflow-hidden mb-8">
                <Image
                  src="/patent.webp"
                  alt="Patents"
                  fill
                  className="object-cover"
                />
              </div>
              <Link
                href="https://www.bfcet.com/p/"
                onClick={(e) =>
                  handleExternalLink(e, 'https://www.bfcet.com/p/', 'Patents')
                }
                className="bg-[#333333] cursor-pointer hover:bg-[#222222] text-white px-10 py-3 rounded-full text-sm font-semibold transition-colors inline-block"
              >
                Click here
              </Link>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center flex flex-col items-center justify-between border border-gray-100">
              <h4 className="font-bold text-[#b91c1c] mb-6 text-lg">
                Journals
              </h4>
              <div className="w-full relative aspect-video rounded-lg overflow-hidden mb-8">
                <Image
                  src="/journal.png"
                  alt="Journals"
                  fill
                  className="object-cover"
                />
              </div>
              <Link
                href="https://www.bfcet.com/research-development-old/journals/"
                onClick={(e) =>
                  handleExternalLink(
                    e,
                    'https://www.bfcet.com/research-development-old/journals/',
                    'Journals'
                  )
                }
                className="bg-[#333333] cursor-pointer hover:bg-[#222222] text-white px-10 py-3 rounded-full text-sm font-semibold transition-colors inline-block"
              >
                Click here
              </Link>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center flex flex-col items-center justify-between border border-gray-100">
              <h4 className="font-bold text-[#b91c1c] mb-6 text-lg">Books</h4>
              <div className="w-full relative aspect-video rounded-lg overflow-hidden mb-8">
                <Image
                  src="/books.webp"
                  alt="Books"
                  fill
                  className="object-cover"
                />
              </div>
              <Link
                href="https://www.bfcet.com/research-development-old/books/"
                onClick={(e) =>
                  handleExternalLink(
                    e,
                    'https://www.bfcet.com/research-development-old/books/',
                    'Books'
                  )
                }
                className="bg-[#333333] cursor-pointer hover:bg-[#222222] text-white px-10 py-3 rounded-full text-sm font-semibold transition-colors inline-block"
              >
                Click here
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl font-bold text-black mb-10">
            <span className="text-[#b91c1c]">MoUs</span> & Collaborations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {collaborations.map((collab, i) => (
              <div key={i} className="flex flex-col bg-transparent">
                <div className="relative w-full aspect-[4/3] bg-gray-200 overflow-hidden mb-3">
                  <Image
                    src={collab.src}
                    alt={collab.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="font-bold text-black text-sm uppercase tracking-wide">
                  {collab.name}
                </p>
              </div>
            ))}
          </div>

          <p className="text-gray-700 max-w-5xl mx-auto mb-10 leading-relaxed text-justify text-sm">
            In our quest to bridge the gap between industry and academia, BFCET
            has tied up with Global Tech players and institutions to cultivate
            synergistic alliances for keeping abreast of the market needs and
            implement an industry-relevant curriculum. The purpose of the MoU is
            to have mutual intentions to collaborate on projects needed for
            companies and research, with experienced faculty who have had
            successful careers in industry and bright students who are willing
            to share their knowledge for growth and mutual gain, on the areas
            specified such as Industrial Visits, Guest Lectures, Research &
            Development and placements
          </p>

          <button className="bg-white text-black px-8 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-shadow border border-gray-100 text-sm">
            <Link
              href="https://www.bfcet.com/mouc/"
              onClick={(e) =>
                handleExternalLink(
                  e,
                  'https://www.bfcet.com/mouc/',
                  'MoUs & Collaborations'
                )
              }
            >
              Read More
            </Link>
          </button>
        </div>
      </section>

      <section className="bg-white">
        <div className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 flex flex-col items-center">
                <h2 className="text-3xl font-bold mb-6 text-center">
                  <span className="text-[#b91c1c]">Conferences at</span>{' '}
                  <span className="text-black">BFCET</span>
                </h2>
                <p className="text-gray-700 leading-relaxed mb-8 text-justify text-sm">
                  Conference is an opportunity to celebrate the spirit of
                  sharing knowledge and ideas for the welfare of humanity.
                  Conferences bring together thought leaders, policymakers,
                  researchers, scholars, and students to share, exchange, and
                  deliberate on the existent knowledge and potential
                  opportunities in their specific fields. Conferences also
                  provide a great platform to participants to collaborate with
                  their peers across the globe.
                </p>
                <button className="bg-white text-black px-8 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-shadow border border-gray-100 text-sm">
                  <Link
                    href="https://www.bfcet.com/research-development/conferences/"
                    onClick={(e) =>
                      handleExternalLink(
                        e,
                        'https://www.bfcet.com/research-development/conferences/',
                        'Conferences'
                      )
                    }
                  >
                    Read More
                  </Link>
                </button>
              </div>
              <div className="md:w-1/2 w-full">
                <div className="relative w-full aspect-[16/9] shadow-[0_0_15px_rgba(0,0,0,0.15)] border-[8px] border-white">
                  <Image
                    src="/gallery/slide-bfcet-6.jpg"
                    alt="Conferences"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-12 bg-gray-100">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="md:w-1/2 flex flex-col items-center">
                <h2 className="text-3xl font-bold mb-6 text-center">
                  <span className="text-[#b91c1c]">Faculty Development</span>{' '}
                  <span className="text-black">Programs</span>
                </h2>
                <p className="text-gray-700 leading-relaxed mb-8 text-justify text-sm">
                  We give gigantic importance to our facilities & learning
                  resources and continuously ensure that our staff and students
                  have full access to everything they need to help them succeed
                  in their work and study. To develop discipline-specific/
                  multi-disciplinary technical skills BFCET organizes faculty
                  devdelopment programme which emphasizes on imparting the
                  practical skills in order to make them ready for the
                  challenges in the digitalized transformation of technical
                  education.
                </p>
                <button className="bg-white text-black px-8 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-shadow border border-gray-100 text-sm">
                  <Link
                    href="https://www.bfcet.com/research-development-old/faculty-development-programme/"
                    onClick={(e) =>
                      handleExternalLink(
                        e,
                        'https://www.bfcet.com/research-development-old/faculty-development-programme/',
                        'FDPs'
                      )
                    }
                  >
                    Read More
                  </Link>
                </button>
              </div>
              <div className="md:w-1/2 w-full">
                <div className="relative w-full aspect-[16/9] shadow-[0_0_15px_rgba(0,0,0,0.15)] border-[8px] border-white">
                  <Image
                    src="/gallery/slider6-1.jpg"
                    alt="FDPs"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl text-center flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-6">
            <span className="text-[#b91c1c]">Centre of</span>{' '}
            <span className="text-black">Excellence</span>
          </h2>
          <p className="text-gray-700 max-w-5xl mx-auto mb-8 leading-relaxed text-justify text-sm">
            BFCET has partnered with Global Tech players such as INTEL, FESTO,
            EdGate Technologies, Qvolv Technologies, Schneider Electric, and
            IHub Awadh for Centre of Excellence to cultivate synergistic
            alliances, stay abreast of market needs, and implement an
            industry-relevant curriculum. Artificial Intelligence, Internet of
            Things, Industrial Automation, Cyber Physical System, AR/VR/MR Labs
            established in collaboration with these industry giants play a
            decisive role in enriching the potential of students and faculty
            members.
          </p>
          <button className="bg-white text-black px-8 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-shadow border border-gray-100 text-sm mb-12">
            <Link
              href="https://www.bfcet.com/industry-partners/"
              onClick={(e) =>
                handleExternalLink(
                  e,
                  'https://www.bfcet.com/industry-partners/',
                  'Centre of Excellence'
                )
              }
            >
              Read More
            </Link>
          </button>
        </div>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-continuous {
            display: flex;
            width: max-content;
            animation: marquee 20s linear infinite;
          }
          .animate-marquee-continuous:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="container mx-auto px-4 max-w-5xl">
          <div className="overflow-hidden w-full relative pb-4">
            <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            <div className="animate-marquee-continuous flex gap-6 pl-6">
              {[...coeLogos, ...coeLogos].map((logo, i) => (
                <div
                  key={i}
                  className="relative w-48 h-24 bg-white border border-gray-100 flex items-center justify-center p-2 flex-shrink-0 shadow-sm rounded-md hover:shadow-md transition-shadow cursor-pointer"
                >
                  <Image
                    src={logo}
                    alt="Partner Logo"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-black mb-10 text-center underline underline-offset-8 decoration-black decoration-2">
            R&D Team
          </h2>

          <div className="bg-white rounded-none border border-gray-300 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#00a859] text-white">
                    <th className="py-3 px-4 font-semibold border border-[#00a859] border-r-white w-[10%] text-sm">
                      Sr. No.
                    </th>
                    <th className="py-3 px-4 font-semibold border border-[#00a859] border-x-white w-[45%] text-sm">
                      Name
                    </th>
                    <th className="py-3 px-4 font-semibold border border-[#00a859] border-l-white w-[45%] text-sm">
                      Designation
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 text-sm">
                  {teamMembers.map((member, idx) => (
                    <tr
                      key={idx}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#f4f7fc]'}`}
                    >
                      <td className="py-3 px-4 border border-gray-300">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 border border-gray-300">
                        {member.name}
                      </td>
                      <td className="py-3 px-4 border border-gray-300">
                        {member.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
