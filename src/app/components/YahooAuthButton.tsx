'use client'

import { useState } from 'react'
import { initiateYahooAuth } from '@/lib/services/yahooSportsApi'

interface YahooAuthButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export default function YahooAuthButton({
  variant = 'primary',
  size = 'md',
  className = '',
  label = 'Connect Yahoo Fantasy'
}: YahooAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Check if we're using HTTPS
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:') {
        setError('Yahoo requires HTTPS. Please use https:// in your URL.')
        setIsLoading(false)
        return
      }
      
      // Check if Yahoo client ID is configured
      if (!process.env.YAHOO_CLIENT_ID) {
        setError('Yahoo Client ID not configured')
        setIsLoading(false)
        return
      }
      
      // Initiate the Yahoo OAuth flow
      await initiateYahooAuth()
    } catch (err) {
      console.error('Error connecting to Yahoo Fantasy:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect to Yahoo Fantasy')
      setIsLoading(false)
    }
  }

  // Determine button styles based on variant
  const getButtonStyles = () => {
    const baseStyles = 'flex items-center justify-center rounded-md font-medium focus:outline-none transition-colors'
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }
    
    const variantStyles = {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white',
      secondary: 'bg-blue-600 hover:bg-blue-700 text-white',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
    }
    
    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`
  }

  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className={getButtonStyles()}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            {label}
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          Error: {error}
        </div>
      )}
    </div>
  )
} 