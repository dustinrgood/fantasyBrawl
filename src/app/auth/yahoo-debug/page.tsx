'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import ConnectYahooButton from '@/components/ConnectYahooButton'

interface DebugInfo {
  isConnected: boolean
  tokens?: {
    accessTokenPrefix: string
    refreshTokenPrefix: string
    expiresAt: string
    isExpired: boolean
  }
  games?: any[]
  error?: string
}

export default function YahooDebugPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  
  useEffect(() => {
    const fetchDebugInfo = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        
        const response = await fetch(`/api/auth/yahoo/debug?userId=${user.uid}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch debug information')
        }
        
        const data = await response.json()
        setDebugInfo(data)
      } catch (error) {
        console.error('Error fetching debug info:', error)
        setDebugInfo({
          isConnected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (!loading) {
      fetchDebugInfo()
    }
  }, [user, loading])
  
  const handleRefreshTokens = async () => {
    if (!user) return
    
    try {
      setRefreshing(true)
      
      const response = await fetch('/api/auth/yahoo/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.uid })
      })
      
      if (!response.ok) {
        throw new Error('Failed to refresh tokens')
      }
      
      // Reload the page to show updated info
      router.refresh()
    } catch (error) {
      console.error('Error refreshing tokens:', error)
      alert('Failed to refresh tokens: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setRefreshing(false)
    }
  }
  
  const handleDisconnect = async () => {
    if (!user) return
    
    if (!confirm('Are you sure you want to disconnect your Yahoo account? This will remove all tokens.')) {
      return
    }
    
    try {
      setDisconnecting(true)
      
      const response = await fetch('/api/auth/yahoo/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.uid })
      })
      
      if (!response.ok) {
        throw new Error('Failed to disconnect Yahoo account')
      }
      
      // Reload the page to show updated info
      router.refresh()
    } catch (error) {
      console.error('Error disconnecting Yahoo account:', error)
      alert('Failed to disconnect: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setDisconnecting(false)
    }
  }
  
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">You need to sign in to view Yahoo debug information.</p>
          <Link
            href="/login?redirect=/auth/yahoo-debug"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/profile" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Profile
          </Link>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Yahoo Fantasy Debug Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Technical details about your Yahoo Fantasy connection
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.refresh()}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                Refresh Page
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Connection Status
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {debugInfo?.isConnected ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Not Connected
                    </span>
                  )}
                </dd>
              </div>
              
              {debugInfo?.tokens && (
                <>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Access Token
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {debugInfo.tokens.accessTokenPrefix}... (truncated)
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Refresh Token
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {debugInfo.tokens.refreshTokenPrefix}... (truncated)
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Expires At
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {debugInfo.tokens.expiresAt}
                      {debugInfo.tokens.isExpired && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Expired
                        </span>
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Raw Token Data
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(debugInfo.tokens, null, 2)}
                      </pre>
                    </dd>
                  </div>
                </>
              )}
              
              {debugInfo?.error && (
                <div className="bg-red-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-red-500">
                    Error
                  </dt>
                  <dd className="mt-1 text-sm text-red-700 sm:mt-0 sm:col-span-2">
                    {debugInfo.error}
                  </dd>
                </div>
              )}
              
              {debugInfo?.games && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Available Games
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {debugInfo.games.map((game, index) => (
                        <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <span className="ml-2 flex-1 w-0 truncate">
                              {game.name} ({game.code}) - Season: {game.season}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </div>
          
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              {debugInfo?.isConnected ? (
                <>
                  <button
                    onClick={handleRefreshTokens}
                    disabled={refreshing}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {refreshing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      'Refresh Tokens'
                    )}
                  </button>
                  
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {disconnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      'Disconnect Yahoo'
                    )}
                  </button>
                </>
              ) : (
                <ConnectYahooButton />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 