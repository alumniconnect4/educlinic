'use client';
import React from 'react';
import Image from 'next/image';
import { LeadershipMessage } from './messagesData';

interface LeadershipMessageBlockProps {
  message: LeadershipMessage;
  index: number;
}

export const LeadershipMessageBlock: React.FC<LeadershipMessageBlockProps> = ({
  message,
  index,
}) => {
  const isEven = index % 2 === 0;

  return (
    <div className="w-full font-sans border-b border-gray-200 pb-10 md:pb-14 last:border-b-0 last:pb-0">
      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 md:mb-6">
        {message.title}
      </h2>

      {/* Main Content Area */}
      <div className="text-gray-800 text-sm md:text-base leading-relaxed">
        {/* Photo Container - Alternating float left vs right */}
        <div
          className={`float-none mb-4 ${isEven
              ? 'sm:float-left sm:mr-6 sm:mb-3'
              : 'sm:float-right sm:ml-6 sm:mb-3'
            } w-full sm:w-[320px] md:w-[360px] shrink-0`}
        >
          <div className="bg-gray-100 p-2 sm:p-2.5 border border-gray-200 rounded">
            <div className="relative w-full aspect-[4/3] bg-white overflow-hidden rounded-xs">
              <Image
                src={message.image}
                alt={message.imageAlt || message.name}
                fill
                sizes="(max-width: 640px) 100vw, 360px"
                className="object-cover object-top"
                priority={index === 0}
              />
            </div>
          </div>
        </div>

        {/* Salutation */}
        {message.salutation && (
          <p className="font-medium text-gray-800 mb-3 pt-0.5">
            {message.salutation}
          </p>
        )}

        {/* Paragraphs */}
        {message.content.map((paragraph, pIdx) => (
          <p
            key={pIdx}
            className="mb-3 sm:mb-4 text-gray-700 text-justify sm:text-left leading-relaxed"
          >
            {paragraph}
          </p>
        ))}

        {/* Clear float for Sign-off */}
        <div className="clear-both pt-4 mt-2 font-sans">
          <p className="font-bold text-gray-900 text-sm md:text-base">
            {message.name}
          </p>
          <p className="text-gray-600 text-sm font-normal">{message.role}</p>
        </div>
      </div>
    </div>
  );
};

interface LeadershipMessagesSectionProps {
  messages: LeadershipMessage[];
}

export const LeadershipMessagesSection: React.FC<
  LeadershipMessagesSectionProps
> = ({ messages }) => {
  return (
    <section className="bg-white py-10 md:py-16 w-full">
      <div className="w-full px-4 md:px-8 lg:px-16 xl:px-32 max-w-7xl mx-auto space-y-10 md:space-y-14">
        {messages.map((msg, index) => (
          <LeadershipMessageBlock key={msg.id} message={msg} index={index} />
        ))}
      </div>
    </section>
  );
};

export default LeadershipMessagesSection;
