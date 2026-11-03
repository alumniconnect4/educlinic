import React from 'react';
import HeroSection from '@/components/Home/HeroSection';
import StatsBar from '@/components/Home/StatsBar';
import ALuminiAchievements from '@/components/Home/ALuminiAchievements';
import UpcomingEvents from '@/components/Home/UpcomingEvents';
import Gallery from '@/components/Home/Gallery';
import AlumniMap from '@/components/Home/AlumniMap';

const Home = () => {
  return (
    <div>
      <HeroSection />
      <StatsBar />
      <ALuminiAchievements />
      <UpcomingEvents />
      <AlumniMap />
      <Gallery />
    </div>
  );
};

export default Home;
