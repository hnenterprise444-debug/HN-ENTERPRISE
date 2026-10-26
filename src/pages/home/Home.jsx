import React, { useState } from 'react'
import Layout from '../../components/layout/Layout'
import HeroSection from './Sections/HeroSection'
import ProductsGrid from './Sections/ProductsGrid'
import FeatureGrid from './Sections/FeatureGrid'
import ReviewSection from '../../components/testimonial/ReviewSection'
import FounderSection from './Sections/FounderSection'
import BengalTilesSection from './Sections/BengalTilesSection'
import BrandPartnerSection from './Sections/BrandPartnerSection'
import ServiceAreaSection from './Sections/ServiceAreaSection'
import VideoGuidesSection from './Sections/VideoGuidesSection'
import TeamSection from './Sections/TeamSection'


function Home() {
  return (
    <div>
      <div className='space-y-4 sm:space-y-5 lg:space-y-16 pb-8'>
        <BengalTilesSection />
        <HeroSection />
        <BrandPartnerSection />
        <ProductsGrid />
        <VideoGuidesSection />
        <ReviewSection />
        {/* <ServiceAreaSection /> */}
        <FounderSection />
        {/* <TeamSection /> */}
      </div>
    </div>
  )
}


export default Home