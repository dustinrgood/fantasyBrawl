'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Trophy } from 'lucide-react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
              <Link href="/leagues" className="app-nav-link">
                My Leagues
              </Link>
              <Link href="/challenges" className="app-nav-link">
                Challenges
              </Link>
              <Link href="/lobby" className="app-nav-link">
                Challenge Lobby
              </Link>
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
              href="/leagues" 
              className="app-mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              My Leagues
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
          </div>
        </div>
      )}
    </nav>
  )
} 