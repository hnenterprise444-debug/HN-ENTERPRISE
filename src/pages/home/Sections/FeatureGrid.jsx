import React from 'react'
import FeatureCard from './FeatureCard'

function FeatureGrid({ features = [] }) {
  if (!Array.isArray(features) || features.length === 0) {
    return null;
  }

  return (
    <section className="bg-transparent">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureGrid