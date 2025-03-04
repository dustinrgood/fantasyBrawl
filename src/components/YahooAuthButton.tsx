'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { initiateYahooAuth } from '@/lib/services/yahooSportsApi'

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
      
      // Use the yahooSportsApi service to initiate the OAuth flow
      initiateYahooAuth()
      
      // Note: initiateYahooAuth will redirect the user to Yahoo,
      // so we don't need to handle the response here
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