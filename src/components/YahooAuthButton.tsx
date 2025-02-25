'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

interface YahooAuthButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  onConnect?: () => void
}

export default function YahooAuthButton({
  className = '',
  variant = 'primary',
  size = 'md',
  label = 'Connect Yahoo Fantasy',
  onConnect
}: YahooAuthButtonProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleYahooAuth = async () => {
    if (!user) {
      alert('Please sign in first before connecting to Yahoo')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      console.log('Initiating Yahoo auth flow...')
      
      // Check if we're using HTTPS
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:') {
        setError('Yahoo requires HTTPS. Please use https:// in your URL.')
        setIsLoading(false)
        return
      }
      
      // Check if Yahoo client ID is configured
      const clientId = process.env.NEXT_PUBLIC_YAHOO_CLIENT_ID
      if (!clientId) {
        setError('Yahoo Client ID not configured')
        setIsLoading(false)
        return
      }
      
      // Store the callback in sessionStorage to be called after redirect
      if (onConnect && typeof window !== 'undefined') {
        sessionStorage.setItem('yahoo_auth_callback', 'true')
      }
      
      // Generate a random state for security
      const state = generateRandomString(32)
      
      // Store state in session storage for verification
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('yahoo_oauth_state', state)
      }

      // Build the Yahoo authorization URL directly
      const authUrl = new URL('https://api.login.yahoo.com/oauth2/request_auth')
      authUrl.searchParams.append('client_id', clientId)
      
      // Ensure we're using HTTPS for the redirect URI
      let redirectUri = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/auth/yahoo/callback`
        : process.env.NEXT_PUBLIC_APP_URL 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/yahoo/callback`
          : 'https://localhost:3000/api/auth/yahoo/callback'
      
      if (redirectUri.startsWith('http://')) {
        redirectUri = redirectUri.replace('http://', 'https://')
      }
      
      // Add required parameters
      authUrl.searchParams.append('redirect_uri', redirectUri)
      authUrl.searchParams.append('response_type', 'code')
      authUrl.searchParams.append('state', state)
      
      // Request write access (fspt-w) which includes read access
      authUrl.searchParams.append('scope', 'fspt-w')
      
      // Add language parameter
      authUrl.searchParams.append('language', 'en-us')

      console.log('Initiating Yahoo auth with parameters:')
      console.log('- Client ID:', clientId.substring(0, 10) + '...')
      console.log('- Redirect URI:', redirectUri)
      console.log('- State:', state.substring(0, 5) + '...')
      console.log('- Scope:', 'fspt-w')
      
      // Redirect to Yahoo authorization page
      window.location.href = authUrl.toString()
    } catch (err) {
      console.error('Error connecting to Yahoo Fantasy:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect to Yahoo Fantasy')
      setIsLoading(false)
    }
  }

  // Helper function to generate a random string for state parameter
  const generateRandomString = (length: number): string => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let text = ''
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }

  // Determine button styles based on variant and size
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
        onClick={handleYahooAuth}
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
              <path d="M19.828 4.172a10.05 10.05 0 0 0-14.142 0 10.05 10.05 0 0 0 0 14.142 10.05 10.05 0 0 0 14.142 0 10.05 10.05 0 0 0 0-14.142zm-3.536 10.606a5.025 5.025 0 1 1 0-7.071 5.025 5.025 0 0 1 0 7.071z" />
              <path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
            </svg>
            {label}
          </>
        )}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
} 