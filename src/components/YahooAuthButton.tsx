'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function YahooAuthButton() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    if (!user) {
      alert('You must be logged in to connect your Yahoo account')
      return
    }

    try {
      setIsLoading(true)
      
      // In a real implementation, this would redirect to Yahoo OAuth
      // For now, we'll just simulate the process
      
      // 1. Get the auth URL from our backend
      const response = await fetch('/api/auth/yahoo/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.uid })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get auth URL')
      }
      
      const { authUrl } = await response.json()
      
      // 2. Redirect to Yahoo for authentication
      window.location.href = authUrl
    } catch (error) {
      console.error('Error connecting to Yahoo:', error)
      alert(error instanceof Error ? error.message : 'Failed to connect to Yahoo')
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect Yahoo'
      )}
    </button>
  )
} 