'use client'

import { useState, useEffect } from 'react'
import { useYahooFantasy } from '@/lib/hooks/useYahooFantasy'
import { useAuth } from '@/lib/hooks/useAuth'

export default function YahooLeagueImportDebug() {
  const { user } = useAuth()
  const { isConnected, isLoading, error, leagues, fetchLeagues } = useYahooFantasy({ autoFetchLeagues: false })
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoadingDebug, setIsLoadingDebug] = useState(false)
  
  // Function to check if it's currently the NFL offseason (fallback if API doesn't provide it)
  const isOffseason = (): boolean => {
    if (debugInfo && debugInfo.seasonStatus) {
      return debugInfo.seasonStatus.isOffseason
    }
    
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1 // JavaScript months are 0-indexed
    
    // NFL offseason is roughly February (2) to August (8)
    return currentMonth >= 2 && currentMonth <= 8
  }
  
  const fetchDebugInfo = async () => {
    try {
      setIsLoadingDebug(true)
      const response = await fetch('/api/auth/yahoo/debug')
      const data = await response.json()
      setDebugInfo(data)
    } catch (err) {
      console.error('Error fetching debug info:', err)
    } finally {
      setIsLoadingDebug(false)
    }
  }
  
  const testYahooConnection = async () => {
    try {
      setIsLoadingDebug(true)
      await fetchLeagues()
      await fetchDebugInfo()
    } catch (err) {
      console.error('Error testing Yahoo connection:', err)
    } finally {
      setIsLoadingDebug(false)
    }
  }
  
  useEffect(() => {
    fetchDebugInfo()
  }, [])
  
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Yahoo Fantasy API Debug</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <span className="font-medium">User:</span> {user ? `Logged in (${user.uid.substring(0, 8)}...)` : 'Not logged in'}
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="font-medium">Yahoo Connected:</span> {isConnected ? 'Yes' : 'No'}
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="font-medium">Loading State:</span> {isLoading ? 'Loading...' : 'Idle'}
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="font-medium">Error:</span> {error || 'None'}
          </div>
        </div>
      </div>
      
      {/* Offseason Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">NFL Season Status</h3>
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Current Status: {isOffseason() ? 'Offseason' : 'Active Season'}</h4>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  {debugInfo && debugInfo.seasonStatus 
                    ? debugInfo.seasonStatus.message
                    : isOffseason() 
                      ? "It's currently the NFL offseason. Yahoo Fantasy API may not return any active leagues during this period (February to August). This is normal and expected."
                      : "It's currently the active NFL season. Yahoo Fantasy API should return your leagues if you have any."}
                </p>
                <p className="mt-2">
                  {isOffseason() && "If you need to test your integration during the offseason, consider creating a test league in Yahoo Fantasy or using mock data for development."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">API Configuration</h3>
        {debugInfo ? (
          <div className="bg-gray-50 p-4 rounded overflow-auto">
            <pre className="text-xs">{JSON.stringify(debugInfo.configuration, null, 2)}</pre>
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded">
            {isLoadingDebug ? 'Loading...' : 'No debug info available'}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Token Status</h3>
        {debugInfo ? (
          <div className="bg-gray-50 p-4 rounded overflow-auto">
            <pre className="text-xs">{JSON.stringify(debugInfo.tokens, null, 2)}</pre>
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded">
            {isLoadingDebug ? 'Loading...' : 'No token info available'}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Actions</h3>
        <div className="flex space-x-4">
          <button
            onClick={fetchDebugInfo}
            disabled={isLoadingDebug}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Refresh Debug Info
          </button>
          <button
            onClick={testYahooConnection}
            disabled={isLoading || isLoadingDebug}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Yahoo Connection
          </button>
        </div>
      </div>
      
      {leagues && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Leagues Data (Raw)</h3>
          <div className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
            <pre className="text-xs">{JSON.stringify(leagues, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
} 