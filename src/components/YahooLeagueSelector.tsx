'use client'

import { useState, useEffect } from 'react'
import { useYahooFantasy } from '@/lib/hooks/useYahooFantasy'
import { useAuth } from '@/lib/hooks/useAuth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import YahooAuthButton from '@/components/YahooAuthButton'

interface YahooLeague {
  league_id: string
  name: string
  season: string
  league_key: string
  num_teams: number
  is_finished: boolean
}

interface YahooLeagueSelectorProps {
  onComplete?: () => void
  onCancel?: () => void
}

export default function YahooLeagueSelector({ onComplete, onCancel }: YahooLeagueSelectorProps) {
  const { user } = useAuth()
  const { leagues, isLoading, error, fetchLeagues } = useYahooFantasy({ autoFetchLeagues: true })
  
  const [selectedLeagues, setSelectedLeagues] = useState<Record<string, boolean>>({})
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle')
  const [importError, setImportError] = useState<string | null>(null)
  const [parsedLeagues, setParsedLeagues] = useState<YahooLeague[]>([])

  // Parse the Yahoo leagues data structure
  useEffect(() => {
    if (leagues) {
      try {
        // Yahoo's API returns a complex nested structure
        // We need to extract the actual league objects
        const leaguesList: YahooLeague[] = []
        
        console.log('Raw leagues data:', JSON.stringify(leagues).substring(0, 500) + '...')
        console.log('Raw leagues data type:', typeof leagues)
        console.log('Is leagues array?', Array.isArray(leagues))
        
        // First, try to handle the response as if it's from the Yahoo Fantasy API directly
        const leaguesObj = leagues as any; // Type assertion to avoid TypeScript errors
        if (typeof leaguesObj === 'object' && !Array.isArray(leaguesObj) && leaguesObj !== null && 
            leaguesObj.fantasy_content && leaguesObj.fantasy_content.users) {
          console.log('Parsing leagues from fantasy_content.users structure')
          const user = leaguesObj.fantasy_content.users[0].user[0]
          
          // Check if the user has games
          if (user.games && user.games.count > 0) {
            // Loop through each game
            for (let i = 0; i < user.games.count; i++) {
              const game = user.games[i].game[0]
              
              // Check if the game has leagues
              if (game.leagues && game.leagues.count > 0) {
                // Loop through each league in the game
                for (let j = 0; j < game.leagues.count; j++) {
                  if (game.leagues[j] && game.leagues[j].league) {
                    leaguesList.push(game.leagues[j].league[0])
                  }
                }
              }
            }
          }
        }
        // Check if leagues is an object with count property (alternative format)
        else if (typeof leagues === 'object' && leagues !== null && 'count' in leagues) {
          console.log('Parsing leagues from object with count property:', leagues.count)
          const leaguesObj = leagues as { count: number; [key: number]: { league: [YahooLeague, any] } }
          const count = leaguesObj.count as number
          
          // Handle object with numeric keys
          for (let i = 0; i < count; i++) {
            if (leaguesObj[i] && leaguesObj[i].league) {
              leaguesList.push(leaguesObj[i].league[0])
            }
          }
        } else if (Array.isArray(leagues)) {
          // Handle array of leagues
          console.log('Parsing leagues from array structure')
          leagues.forEach(leagueData => {
            if (leagueData && leagueData.league) {
              leaguesList.push(leagueData.league[0])
            }
          })
        } else if (leagues === null || leagues === undefined || (typeof leagues === 'object' && Object.keys(leagues).length === 0)) {
          // Handle empty leagues
          console.log('No leagues found in Yahoo account')
        } else {
          console.error('Unexpected leagues data structure:', leagues)
        }
        
        console.log('Parsed Yahoo leagues:', leaguesList)
        setParsedLeagues(leaguesList)
        
        // Initialize all leagues as selected by default
        const initialSelected: Record<string, boolean> = {}
        leaguesList.forEach(league => {
          initialSelected[league.league_key] = true
        })
        setSelectedLeagues(initialSelected)
      } catch (err) {
        console.error('Error parsing Yahoo leagues data:', err)
        console.error('Raw leagues data:', leagues)
        setParsedLeagues([])
      }
    }
  }, [leagues])

  const handleToggleLeague = (leagueKey: string) => {
    setSelectedLeagues(prev => ({
      ...prev,
      [leagueKey]: !prev[leagueKey]
    }))
  }

  const handleSelectAll = () => {
    const allSelected: Record<string, boolean> = {}
    parsedLeagues.forEach(league => {
      allSelected[league.league_key] = true
    })
    setSelectedLeagues(allSelected)
  }

  const handleSelectNone = () => {
    const noneSelected: Record<string, boolean> = {}
    parsedLeagues.forEach(league => {
      noneSelected[league.league_key] = false
    })
    setSelectedLeagues(noneSelected)
  }

  const handleImportLeagues = async () => {
    if (!user) return
    
    setImportStatus('importing')
    setImportError(null)
    
    try {
      // Filter only selected leagues
      const leaguesToImport = parsedLeagues.filter(league => 
        selectedLeagues[league.league_key]
      )
      
      if (leaguesToImport.length === 0) {
        setImportError('Please select at least one league to import')
        setImportStatus('error')
        return
      }
      
      // Store the selected leagues in Firestore
      const userRef = doc(db, 'users', user.uid)
      await setDoc(userRef, {
        importedYahooLeagues: leaguesToImport.map(league => ({
          yahooLeagueId: league.league_id,
          yahooLeagueKey: league.league_key,
          name: league.name,
          season: league.season,
          numTeams: league.num_teams,
          isFinished: league.is_finished,
          importedAt: new Date().toISOString()
        })),
        yahooLeaguesUpdatedAt: new Date().toISOString()
      }, { merge: true })
      
      setImportStatus('success')
      
      // Call the onComplete callback after a short delay
      if (onComplete) {
        setTimeout(onComplete, 1500)
      }
    } catch (err) {
      console.error('Error importing leagues:', err)
      setImportError(err instanceof Error ? err.message : 'Failed to import leagues')
      setImportStatus('error')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Loading Yahoo Fantasy Leagues</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Error Loading Leagues</h2>
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <p className="text-red-700 font-medium">Network Error</p>
          <p className="text-red-600 mt-1">{error}</p>
          <p className="text-gray-700 mt-2">
            This could be due to one of the following reasons:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-1">
            <li>Your Yahoo authentication token may have expired</li>
            <li>There might be an issue with the Yahoo Fantasy API</li>
            <li>Your network connection may be unstable</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <p className="text-blue-700 font-medium">Troubleshooting Steps:</p>
          <ol className="list-decimal list-inside text-gray-700 mt-1">
            <li>Try clicking the "Retry" button below</li>
            <li>If that doesn't work, try disconnecting and reconnecting your Yahoo account</li>
            <li>Make sure you have active Yahoo Fantasy leagues</li>
            <li>Check your browser console for more detailed error information</li>
          </ol>
        </div>
        
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={() => {
              console.log('Debug info:');
              console.log('- Error:', error);
              console.log('- isLoading:', isLoading);
              console.log('- User:', user ? `Logged in (${user.uid})` : 'Not logged in');
              
              // Try to get Yahoo tokens
              import('@/lib/services/yahooSportsApi').then(async (api) => {
                try {
                  const tokens = await api.getYahooTokens();
                  console.log('- Yahoo tokens:', tokens ? 'Available' : 'Not available');
                  if (tokens) {
                    console.log('  - Token expires at:', new Date(tokens.expires_at).toLocaleString());
                    console.log('  - Token expired:', tokens.expires_at < Date.now());
                  }
                } catch (err) {
                  console.error('Error getting Yahoo tokens:', err);
                }
              });
              
              alert('Debug info logged to console. Please open browser developer tools to view.');
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Debug
          </button>
          <button
            onClick={() => fetchLeagues()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    )
  }

  if (parsedLeagues.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">No Yahoo Fantasy Leagues Found</h2>
        <p className="text-gray-600 mb-4">
          We couldn't find any Yahoo Fantasy leagues associated with your account. This could be because:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
          <li>You haven't fully authenticated with Yahoo Fantasy yet</li>
          <li>You don't have any Yahoo Fantasy leagues (active or completed)</li>
          <li>There was an error connecting to the Yahoo Fantasy API</li>
        </ul>
        
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <h3 className="text-blue-800 font-medium mb-2">Try These Steps:</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>Click the "Connect Yahoo" button below to start the authentication process</li>
            <li>You'll be redirected to Yahoo to log in and grant permission</li>
            <li>After authenticating, you'll be brought back to this page</li>
            <li>Then click "Refresh" to load your leagues</li>
          </ol>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex justify-center">
            <YahooAuthButton 
              variant="primary" 
              size="md" 
              label="Connect Yahoo Fantasy"
              onConnect={() => fetchLeagues()}
            />
          </div>
          
          <div className="flex justify-between space-x-3">
            <button
              onClick={async () => {
                console.log('Running Yahoo API debug...');
                
                // Check if user is logged in
                console.log('- User:', user ? `Logged in (${user.uid})` : 'Not logged in');
                
                // Try to get Yahoo tokens
                try {
                  const yahooSportsApi = await import('@/lib/services/yahooSportsApi');
                  const tokens = await yahooSportsApi.getYahooTokens();
                  console.log('- Yahoo tokens:', tokens ? 'Available' : 'Not available');
                  if (tokens) {
                    console.log('  - Access token:', tokens.access_token.substring(0, 10) + '...');
                    console.log('  - Refresh token:', tokens.refresh_token.substring(0, 10) + '...');
                    console.log('  - Token expires at:', new Date(tokens.expires_at).toLocaleString());
                    console.log('  - Token expired:', tokens.expires_at < Date.now());
                  }
                  
                  // Test API connection
                  try {
                    console.log('Testing Yahoo API connection...');
                    const response = await fetch('/api/yahoo/proxy', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        endpoint: 'users;use_login=1/games'
                      }),
                    });
                    
                    console.log('- API response status:', response.status);
                    
                    if (response.ok) {
                      const data = await response.json();
                      console.log('- API response successful');
                      console.log('- Games found:', data.fantasy_content?.users?.[0]?.user?.[1]?.games?.count || 0);
                    } else {
                      const errorText = await response.text();
                      console.error('- API response error:', errorText);
                    }
                  } catch (apiError) {
                    console.error('- API test error:', apiError);
                  }
                } catch (err) {
                  console.error('- Error getting Yahoo tokens:', err);
                }
                
                alert('Debug info logged to console. Please open browser developer tools to view.');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Debug Yahoo API
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={() => fetchLeagues()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Refresh
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Import Yahoo Fantasy Leagues</h2>
      
      {importStatus === 'success' ? (
        <div className="bg-green-50 p-4 rounded-md mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Leagues imported successfully!
              </p>
            </div>
          </div>
        </div>
      ) : importStatus === 'error' ? (
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {importError || 'Error importing leagues'}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      
      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          Select the leagues you want to import:
        </p>
        <div className="flex space-x-2">
          <button
            onClick={handleSelectAll}
            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Select All
          </button>
          <button
            onClick={handleSelectNone}
            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Select None
          </button>
        </div>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
        {parsedLeagues.map(league => (
          <div 
            key={league.league_key}
            className={`p-3 rounded-md border ${
              selectedLeagues[league.league_key] 
                ? 'border-indigo-300 bg-indigo-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleToggleLeague(league.league_key)}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedLeagues[league.league_key] || false}
                onChange={() => handleToggleLeague(league.league_key)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <div className="ml-3 flex-grow">
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  {league.name}
                  {league.is_finished && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Finished
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  Season: {league.season} • Teams: {league.num_teams}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-3">
        {importStatus === 'importing' ? (
          <button
            disabled
            className="px-4 py-2 bg-indigo-400 text-white rounded-md cursor-not-allowed"
          >
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Importing...
          </button>
        ) : (
          <button
            onClick={handleImportLeagues}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Import Selected
          </button>
        )}
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
} 