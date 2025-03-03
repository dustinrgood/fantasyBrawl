'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function YahooCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Set a flag in sessionStorage to indicate we're coming from Yahoo auth
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('yahoo_auth_callback', 'true')
    }
    
    // Check for error in URL parameters
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const errorDescription = searchParams.get('description') || 'Unknown error'
      setError(`${errorParam}: ${errorDescription}`)
      return
    }
    
    // The actual callback processing is handled by the API route
    // This page just shows a loading state and then redirects
    
    // Redirect to the Yahoo League Picker page after a short delay
    const timer = setTimeout(() => {
      router.push('/leagues/yahoo-picker')
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [router, searchParams])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/profile')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Return to Profile
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connecting to Yahoo</h2>
            <p className="text-gray-600 mb-6">
              Please wait while we complete the authentication process...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-500">
              You'll be redirected automatically in a few seconds.
            </p>
          </>
        )}
      </div>
    </div>
  )
} 