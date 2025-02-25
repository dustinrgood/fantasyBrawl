'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function InlineNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header style={{ backgroundColor: '#4f46e5', color: 'white' }}>
      <nav style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '0 1rem' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '1rem 0' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              textDecoration: 'none' 
            }}>
              Fantasy Challenge
            </Link>
            <div className="hidden md:block ml-10" style={{ 
              marginLeft: '2.5rem'
            }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <Link href="/dashboard" style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  Dashboard
                </Link>
                <Link href="/challenges" style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  Challenges
                </Link>
                <Link href="/lobby" style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  Lobby
                </Link>
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <button
              type="button"
              style={{ 
                backgroundColor: 'transparent', 
                border: 'none', 
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X style={{ height: '1.5rem', width: '1.5rem' }} />
              ) : (
                <Menu style={{ height: '1.5rem', width: '1.5rem' }} />
              )}
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden" style={{ 
            padding: '1rem 0'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem' 
            }}>
              <Link 
                href="/dashboard" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  padding: '0.5rem 0'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/challenges" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  padding: '0.5rem 0'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Challenges
              </Link>
              <Link 
                href="/lobby" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  padding: '0.5rem 0'
                }}
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