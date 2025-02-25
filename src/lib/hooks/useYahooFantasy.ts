'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { useAuthToken } from './useAuthToken'
import { 
  fetchUserLeaguesDirectly,
  fetchLeagueDetails,
  clearYahooTokens
} from '../services/yahooFantasyClient'

interface UseYahooFantasyOptions {
  autoFetchLeagues?: boolean
}

interface UseYahooFantasyReturn {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  leagues: any[] | null
  fetchLeagues: () => Promise<void>
  fetchTeam: (teamKey: string) => Promise<any>
  fetchRoster: (teamKey: string) => Promise<any>
  fetchPlayers: (leagueKey: string, count?: number, start?: number) => Promise<any>
  disconnect: () => Promise<void>
}

// Define interfaces for Yahoo API responses
interface YahooGame {
  game: [
    {
      game_id: string
      name: string
      code: string
      season: string
    },
    {
      leagues?: Record<string, any>
    }
  ]
}

interface YahooLeague {
  league: [
    {
      league_key: string
      name: string
      league_id: string
    },
    {
      teams?: Record<string, any>
    }
  ]
}

export function useYahooFantasy(options: UseYahooFantasyOptions = {}): UseYahooFantasyReturn {
  const { autoFetchLeagues = true } = options
  const { user } = useAuth()
  const { token: authToken, loading: tokenLoading } = useAuthToken()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leagues, setLeagues] = useState<any[] | null>(null)

  // Check if user has Yahoo tokens
  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      setIsConnected(false)
      return
    }

    const checkConnection = async () => {
      try {
        setIsLoading(true)
        
        // Check if user has Yahoo tokens using the debug endpoint
        const response = await fetch(`/api/auth/yahoo/debug?userId=${user.uid}`)
        const data = await response.json()
        
        const hasTokens = data.tokens && data.tokens.status === 'tokens found'
        setIsConnected(hasTokens)
        
        if (hasTokens && autoFetchLeagues) {
          await fetchLeagues()
        }
      } catch (err: any) {
        console.error('Error checking Yahoo connection:', err)
        setError(err.message || 'Failed to check Yahoo connection')
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [user, autoFetchLeagues])

  // Fetch user's leagues
  const fetchLeagues = async () => {
    if (!user) {
      setError('You must be logged in to fetch leagues')
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fetching Yahoo leagues...')
      
      const response = await fetch('/api/yahoo/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'users;use_login=1/games',
          userId: user.uid
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error fetching leagues:', errorData)
        
        if (errorData.needsYahooAuth) {
          setIsConnected(false)
          throw new Error('Yahoo authentication required. Please connect your Yahoo account.')
        } else if (errorData.needsYahooReauth) {
          setIsConnected(false)
          throw new Error('Yahoo authentication expired. Please reconnect your Yahoo account.')
        } else {
          throw new Error(errorData.error || 'Failed to fetch leagues from Yahoo')
        }
      }
      
      const data = await response.json()
      console.log('Yahoo leagues response:', data)
      
      // Process the leagues data
      const games = data.fantasy_content.users[0].user[1].games
      
      if (!games) {
        console.log('No games found in Yahoo response - likely NFL offseason (February to August)')
        console.log('This is normal and expected during the offseason. The Yahoo Fantasy API may not return any active leagues during this period.')
        setLeagues([])
        return
      }
      
      const gamesList = Object.values(games).filter(game => typeof game === 'object' && game !== null)
      
      // Filter to only include fantasy football
      const footballGames = gamesList.filter((game) => {
        const yahooGame = game as YahooGame
        return yahooGame.game && yahooGame.game[0].code === 'nfl'
      })
      
      // Get leagues for each football game
      const allLeagues: any[] = []
      
      for (const game of footballGames) {
        const yahooGame = game as YahooGame
        if (yahooGame.game[1].leagues) {
          const leaguesList = Object.values(yahooGame.game[1].leagues)
            .filter(league => typeof league === 'object' && league !== null)
          
          for (const league of leaguesList) {
            const yahooLeague = league as YahooLeague
            allLeagues.push({
              leagueKey: yahooLeague.league[0].league_key,
              leagueName: yahooLeague.league[0].name,
              leagueId: yahooLeague.league[0].league_id,
              gameId: yahooGame.game[0].game_id,
              gameName: yahooGame.game[0].name,
              gameCode: yahooGame.game[0].code,
              gameSeason: yahooGame.game[0].season,
              teams: yahooLeague.league[1]?.teams || null
            })
          }
        }
      }
      
      // Check if we're in the offseason based on the current month
      const currentMonth = new Date().getMonth() + 1 // JavaScript months are 0-indexed
      const isOffseason = currentMonth >= 2 && currentMonth <= 8
      
      console.log(`Found ${footballGames.length} football games and ${allLeagues.length} football leagues.`)
      if (allLeagues.length === 0 && isOffseason) {
        console.log('No leagues found - this is normal during the NFL offseason (February to August).')
        console.log('If you need to test your integration during the offseason, consider creating a test league in Yahoo Fantasy.')
      }
      
      setLeagues(allLeagues)
    } catch (err: any) {
      console.error('Error fetching leagues:', err)
      setError(err.message || 'Failed to fetch leagues')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch team details
  const fetchTeam = async (teamKey: string) => {
    // TODO: Implement team fetching
    throw new Error('Not implemented yet')
  }

  // Fetch roster
  const fetchRoster = async (teamKey: string) => {
    // TODO: Implement roster fetching
    throw new Error('Not implemented yet')
  }

  // Fetch players
  const fetchPlayers = async (leagueKey: string, count = 25, start = 0) => {
    // TODO: Implement players fetching
    throw new Error('Not implemented yet')
  }

  // Disconnect Yahoo account
  const disconnect = async () => {
    if (!user) {
      throw new Error('You must be logged in to disconnect')
    }
    
    try {
      await clearYahooTokens()
      setIsConnected(false)
      setLeagues(null)
    } catch (err: any) {
      console.error('Error disconnecting Yahoo account:', err)
      throw err
    }
  }

  return {
    isConnected,
    isLoading,
    error,
    leagues,
    fetchLeagues,
    fetchTeam,
    fetchRoster,
    fetchPlayers,
    disconnect
  }
} 