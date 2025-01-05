'use client'

import Navigation from "@/components/Navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { fadeIn, slideIn, staggerContainer } from '@/lib/animations'
import Link from "next/link"

export default function CaseStudiesPage() {
  return (
    <>
      <Navigation />
      <main className="bg-black text-white">
        <motion.div 
          className="relative min-h-screen pt-20"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-black to-black" />
          
          <div className="relative py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <motion.div 
                className="mx-auto max-w-2xl lg:max-w-4xl"
                variants={fadeIn}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8 text-center"
                >
                  <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-gray-200">
                    Client Success Stories
                  </span>
                </motion.div>
                <h1 className="text-5xl font-bold tracking-tight sm:text-7xl text-center gradient-text mb-8">
                  Success Stories
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-300 text-center max-w-3xl mx-auto">
                  Real results from businesses that transformed their marketing with Growth Academy.
                </p>

                <div className="mt-20 space-y-20">
                  {caseStudies.map((study, index) => (
                    <motion.article
                      key={study.slug}
                      className="card group"
                      variants={fadeIn}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                        <motion.div 
                          className="relative h-80 lg:h-full rounded-xl overflow-hidden"
                          variants={slideIn}
                        >
                          <Image
                            src={study.image}
                            alt={study.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        </motion.div>
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-x-4 text-sm mb-6">
                            <time dateTime={study.date} className="text-gray-400">
                              {study.date}
                            </time>
                            <span className="rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-gray-200">
                              {study.industry}
                            </span>
                          </div>
                          <h2 className="text-3xl font-bold text-white mb-4">
                            {study.title}
                          </h2>
                          <p className="text-gray-300 mb-8 text-lg">
                            {study.description}
                          </p>
                          <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                              <div className="text-2xl font-bold gradient-text">{study.roi}</div>
                              <div className="mt-1 text-sm text-gray-400">Return on Investment</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold gradient-text">{study.growth}</div>
                              <div className="mt-1 text-sm text-gray-400">Growth Rate</div>
                            </div>
                          </div>
                          <Link href={`/case-studies/${study.slug}`}>
                            <button className="btn btn-secondary w-full">
                              Read Full Case Study
                            </button>
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>

                {/* CTA Section */}
                <motion.div 
                  className="mt-24 text-center"
                  variants={fadeIn}
                >
                  <h2 className="text-3xl font-bold text-white mb-4">Ready to Write Your Success Story?</h2>
                  <p className="text-gray-300 mb-8">
                    Join these successful businesses and transform your marketing strategy with Growth Academy.
                  </p>
                  <Link href="/growth-ai">
                    <button className="btn btn-primary">
                      Start Your Journey
                    </button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  )
}

const caseStudies = [
  {
    slug: 'airbnb-growth',
    title: 'Airbnb Growth Strategy',
    description: 'How Airbnb achieved exponential growth through referral marketing and user experience optimization.',
    date: '2023-12-15',
    image: '/assets/images/case-study-1.jpg',
    industry: 'Travel & Hospitality',
    roi: '300% YoY',
    growth: '100M+ users'
  },
  {
    slug: 'dropbox-viral',
    title: 'Dropbox Viral Growth',
    description: 'How Dropbox achieved 500M users through their innovative referral program and freemium model.',
    date: '2023-11-28',
    image: '/assets/images/case-study-2.jpg',
    industry: 'SaaS',
    roi: '3900% growth',
    growth: '500M+ users'
  },
  {
    slug: 'spotify-market',
    title: 'Spotify Market Expansion',
    description: 'How Spotify captured market share through personalization and strategic partnerships.',
    date: '2023-11-10',
    image: '/assets/images/case-study-3.jpg',
    industry: 'Music Streaming',
    roi: '489M users',
    growth: '183 markets'
  }
] 