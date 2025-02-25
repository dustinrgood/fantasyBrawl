'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAuthToken } from '@/lib/hooks/useAuthToken'

export default function YahooAuthCompletePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { token: authToken, loading: tokenLoading } = useAuthToken()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    if (loading) return

    const completeYahooAuth = async () => {
      try {
        console.log('Starting Yahoo auth completion process...')
        
        // First, exchange the code for tokens without requiring auth
        console.log('Exchanging code for tokens...')
        const response = await fetch('/api/auth/yahoo/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: 'from_cookie' }), // The API will extract the code from the cookie
        })

        if (!response.ok) {
          const error = await response.json()
          console.error('Failed to exchange code for tokens:', error)
          throw new Error(error.error || 'Failed to exchange code for tokens')
        }

        const tokens = await response.json()
        console.log('Tokens received from API:', {
          accessTokenPrefix: tokens.access_token ? tokens.access_token.substring(0, 10) + '...' : 'missing',
          refreshTokenPrefix: tokens.refresh_token ? tokens.refresh_token.substring(0, 10) + '...' : 'missing',
          expiresIn: tokens.expires_in || 'missing'
        })
        
        // Wait for user and auth token to be available before storing tokens
        if (!user || tokenLoading) {
          console.log('Waiting for user authentication...')
          setStatus('loading')
          return
        }
        
        // Store tokens in Firestore using the new endpoint
        console.log('Storing tokens in Firestore using API endpoint...')
        const yahooTokens = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + tokens.expires_in * 1000,
        }
        
        const storeResponse = await fetch('/api/auth/yahoo/store-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            userId: user.uid,
            tokens: yahooTokens
          }),
        })
        
        if (!storeResponse.ok) {
          const error = await storeResponse.json()
          console.error('Failed to store tokens:', error)
          throw new Error(error.error || 'Failed to store tokens')
        }
        
        const storeResult = await storeResponse.json()
        console.log('Store tokens result:', storeResult)
        
        // Verify tokens were stored correctly
        try {
          const verifyResponse = await fetch(`/api/auth/yahoo/debug?userId=${user.uid}`)
          const debugData = await verifyResponse.json()
          setDebugInfo(debugData)
          console.log('Token verification:', debugData)
        } catch (verifyError) {
          console.error('Error verifying token storage:', verifyError)
        }

        setStatus('success')
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } catch (error: any) {
        console.error('Error completing Yahoo auth:', error)
        setStatus('error')
        setErrorMessage(error.message || 'An unexpected error occurred')
      }
    }

    completeYahooAuth()
  }, [user, authToken, loading, tokenLoading, router])

  if (loading || tokenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-4">Please sign in to connect your Yahoo account.</p>
          <button
            onClick={() => router.push('/login?redirect=/auth/yahoo')}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-bold mb-4">Connecting Yahoo Account</h1>
            <p className="mb-6">Please wait while we complete the connection process...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold mb-4 text-green-600">Yahoo Account Connected!</h1>
            <p className="mb-6">Your Yahoo Fantasy account has been successfully connected.</p>
            <p className="mb-6">Redirecting to dashboard...</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Go to Dashboard
            </button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold mb-4 text-red-600">Connection Failed</h1>
            <p className="mb-6">{errorMessage}</p>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/auth/yahoo')}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
        
        {debugInfo && (
          <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <pre className="overflow-auto max-h-40">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
} 