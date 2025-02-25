'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function MainNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-indigo-600">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" className="text-white text-xl font-bold">
              Fantasy Challenge
            </Link>
            <div className="hidden ml-10 space-x-8 md:block">
              <Link href="/dashboard" className="text-base font-medium text-white hover:text-indigo-50">
                Dashboard
              </Link>
              <Link href="/challenges" className="text-base font-medium text-white hover:text-indigo-50">
                Challenges
              </Link>
              <Link href="/lobby" className="text-base font-medium text-white hover:text-indigo-50">
                Lobby
              </Link>
            </div>
          </div>
          <div className="md:hidden">
            <button
              type="button"
              className="text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="py-4 md:hidden">
            <div className="flex flex-col space-y-2">
              <Link 
                href="/dashboard" 
                className="text-base font-medium text-white hover:text-indigo-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/challenges" 
                className="text-base font-medium text-white hover:text-indigo-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Challenges
              </Link>
              <Link 
                href="/lobby" 
                className="text-base font-medium text-white hover:text-indigo-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Lobby
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
} 