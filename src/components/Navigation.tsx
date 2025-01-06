'use client'

import Link from 'next/link'
import { UserButton, SignInButton, useUser } from '@clerk/nextjs'
import Image from 'next/image'

export default function Navigation() {
  const { isSignedIn } = useUser()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <div className="w-[180px]">
            <Link href="/" className="relative w-32 h-8 mx-auto block">
              <Image
                src="/assets/logos/growth-academy-logo.svg"
                alt="Growth Academy"
                fill
                className="object-contain brightness-0 invert"
                priority
              />
            </Link>
          </div>
          
          <div className="flex items-center justify-center flex-1 gap-8">
            <Link href="/about" className="text-white/60 hover:text-white/90 transition-colors">
              About
            </Link>
            <Link href="/case-studies" className="text-white/60 hover:text-white/90 transition-colors">
              Case Studies
            </Link>
            <Link href="/pricing" className="text-white/60 hover:text-white/90 transition-colors">
              Pricing
            </Link>
            {isSignedIn && (
              <>
                <Link href="/dashboard" className="text-white/60 hover:text-white/90 transition-colors">
                  Dashboard
                </Link>
                <Link href="/growth-ai" className="text-white/60 hover:text-white/90 transition-colors">
                  Growth AI
                </Link>
              </>
            )}
          </div>

          <div className="w-[180px] flex justify-end items-center gap-2">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="rounded-md bg-black hover:bg-black/80 px-3 py-1.5 text-sm font-medium text-white transition-all duration-200">
                    Sign In
                  </button>
                </SignInButton>
                <Link
                  href="/pricing"
                  className="rounded-md bg-white hover:bg-white/90 px-3 py-1.5 text-sm font-medium text-black transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    userButtonPopoverCard: "bg-black/90 border border-white/10",
                    userButtonPopoverActionButton: "hover:bg-white/10",
                    userButtonPopoverActionButtonText: "text-white",
                    userButtonPopoverFooter: "hidden"
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
