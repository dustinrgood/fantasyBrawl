'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useYahooFantasy } from '@/lib/hooks/useYahooFantasy'
import YahooAuthButton from '@/components/YahooAuthButton'
import YahooLeagueImportModal from '@/components/YahooLeagueImportModal'
import ConnectYahooButton from '@/components/ConnectYahooButton'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const { 
    isConnected: isYahooConnected, 
    isLoading: isYahooLoading,
    leagues,
    disconnect: disconnectYahoo
  } = useYahooFantasy()
  
  // State to control the league import modal
  const [showImportModal, setShowImportModal] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile')
    }
  }, [user, loading, router])
  
  // Show import modal when user connects to Yahoo
  useEffect(() => {
    if (isYahooConnected && !isYahooLoading) {
      setShowImportModal(true)
    }
  }, [isYahooConnected, isYahooLoading])

  useEffect(() => {
    // Check if user just completed Yahoo auth
    if (typeof window !== 'undefined' && !loading && user) {
      const hasCallback = sessionStorage.getItem('yahoo_auth_callback')
      if (hasCallback) {
        // Clear the flag
        sessionStorage.removeItem('yahoo_auth_callback')
        // Show the import modal
        setShowImportModal(true)
      }
    }
  }, [loading, user])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleDisconnectYahoo = async () => {
    if (confirm('Are you sure you want to disconnect your Yahoo Fantasy account?')) {
      await disconnectYahoo()
    }
  }

  if (loading || isYahooLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  User Profile
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage your account and connected services
                </p>
              </div>
              <div className="flex space-x-4">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Back to Dashboard
                </Link>
                
                <ConnectYahooButton />
                
                <Link
                  href="/auth/yahoo-tokens"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Manage Tokens
                </Link>
                
                <Link
                  href="/auth/yahoo-debug"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Debug Yahoo
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.email}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    User ID
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.uid}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Yahoo Fantasy
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {isYahooLoading ? (
                      <span className="inline-flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking connection...
                      </span>
                    ) : isYahooConnected ? (
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 mr-2">
                            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span>Connected</span>
                          
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => setShowImportModal(true)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                            >
                              Import Leagues
                            </button>
                            
                            <button
                              onClick={handleDisconnectYahoo}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                            >
                              Disconnect
                            </button>
                          </div>
                        </div>
                        
                        {leagues && leagues.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Your Leagues:</h4>
                            <ul className="space-y-1 text-sm">
                              {leagues.map((league: any, index: number) => (
                                <li key={index} className="flex items-center">
                                  <svg className="h-4 w-4 text-purple-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {league.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <YahooAuthButton />
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      {/* Yahoo League Import Modal */}
      <YahooLeagueImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  )
}