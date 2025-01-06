import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Growth Academy',
  description: 'Empowering Business Growth Through AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: "bg-black",
          formFieldInput: "bg-black/5 border-white/10",
          card: "bg-black",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton: "bg-white text-black hover:bg-white/90",
          socialButtonsBlockButtonText: "text-black font-medium",
          dividerLine: "bg-white/10",
          dividerText: "text-white/60",
          formFieldLabel: "text-white/60",
          footerActionText: "text-white/60",
          footerActionLink: "text-white hover:text-white/80"
        }
      }}
    >
      <html lang="en">
        <body className={`${inter.className} bg-black min-h-screen flex flex-col`}>
          <Navigation />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
