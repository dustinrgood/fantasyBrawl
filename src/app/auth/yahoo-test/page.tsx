'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function YahooTestPage() {
  const { user, loading } = useAuth()
  const [testResult, setTestResult] = useState<any>(null)
  const [storeResult, setStoreResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTokens = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth/yahoo/test-tokens')
      const data = await response.json()
      
      setTestResult(data)
    } catch (err: any) {
      console.error('Error fetching tokens:', err)
      setError(err.message || 'Failed to fetch tokens')
    } finally {
      setIsLoading(false)
    }
  }

  const storeTestTokens = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth/yahoo/test-tokens', {
        method: 'POST',
      })
      const data = await response.json()
      
      setStoreResult(data)
    } catch (err: any) {
      console.error('Error storing test tokens:', err)
      setError(err.message || 'Failed to store test tokens')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchTokens()
    }
  }, [loading, user])

  if (loading) {
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
          <p className="mb-4">Please sign in to access this page.</p>
          <button
            onClick={() => window.location.href = '/login?redirect=/auth/yahoo-test'}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Yahoo Token Test</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">User Information</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p><span className="font-medium">User ID:</span> {user.uid}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Token Test</h2>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={fetchTokens}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Fetch Tokens
            </button>
            
            <button
              onClick={storeTestTokens}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Store Test Tokens
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          )}
          
          {testResult && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Fetch Result</h3>
              <div className="bg-gray-50 p-4 rounded overflow-auto">
                <pre className="text-xs">{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            </div>
          )}
          
          {storeResult && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Store Result</h3>
              <div className="bg-gray-50 p-4 rounded overflow-auto">
                <pre className="text-xs">{JSON.stringify(storeResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 