import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

interface EventCardProps {
  month: string;
  day: string;
  year: string;
  type: string;
  title: string;
  description: string;
  location: string;
}

const eventsData: EventCardProps[] = [
  {
    month: 'APR',
    day: '27',
    year: '2025',
    type: 'In-Person',
    title: 'Alumni Grand Reunion 2025',
    description:
      'An unforgettable homecoming — reconnect with batchmates, celebrate milestones, and build lifelong bonds on campus.',
    location: 'BFCET Campus, Bathinda',
  },
  {
    month: 'MAY',
    day: '15',
    year: '2025',
    type: 'Hybrid',
    title: 'Vibgyor Techno Fest 2025',
    description:
      "BFGI's biggest international annual festival featuring workshops, tech showcases, and alumni panel discussions.",
    location: 'Main Auditorium, BFCET',
  },
  {
    month: 'JUN',
    day: '09',
    year: '2025',
    type: 'Online',
    title: 'Smart Tech Summer Training',
    description:
      'Industry-relevant training program for alumni looking to upskill in AI, IoT, and emerging technologies.',
    location: 'Online + On Campus',
  },
];

const EventCard: React.FC<EventCardProps> = ({
  month,
  day,
  year,
  type,
  title,
  description,
  location,
}) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 flex flex-col sm:flex-row transition-transform hover:-translate-y-1 duration-300 h-full">
      <div className="bg-[#161f36] text-white sm:w-32 flex flex-row sm:flex-col justify-center items-center py-4 sm:py-8 px-6 sm:px-0 shrink-0">
        <span className="text-[#eab308] text-sm font-bold tracking-wider mr-4 sm:mr-0">
          {month}
        </span>
        <span className="text-4xl font-extrabold my-0 sm:my-1 mr-4 sm:mr-0">
          {day}
        </span>
        <span className="text-gray-400 text-sm">{year}</span>
      </div>

      <div className="p-6 sm:p-8 flex flex-col flex-grow relative bg-white">
        <div className="flex justify-between items-start w-full mb-4">
          <span className="bg-[#fee2e2] text-[#d60000] text-xs font-semibold px-4 py-1.5 rounded-full">
            {type}
          </span>
          <div className="w-2.5 h-2.5 bg-[#d60000] rounded-full mt-2" />
        </div>

        <div className="flex-grow mb-8">
          <h3 className="font-bold text-[#111827] text-xl mb-3 leading-tight">
            {title}
          </h3>
          <p className="text-gray-500 text-[15px] leading-relaxed">
            {description}
          </p>
        </div>

        <hr className="border-gray-200 mb-5" />

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center w-full gap-4 xl:gap-0 mt-auto">
          <div className="flex items-center text-gray-500 text-xs font-medium space-x-2">
            <MapPin size={16} className="text-[#d60000]" />
            <span className="text-gray-500">{location}</span>
          </div>

          <Link
            href="#"
            className="flex items-center space-x-1.5 text-[#111827] font-bold text-sm hover:text-[#d60000] transition-colors group"
          >
            <span>Register Now</span>
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

const UpcomingEvents = () => {
  return (
    <div className="w-full bg-black/5">
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-32 xl:px-58 w-full">
        <div className="flex flex-col mb-14">

          <h2 className="text-4xl md:text-[2.75rem] font-bold text-[#111827] leading-[1.1] tracking-tight mb-4">
            Upcoming Events
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl leading-relaxed">
            Stay connected with the BFCET community through reunions, workshops
            and alumni meets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {eventsData.map((event, index) => (
            <EventCard key={index} {...event} />
          ))}
        </div>

        <Link
          href="/events"
          className="inline-flex items-center justify-center space-x-2 bg-transparent border border-[#d60000] text-[#d60000] hover:bg-[#fee2e2] hover:border-[#fee2e2] px-6 py-3.5 rounded-md font-semibold transition-all w-fit group"
        >
          <span>View All Events</span>
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </section>
    </div>
  );
};

export default UpcomingEvents;
