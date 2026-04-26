import React from 'react'
import HeroSection from '@/components/Home/HeroSection'
import ALuminiAchievements from '@/components/Home/ALuminiAchievements'
import UpcomingEvents from '@/components/Home/UpcomingEvents'
import Gallery from '@/components/Home/Gallery'

const Home = () => {
  return (
    <div>
      <HeroSection/>
      <ALuminiAchievements/>
      <UpcomingEvents/>
      <Gallery/>
    </div>
  )
}

export default Home