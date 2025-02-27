// src/components/Navigation.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Trophy, User, LogIn } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="app-navbar">
      <div className="app-nav-container">
        <div className="app-nav-content">
          <div className="app-logo-container">
            <Link href="/" className="flex items-center">
              <Trophy className="app-logo-icon" />
              <span className="app-logo-text">Fantasy League Challenge</span>
            </Link>
          </div>

          <div className="app-desktop-menu">
            <div className="app-nav-links">
              <Link href="/dashboard" className="app-nav-link">
                Dashboard
              </Link>
              <Link href="/leagues/my" className="app-nav-link">
                My Leagues
              </Link>
              <Link href="/leagues/public" className="app-nav-link">
                Public Leagues
              </Link>
              <Link href="/challenges" className="app-nav-link">
                Challenges
              </Link>
              <Link href="/lobby" className="app-nav-link">
                Challenge Lobby
              </Link>
              
              {!loading && (
                user ? (
                  <Link href="/profile" className="app-nav-link flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Profile
                  </Link>
                ) : (
                  <Link href="/login" className="app-nav-link flex items-center">
                    <LogIn className="h-4 w-4 mr-1" />
                    Sign In
                  </Link>
                )
              )}
            </div>
          </div>

          <button
            onClick={toggleMenu}
            className="app-mobile-menu-button"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="app-mobile-menu">
          <div className="app-mobile-nav-links">
            <Link 
              href="/dashboard" 
              className="app-mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/leagues/my" 
              className="app-mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              My Leagues
            </Link>
            <Link 
              href="/leagues/public" 
              className="app-mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Public Leagues
            </Link>
            <Link 
              href="/challenges" 
              className="app-mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Challenges
            </Link>
            <Link 
              href="/lobby" 
              className="app-mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Challenge Lobby
            </Link>
            
            {!loading && (
              user ? (
                <Link 
                  href="/profile" 
                  className="app-mobile-nav-link flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="app-mobile-nav-link flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  )
}