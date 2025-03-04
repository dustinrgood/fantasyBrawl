'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchUserLeagues } from '@/lib/services/yahooSportsApi'
import { ChevronDown, ChevronUp, ArrowDownAZ, ArrowUpAZ, Calendar, Trophy } from 'lucide-react'

interface ImportedLeague {
  yahooLeagueId: string
  yahooLeagueKey: string
  name: string
  season: string
  numTeams: number
  isFinished: boolean
  importedAt: string
  sport: string
}

// Yahoo league interface from API response
interface YahooLeague {
  league_id: string
  league_key: string
  name: string
  season: string
  num_teams: number
  is_finished?: boolean
  sport?: string
}

// Sort options
type SortField = 'name' | 'season' | 'sport'
type SortOrder = 'asc' | 'desc'

export default function ImportedYahooLeagues() {
  const { user } = useAuth()
  const router = useRouter()
  const [leagues, setLeagues] = useState<ImportedLeague[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [yahooConnected, setYahooConnected] = useState(false)
  
  // Sorting state
  const [sortBy, setSortBy] = useState<SortField>('season')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  useEffect(() => {
    const fetchImportedLeagues = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // First check if user has Yahoo connected
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setYahooConnected(!!userData.yahooConnected)
          
          if (userData.importedYahooLeagues) {
            setLeagues(userData.importedYahooLeagues)
          } else {
            // If no imported leagues found in Firestore, try to fetch from Yahoo API
            if (userData.yahooConnected) {
              try {
                console.debug('Fetching leagues from Yahoo API...')
                const yahooLeagues = await fetchUserLeagues()
                console.debug('Yahoo leagues response:', yahooLeagues)
                
                if (yahooLeagues && yahooLeagues.leagues && yahooLeagues.leagues.length > 0) {
                  // Transform Yahoo leagues to our format
                  const transformedLeagues = yahooLeagues.leagues.map((league: YahooLeague) => ({
                    yahooLeagueId: league.league_id,
                    yahooLeagueKey: league.league_key,
                    name: league.name,
                    season: league.season,
                    numTeams: league.num_teams,
                    isFinished: league.is_finished || false,
                    importedAt: new Date().toISOString(),
                    sport: league.sport || 'unknown'
                  }))
                  
                  setLeagues(transformedLeagues)
                  
                  // Store the imported leagues in Firestore
                  await setDoc(userDocRef, {
                    importedYahooLeagues: transformedLeagues
                  }, { merge: true })
                } else {
                  setLeagues([])
                }
              } catch (yahooError) {
                console.error('Error fetching leagues from Yahoo API:', yahooError)
                setError('Failed to fetch your Yahoo leagues. Please try reconnecting your Yahoo account.')
              }
            } else {
              setLeagues([])
            }
          }
        } else {
          setLeagues([])
        }
      } catch (err) {
        console.error('Error fetching imported leagues:', err)
        setError('Failed to load your imported leagues')
      } finally {
        setLoading(false)
      }
    }

    fetchImportedLeagues()
  }, [user])

  const handleViewLeague = (leagueKey: string) => {
    router.push(`/leagues/${leagueKey}`)
  }
  
  const handleConnectYahoo = () => {
    // Redirect to Yahoo auth flow
    import('@/lib/services/yahooSportsApi').then(({ initiateYahooAuth }) => {
      initiateYahooAuth()
    })
  }
  
  // Handle sort change
  const handleSortChange = (field: SortField) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new sort field and default to ascending order
      setSortBy(field)
      setSortOrder('asc')
    }
  }
  
  // Sort leagues based on current sort settings
  const sortedLeagues = [...leagues].sort((a, b) => {
    let comparison = 0
    
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortBy === 'season') {
      comparison = a.season.localeCompare(b.season)
    } else if (sortBy === 'sport') {
      comparison = (a.sport || '').localeCompare(b.sport || '')
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Yahoo Fantasy Leagues</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Yahoo Fantasy Leagues</h2>
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={handleConnectYahoo}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Reconnect Yahoo Account
          </button>
        </div>
      </div>
    )
  }

  // If no leagues are imported yet
  if (leagues.length === 0) {
    // Check if it's currently the NFL offseason
    const currentMonth = new Date().getMonth() + 1 // JavaScript months are 0-indexed
    const isOffseason = currentMonth >= 2 && currentMonth <= 8
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Yahoo Fantasy Leagues</h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            {yahooConnected 
              ? "No active Yahoo Fantasy leagues found." 
              : "You haven't connected your Yahoo account yet."}
          </p>
          
          {isOffseason && yahooConnected ? (
            <>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-left">
                <h3 className="font-medium text-blue-800 mb-2">Sports Season Information</h3>
                <p className="text-blue-700 mb-2">
                  It's currently March, which is the NFL offseason (February to August). During this period, Yahoo Fantasy API typically doesn't show any active NFL leagues. This is normal and expected.
                </p>
                <p className="text-blue-700 mb-2">
                  The new fantasy football season usually begins in late August/early September.
                </p>
                <p className="text-blue-700">
                  If you have active leagues for other sports (NBA, MLB, NHL, etc.), they should appear here. If not, you may not have any active leagues at this time.
                </p>
              </div>
              <p className="text-gray-500 mb-6">You can still prepare for the upcoming season by exploring our features or joining a Yahoo league when they become available.</p>
            </>
          ) : (
            <p className="text-gray-500 mb-6">
              {yahooConnected 
                ? "You don't have any active Yahoo Fantasy leagues. Join a Yahoo league to get started." 
                : "Connect your Yahoo account to import your fantasy leagues."}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleConnectYahoo}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {yahooConnected ? 'Refresh Yahoo Leagues' : 'Connect Yahoo Fantasy'}
            </button>
            <a 
              href="https://football.fantasysports.yahoo.com/f1/signup" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Join a Yahoo League
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Show the list of imported leagues
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold">Your Yahoo Fantasy Leagues</h2>
        
        <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
          <div className="text-sm text-gray-500 self-center mr-2">Sort by:</div>
          
          {/* Season/Year Sort Button */}
          <button 
            onClick={() => handleSortChange('season')}
            className={`inline-flex items-center px-3 py-1.5 rounded text-sm ${
              sortBy === 'season' 
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Calendar size={14} className="mr-1" />
            Year
            {sortBy === 'season' && (
              sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
            )}
          </button>
          
          {/* Sport Sort Button */}
          <button 
            onClick={() => handleSortChange('sport')}
            className={`inline-flex items-center px-3 py-1.5 rounded text-sm ${
              sortBy === 'sport' 
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Trophy size={14} className="mr-1" />
            Sport
            {sortBy === 'sport' && (
              sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
            )}
          </button>
          
          {/* League Name Sort Button */}
          <button 
            onClick={() => handleSortChange('name')}
            className={`inline-flex items-center px-3 py-1.5 rounded text-sm ${
              sortBy === 'name' 
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {sortOrder === 'asc' ? <ArrowDownAZ size={14} className="mr-1" /> : <ArrowUpAZ size={14} className="mr-1" />}
            League Name
            {sortBy === 'name' && (
              sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
            )}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedLeagues.map((league) => (
          <div 
            key={league.yahooLeagueKey} 
            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleViewLeague(league.yahooLeagueKey)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{league.name}</h3>
                <p className="text-gray-500">
                  Sport: {league.sport?.toUpperCase() || 'Unknown'} • Season: {league.season} • Teams: {league.numTeams}
                  {league.isFinished && <span className="ml-2 text-amber-600">(Completed)</span>}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Imported on {new Date(league.importedAt).toLocaleDateString()}
                </p>
              </div>
              <Link
                href={`/leagues/${league.yahooLeagueKey}`}
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <button 
          onClick={handleConnectYahoo}
          className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800"
        >
          Refresh Leagues
        </button>
      </div>
    </div>
  )
} 