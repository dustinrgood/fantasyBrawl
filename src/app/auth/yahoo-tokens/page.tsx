'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { getYahooTokens, storeYahooTokens } from '@/lib/services/yahooFantasyClient'
import { auth } from '@/lib/firebase/firebase'

export default function YahooTokensPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [refreshLoading, setRefreshLoading] = useState<boolean>(false)
  const [refreshResult, setRefreshResult] = useState<string>('')
  const [reconnectLoading, setReconnectLoading] = useState<boolean>(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/auth/yahoo-tokens')
    }
  }, [user, loading, router])

  // Load token information on page load
  useEffect(() => {
    if (user) {
      loadTokenInfo()
      
      // Check if we need to reconnect
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('reconnect') === 'true') {
          // Remove the parameter from the URL
          const newUrl = window.location.pathname
          window.history.replaceState({}, document.title, newUrl)
          
          // Trigger reconnect
          handleReconnect()
        }
      }
    }
  }, [user])

  // Define a type for the token info
  type TokenInfoType = {
    hasTokens: boolean;
    accessTokenPreview: string;
    refreshTokenPreview: string;
    expiresAt: string;
    isExpired: boolean;
    apiTestResult?: string;
  };

  const loadTokenInfo = async () => {
    try {
      const tokens = await getYahooTokens()
      
      // First update the basic token info
      setTokenInfo({
        hasTokens: !!tokens,
        accessTokenPreview: tokens?.access_token ? `${tokens.access_token.substring(0, 10)}...` : 'None',
        refreshTokenPreview: tokens?.refresh_token ? `${tokens.refresh_token.substring(0, 10)}...` : 'None',
        expiresAt: tokens?.expires_at ? new Date(tokens.expires_at).toLocaleString() : 'N/A',
        isExpired: tokens?.expires_at ? Date.now() > tokens.expires_at : true
      })
      
      // If we have tokens, test if they actually work with the API
      if (tokens) {
        try {
          console.log('Testing Yahoo tokens with direct API call...')
          // Make a direct test API call to Yahoo
          const response = await fetch('/api/yahoo/proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              endpoint: 'users;use_login=1/games',
              forceRefresh: true // Force token refresh if needed
            }),
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('API test successful:', data)
            // Update token info to show tokens are valid
            setTokenInfo((prev: TokenInfoType) => ({
              ...prev,
              isExpired: false,
              apiTestResult: '✅ API test successful'
            }))
          } else {
            // API call failed, tokens might be invalid
            const error = await response.json()
            console.error('API test failed:', error)
            setTokenInfo((prev: TokenInfoType) => ({
              ...prev,
              isExpired: true,
              apiTestResult: `❌ API test failed: ${error.error || 'Unknown error'}`
            }))
          }
        } catch (apiError) {
          console.error('Error testing API:', apiError)
          setTokenInfo((prev: TokenInfoType) => ({
            ...prev,
            apiTestResult: `❌ API test error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`
          }))
        }
      }
    } catch (error) {
      console.error('Error loading token info:', error)
    }
  }

  const handleRefreshTokens = async () => {
    setRefreshLoading(true)
    setRefreshResult('')
    
    try {
      // Get current tokens
      const tokens = await getYahooTokens()
      
      if (!tokens) {
        setRefreshResult('❌ No Yahoo tokens found to refresh')
        setRefreshLoading(false)
        return
      }
      
      // Force refresh regardless of expiration time
      console.log('Forcing token refresh...')
      const response = await fetch('/api/auth/yahoo/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: tokens.refresh_token,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to refresh token')
      }
      
      const refreshedTokens = await response.json()
      
      // Store the refreshed tokens in Firestore
      await storeYahooTokens({
        access_token: refreshedTokens.access_token,
        refresh_token: refreshedTokens.refresh_token,
        expires_at: Date.now() + refreshedTokens.expires_in * 1000
      })
      
      // Update token info display
      setTokenInfo({
        hasTokens: true,
        accessTokenPreview: refreshedTokens.access_token ? `${refreshedTokens.access_token.substring(0, 10)}...` : 'None',
        refreshTokenPreview: refreshedTokens.refresh_token ? `${refreshedTokens.refresh_token.substring(0, 10)}...` : 'None',
        expiresAt: new Date(Date.now() + refreshedTokens.expires_in * 1000).toLocaleString(),
        isExpired: false
      })
      
      setRefreshResult('✅ Tokens refreshed successfully!')
      
      // Test the refreshed tokens with an API call
      try {
        console.log('Testing refreshed tokens with API call...')
        const apiTestResponse = await fetch('/api/yahoo/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: 'users;use_login=1/games',
            forceRefresh: false // Don't force refresh since we just did it
          }),
        })
        
        if (apiTestResponse.ok) {
          // API call succeeded
          const data = await apiTestResponse.json()
          console.log('API test with refreshed tokens successful:', data)
          setTokenInfo((prev: TokenInfoType) => ({
            ...prev,
            apiTestResult: '✅ API test successful'
          }))
          setRefreshResult('✅ Tokens refreshed and verified with API!')
        } else {
          // API call failed
          const apiError = await apiTestResponse.json()
          console.error('API test with refreshed tokens failed:', apiError)
          setTokenInfo((prev: TokenInfoType) => ({
            ...prev,
            apiTestResult: `❌ API test failed: ${apiError.error || 'Unknown error'}`
          }))
          setRefreshResult('⚠️ Tokens refreshed but API test failed')
        }
      } catch (apiError) {
        console.error('Error testing API with refreshed tokens:', apiError)
        setTokenInfo((prev: TokenInfoType) => ({
          ...prev,
          apiTestResult: `❌ API test error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`
        }))
      }
    } catch (error) {
      console.error('Error refreshing tokens:', error)
      setRefreshResult(`❌ Error refreshing tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setRefreshLoading(false)
    }
  }

  const handleReconnect = async () => {
    setReconnectLoading(true)
    
    try {
      // Check if we're using HTTPS
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:') {
        alert('Yahoo requires HTTPS. Please use https:// in your URL.')
        setReconnectLoading(false)
        return
      }
      
      // Clear existing tokens first
      try {
        console.log('Clearing existing Yahoo tokens before reconnecting...')
        const currentUser = auth.currentUser
        
        if (currentUser) {
          // Import the clearYahooTokens function
          const { clearYahooTokens } = await import('@/lib/services/yahooFantasyClient')
          await clearYahooTokens()
          console.log('Existing tokens cleared successfully')
        }
      } catch (clearError) {
        console.error('Error clearing existing tokens:', clearError)
        // Continue with reconnect even if clearing fails
      }
      
      // Generate a random state for security
      const state = generateRandomString(32)
      
      // Store state in session storage for verification
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('yahoo_oauth_state', state)
      }

      // Build the Yahoo authorization URL directly
      const clientId = process.env.NEXT_PUBLIC_YAHOO_CLIENT_ID
      if (!clientId) {
        throw new Error('Yahoo Client ID not configured')
      }
      
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
    } catch (error) {
      console.error('Error reconnecting to Yahoo:', error)
      setReconnectLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Yahoo Fantasy Tokens</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Token Status</h2>
        
        {tokenInfo ? (
          <div className="mb-6">
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <h3 className="font-medium mb-2">Token Information:</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="font-medium w-32">Has Tokens:</span> 
                  <span className={tokenInfo.hasTokens ? "text-green-600" : "text-red-600"}>
                    {tokenInfo.hasTokens ? '✅ Yes' : '❌ No'}
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="font-medium w-32">Access Token:</span> 
                  <span className="font-mono">{tokenInfo.accessTokenPreview}</span>
                </li>
                <li className="flex items-center">
                  <span className="font-medium w-32">Refresh Token:</span> 
                  <span className="font-mono">{tokenInfo.refreshTokenPreview}</span>
                </li>
                <li className="flex items-center">
                  <span className="font-medium w-32">Expires At:</span> 
                  <span>{tokenInfo.expiresAt}</span>
                </li>
                <li className="flex items-center">
                  <span className="font-medium w-32">Status:</span> 
                  <span className={tokenInfo.isExpired ? "text-red-600" : "text-green-600"}>
                    {tokenInfo.isExpired ? '❌ Expired' : '✅ Valid'}
                  </span>
                </li>
                {tokenInfo.apiTestResult && (
                  <li className="flex items-center">
                    <span className="font-medium w-32">API Test:</span> 
                    <span className={tokenInfo.apiTestResult.includes('✅') ? "text-green-600" : "text-red-600"}>
                      {tokenInfo.apiTestResult}
                    </span>
                  </li>
                )}
              </ul>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleRefreshTokens}
                disabled={refreshLoading || !tokenInfo.hasTokens}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {refreshLoading ? 'Refreshing...' : 'Refresh Tokens'}
              </button>
              
              <button
                onClick={handleReconnect}
                disabled={reconnectLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {reconnectLoading ? 'Connecting...' : 'Reconnect to Yahoo'}
              </button>
              
              <button
                onClick={async () => {
                  if (confirm('This will completely disconnect and reconnect to Yahoo. Continue?')) {
                    try {
                      // Import the clearYahooTokens function
                      const { clearYahooTokens } = await import('@/lib/services/yahooFantasyClient')
                      await clearYahooTokens()
                      
                      // Force reload the page to clear any cached state
                      window.location.href = '/auth/yahoo-tokens?reconnect=true'
                    } catch (error) {
                      console.error('Error during complete reset:', error)
                      alert('Error during reset. Please try again.')
                    }
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Complete Reset
              </button>
            </div>
            
            {refreshResult && (
              <div className={`mt-4 p-3 rounded ${
                refreshResult.includes('✅') 
                  ? 'bg-green-100 text-green-800' 
                  : refreshResult.includes('⚠️') 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                <p className="font-medium">{refreshResult}</p>
                
                {refreshResult.includes('failed') && (
                  <div className="mt-2">
                    <p className="text-sm">Try these troubleshooting steps:</p>
                    <ol className="list-decimal ml-5 text-sm mt-1">
                      <li>Click "Complete Reset" to clear all tokens and reconnect</li>
                      <li>Make sure your Yahoo account has active fantasy leagues</li>
                      <li>Check that you've granted the necessary permissions</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        )}
        
        <div className="mt-6 border-t pt-4">
          <h3 className="font-medium mb-2">Troubleshooting</h3>
          <p className="text-gray-700 mb-4">
            If you're experiencing issues with your Yahoo Fantasy connection:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Try refreshing your tokens using the button above</li>
            <li>If that doesn't work, try reconnecting to Yahoo</li>
            <li>Make sure your Yahoo account has active fantasy leagues</li>
            <li>Check that you've granted the necessary permissions</li>
          </ol>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Link 
          href="/dashboard" 
          className="text-purple-600 hover:text-purple-800"
        >
          ← Back to Dashboard
        </Link>
        
        <Link 
          href="/auth/yahoo-debug" 
          className="text-purple-600 hover:text-purple-800"
        >
          Advanced Debug →
        </Link>
      </div>
    </div>
  )
} 