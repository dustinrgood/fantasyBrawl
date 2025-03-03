'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Trophy, Users, Loader2, ArrowRight, Check, Mail, User, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Commissioner {
  name: string
  email: string | null
  teamId: string
}

interface League {
  id: string
  name: string
  description: string
  sport: string
  season: string
  managerIds: string[]
  scoringSystem?: {
    type: string
    description: string
  }
  isPublic: boolean
  createdAt: string
  yahooLeagueKey?: string
  yahooLeagueId?: string
  numTeams?: number
  draftStatus?: string
  logoUrl?: string | null
  commissioner?: Commissioner | null
}

export default function NBAPublicLeaguesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importingLeague, setImportingLeague] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (user) {
      fetchNBALeagues()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchNBALeagues = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log(`Fetching NBA leagues for user: ${user.uid}`)
      const response = await fetch(`/api/yahoo/nba-public-leagues?userId=${user.uid}&limit=10`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json()
      console.log(`Received ${data.leagues?.length || 0} leagues`)
      setLeagues(data.leagues || [])
    } catch (err) {
      console.error('Error fetching NBA public leagues:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch leagues')
    } finally {
      setLoading(false)
    }
  }

  const handleImportLeague = async (league: League) => {
    try {
      if (!user) {
        alert('Please sign in to import leagues')
        router.push('/login?redirect=/leagues/nba-public')
        return
      }

      setImportingLeague(league.id)

      // Call the actual import API
      const response = await fetch('/api/yahoo/import-league', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          leagueKey: league.yahooLeagueKey,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      // Mark this league as successfully imported
      setImportSuccess(prev => ({ ...prev, [league.id]: true }))

      // Redirect to the imported league after a short delay
      setTimeout(() => {
        router.push('/leagues/my')
      }, 1000)
    } catch (err) {
      console.error('Error importing league:', err)
      alert(err instanceof Error ? err.message : 'Failed to import league')
    } finally {
      setImportingLeague(null)
    }
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-4">Please sign in to view public NBA leagues.</p>
          <button
            onClick={() => router.push('/login?redirect=/leagues/nba-public')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Public NBA Leagues</h1>
        <p className="text-gray-600">Browse and import public NBA fantasy leagues from Yahoo</p>
      </div>

      {/* League List */}
      <div>
        <h2 className="text-xl font-bold mb-4">Available NBA Leagues</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500">Loading leagues...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to fetch NBA public leagues</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex flex-col space-y-4">
              <button
                onClick={fetchNBALeagues}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
              
              <Link 
                href="/auth/yahoo-guide" 
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 w-full sm:w-auto"
              >
                Yahoo Connection Guide
              </Link>
            </div>
          </div>
        ) : leagues.length === 0 ? (
          <div className="p-6 bg-white rounded-lg shadow text-center">
            <p className="text-gray-500">No NBA leagues found. This could be because:</p>
            <ul className="list-disc list-inside mt-2 text-gray-500 text-left max-w-md mx-auto">
              <li>There are no public NBA leagues available at the moment</li>
              <li>Your Yahoo tokens may need to be refreshed</li>
              <li>The Yahoo Fantasy API may be experiencing issues</li>
            </ul>
            <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-center">
              <button
                onClick={fetchNBALeagues}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
              
              <Link 
                href="/auth/yahoo-guide" 
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Yahoo Connection Guide
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {leagues.map(league => (
              <div key={league.id} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{league.name}</h3>
                    <p className="text-gray-600 mb-2">{league.description}</p>

                    <div className="flex flex-wrap gap-4 mb-3">
                      <div className="flex items-center text-gray-700">
                        <Trophy className="h-4 w-4 mr-1 text-indigo-600" />
                        <span className="capitalize">{league.sport}</span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <Users className="h-4 w-4 mr-1 text-indigo-600" />
                        <span>{league.numTeams || league.managerIds.length} Teams</span>
                      </div>

                      {league.scoringSystem && (
                        <div className="flex items-center text-gray-700">
                          <span className="capitalize">{league.scoringSystem.description}</span>
                        </div>
                      )}
                    </div>

                    {/* Commissioner Information */}
                    {league.commissioner && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Commissioner</h4>
                        <div className="flex items-center text-gray-600 mb-1">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{league.commissioner.name}</span>
                        </div>
                        {league.commissioner.email && (
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{league.commissioner.email}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleImportLeague(league)}
                      disabled={importingLeague === league.id || !!importSuccess[league.id]}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center ${
                        importSuccess[league.id]
                          ? 'bg-green-600 text-white'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      } disabled:opacity-50`}
                    >
                      {importingLeague === league.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : importSuccess[league.id] ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Imported
                        </>
                      ) : (
                        'Import League'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back to My Leagues */}
      <div className="mt-8">
        <Link
          href="/leagues/my"
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
        >
          ← Back to My Leagues
        </Link>
      </div>
    </div>
  )
} 