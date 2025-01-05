'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { fadeIn, staggerContainer } from '@/lib/animations'

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="relative py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
              About Growth Academy
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
              Empowering businesses with AI-driven marketing strategies and personalized growth solutions.
            </p>
          </motion.div>

          {/* Founder Section */}
          <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-20">
            <div className="space-y-6">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <Image
                  src="/assets/images/founder-profile.png"
                  alt="Founder"
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
              <div className="flex justify-center">
                <a 
                  href="https://app.hubspot.com/academy/achievements/q8fwtbwq/en/1/diego-barnica/inbound-sales"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="https://hubspot-credentials-na1.s3.amazonaws.com/prod/badges/user/1d85ac1e775445cb9b7653fa537c8723.png"
                    alt="HubSpot Certification"
                    width={200}
                    height={200}
                    className="rounded-lg hover:opacity-90 transition-opacity"
                  />
                </a>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Meet the Founder
              </h2>
              <p className="text-gray-300">
                Hi, I'm Diego Barnica, founder of Growth Academy. I created this platform with a clear mission: 
                to make complex marketing concepts and strategies accessible to everyone. Through our comprehensive 
                e-books and resources, we break down sophisticated marketing principles into digestible content. 
                By combining educational resources with powerful AI capabilities, we empower businesses to execute 
                effective marketing strategies without the steep learning curve.
              </p>
              <div className="space-y-4">
                <div className="border border-white/10 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
                  <h3 className="font-semibold text-white mb-2">Our Purpose</h3>
                  <p className="text-gray-300">
                    We believe that quality marketing education and powerful AI tools should be accessible to everyone. 
                    Whether you're a startup, small business, or growing enterprise, our platform provides the resources 
                    and AI capabilities you need to fuel your marketing success.
                  </p>
                </div>
                <div className="border border-white/10 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
                  <h3 className="font-semibold text-white mb-2">Vision for Growth Academy</h3>
                  <p className="text-gray-300">
                    To create a platform where businesses can access both educational resources and AI-powered tools, 
                    making advanced marketing strategies achievable for organizations of any size.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div variants={fadeIn} className="mt-32">
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-white/10 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
                <h3 className="font-semibold text-white mb-4">Innovation</h3>
                <p className="text-gray-300">
                  Constantly pushing the boundaries of what's possible with AI in marketing.
                </p>
              </div>
              <div className="border border-white/10 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
                <h3 className="font-semibold text-white mb-4">Data-Driven</h3>
                <p className="text-gray-300">
                  Making decisions backed by solid data and delivering measurable results.
                </p>
              </div>
              <div className="border border-white/10 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
                <h3 className="font-semibold text-white mb-4">Growth-Focused</h3>
                <p className="text-gray-300">
                  Dedicated to driving sustainable business growth through innovative strategies.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 