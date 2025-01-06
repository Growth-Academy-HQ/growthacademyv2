'use client'
import Link from "next/link"
import { motion } from "framer-motion"
import { fadeIn, slideIn, staggerContainer } from '@/lib/animations'
import Image from "next/image"
import CurvedBackground from "@/components/CurvedBackground"
import { useEffect } from 'react'
import { SignInButton } from '@clerk/nextjs'

interface Testimonial {
  author: string;
  role: string;
  text: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    author: "Sarah Johnson",
    role: "Marketing Director",
    text: "Growth Academy's AI recommendations transformed our marketing strategy. We saw a 150% increase in engagement.",
    image: "/testimonial1.jpg"
  },
  {
    author: "Michael Chen",
    role: "Startup Founder",
    text: "The personalized marketing plans helped us achieve our quarterly goals in half the time.",
    image: "/testimonial2.jpg"
  },
  {
    author: "Emma Davis",
    role: "E-commerce Owner",
    text: "The AI insights were spot-on. Our ROI improved significantly within the first month.",
    image: "/testimonial3.jpg"
  }
];

export default function Home() {
  useEffect(() => {
    const interval = setInterval(() => {
      const container = document.querySelector('.testimonials-container') as HTMLElement;
      if (container) {
        const firstCard = container.firstElementChild;
        if (firstCard) {
          container.appendChild(firstCard.cloneNode(true));
          container.style.transition = 'transform 0.5s ease-in-out';
          container.style.transform = 'translateX(-100%)';
          
          setTimeout(() => {
            container.style.transition = 'none';
            container.style.transform = 'translateX(0)';
            const firstElement = container.firstElementChild;
            if (firstElement) {
              container.removeChild(firstElement);
            }
          }, 500);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <motion.div 
        className="relative py-24 sm:py-32"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <CurvedBackground />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div 
              className="mx-auto max-w-2xl text-center"
              variants={fadeIn}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-gray-200">
                  Revolutionize Your Marketing
                </span>
              </motion.div>
              <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                Transform Your Business Growth
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Leverage AI-powered strategies to scale your business. Get personalized marketing plans, data-driven insights, and actionable recommendations.
              </p>
              <motion.div 
                className="mt-10 flex items-center justify-center"
                variants={fadeIn}
              >
                <Link href="/pricing">
                  <button className="rounded-lg bg-white hover:bg-white/90 px-8 py-3 text-sm font-medium text-black transition-all duration-200 shadow-sm hover:shadow-md">
                    Get Started
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Value Proposition Section */}
            <motion.div 
              className="mx-auto mt-20 max-w-5xl"
              variants={fadeIn}
              transition={{ delay: 0.4 }}
            >
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                <div className="text-center p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-300">
                  <div className="text-2xl font-bold text-white mb-2">Instant Insights</div>
                  <div className="text-sm text-gray-400">Get AI-powered marketing strategies in minutes, not days</div>
                </div>
                <div className="text-center p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-300">
                  <div className="text-2xl font-bold text-white mb-2">Data-Driven</div>
                  <div className="text-sm text-gray-400">Make decisions backed by advanced AI analysis and market trends</div>
                </div>
                <div className="text-center p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-300">
                  <div className="text-2xl font-bold text-white mb-2">Always Learning</div>
                  <div className="text-sm text-gray-400">Our AI continuously evolves to provide cutting-edge strategies</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-xl text-center mb-12"
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Trusted by Growing Businesses
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              See what our clients say about their experience with Growth Academy
            </p>
          </motion.div>
          <div className="relative overflow-hidden">
            <motion.div 
              className="testimonials-container flex gap-6 transition-transform duration-500"
              variants={staggerContainer}
            >
              {[...testimonials, testimonials[0]].map((testimonial: Testimonial, index: number) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 w-full sm:w-96"
                  variants={fadeIn}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="h-full p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-300">
                    <p className="text-gray-300 mb-4">"{testimonial.text}"</p>
                    <div className="flex items-center gap-4">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.author}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{testimonial.author}</div>
                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl lg:text-center"
            variants={fadeIn}
          >
            <h2 className="text-base font-semibold leading-7 text-gray-300">
              Accelerate Growth
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to scale
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              From AI-powered marketing plans to expert consultations, we provide the tools and knowledge you need to succeed.
            </p>
          </motion.div>
          <motion.div 
            className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
            variants={staggerContainer}
          >
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div 
                  key={feature.name} 
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition-colors duration-300"
                  variants={fadeIn}
                  transition={{ delay: index * 0.1 }}
                >
                  <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-white">
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

const features = [
  {
    name: 'AI-Powered Marketing Plans',
    description: 'Get customized marketing strategies generated by our advanced AI system, tailored to your business needs and goals.',
  },
  {
    name: 'Expert Consultation',
    description: 'Connect with marketing experts for personalized guidance and insights to optimize your growth strategy.',
  },
  {
    name: 'Proven Frameworks',
    description: 'Access battle-tested marketing frameworks and templates that have driven success for businesses like yours.',
  },
]
