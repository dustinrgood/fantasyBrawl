'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function AuthTestPage() {
  const { user, loading } = useAuth()
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testAuth = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth/test')
      const data = await response.json()
      
      setTestResult(data)
    } catch (err: any) {
      console.error('Error testing auth:', err)
      setError(err.message || 'Failed to test auth')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      testAuth()
    }
  }, [loading])

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Firebase Auth Test</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Client-Side Auth Status</h2>
          <div className="bg-gray-50 p-4 rounded">
            {loading ? (
              <p>Loading auth state...</p>
            ) : user ? (
              <>
                <p><span className="font-medium">Status:</span> Authenticated</p>
                <p><span className="font-medium">User ID:</span> {user.uid}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
              </>
            ) : (
              <p><span className="font-medium">Status:</span> Not authenticated</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Server-Side Auth Test</h2>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={testAuth}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Test Auth
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
            <div>
              <h3 className="text-lg font-semibold mb-2">API Response</h3>
              <div className="bg-gray-50 p-4 rounded overflow-auto">
                <pre className="text-xs">{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 