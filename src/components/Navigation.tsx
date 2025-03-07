// src/components/Navigation.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trophy } from 'lucide-react'

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-indigo-700 shadow-lg">
      <div className="container-default">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">League Brawl</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-white text-indigo-700'
                  : 'text-white hover:bg-indigo-600 hover:text-white active:bg-indigo-800'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/how-it-works"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/how-it-works')
                  ? 'bg-white text-indigo-700'
                  : 'text-white hover:bg-indigo-600 hover:text-white active:bg-indigo-800'
              }`}
            >
              How It Works
            </Link>
            <Link
              href="/leagues/my"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/leagues/my')
                  ? 'bg-white text-indigo-700'
                  : 'text-white hover:bg-indigo-600 hover:text-white active:bg-indigo-800'
              }`}
            >
              My Leagues
            </Link>
            <Link
              href="/leagues/Public"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/leagues/Public')
                  ? 'bg-white text-indigo-700'
                  : 'text-white hover:bg-indigo-600 hover:text-white active:bg-indigo-800'
              }`}
            >
              Public Leagues
            </Link>
            <Link
              href="/challenges"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/challenges')
                  ? 'bg-white text-indigo-700'
                  : 'text-white hover:bg-indigo-600 hover:text-white active:bg-indigo-800'
              }`}
            >
              Challenges
            </Link>
            <Link
              href="/profile"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/profile')
                  ? 'bg-white text-indigo-700'
                  : 'text-white hover:bg-indigo-600 hover:text-white active:bg-indigo-800'
              }`}
            >
              Profile
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/dashboard"
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive('/dashboard')
                    ? 'bg-white text-indigo-700'
                    : 'text-white hover:bg-indigo-600 active:bg-indigo-800'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/how-it-works"
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive('/how-it-works')
                    ? 'bg-white text-indigo-700'
                    : 'text-white hover:bg-indigo-600 active:bg-indigo-800'
                }`}
              >
                How It Works
              </Link>
              <Link
                href="/leagues/my"
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive('/leagues/my')
                    ? 'bg-white text-indigo-700'
                    : 'text-white hover:bg-indigo-600 active:bg-indigo-800'
                }`}
              >
                My Leagues
              </Link>
              <Link
                href="/leagues/Public"
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive('/leagues/Public')
                    ? 'bg-white text-indigo-700'
                    : 'text-white hover:bg-indigo-600 active:bg-indigo-800'
                }`}
              >
                Public Leagues
              </Link>
              <Link
                href="/challenges"
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive('/challenges')
                    ? 'bg-white text-indigo-700'
                    : 'text-white hover:bg-indigo-600 active:bg-indigo-800'
                }`}
              >
                Challenges
              </Link>
              <Link
                href="/profile"
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive('/profile')
                    ? 'bg-white text-indigo-700'
                    : 'text-white hover:bg-indigo-600 active:bg-indigo-800'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}