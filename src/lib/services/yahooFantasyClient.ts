import YahooFantasy from 'yahoo-fantasy'
import { auth, db } from '../firebase/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { getAuthToken } from '@/lib/hooks/useAuthToken'

// Yahoo OAuth configuration
const YAHOO_CLIENT_ID = process.env.NEXT_PUBLIC_YAHOO_CLIENT_ID
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET
const REDIRECT_URI = typeof window !== 'undefined' 
  ? `${window.location.origin}/api/auth/yahoo/callback`
  : process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/yahoo/callback`
    : 'https://localhost:3001/api/auth/yahoo/callback'

// Types
export interface YahooTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

// Create a singleton instance of the Yahoo Fantasy client
let yahooClient: any = null

/**
 * Token callback function to persist refreshed tokens
 */
const tokenCallback = async (err: Error | null, tokens: any) => {
  if (err) {
    console.error('Error in token callback:', err)
    return
  }
  
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      console.error('No user logged in during token refresh')
      return
    }
    
    // Calculate expiration time (tokens last 1 hour)
    const expires_at = Date.now() + 3600 * 1000
    
    // Store the new tokens
    const yahooTokens: YahooTokens = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at
    }
    
    await storeYahooTokens(yahooTokens)
    console.log('Yahoo tokens refreshed and stored successfully')
  } catch (error) {
    console.error('Error storing refreshed tokens:', error)
  }
}

/**
 * Initialize the Yahoo Fantasy client
 */
export const getYahooClient = () => {
  try {
    if (!yahooClient) {
      // In the browser, we don't need to check for YAHOO_CLIENT_SECRET
      // because we'll be using the server-side API for token operations
      if (typeof window !== 'undefined') {
        if (!YAHOO_CLIENT_ID) {
          console.error('Yahoo client ID not configured for browser')
          throw new Error('Yahoo client ID not configured')
        }
        
        console.log('Initializing Yahoo Fantasy client in browser mode')
        console.log('Using client ID:', YAHOO_CLIENT_ID ? `${YAHOO_CLIENT_ID.substring(0, 10)}...` : 'missing')
        console.log('Using redirect URI:', REDIRECT_URI)
        
        // In browser, initialize with just the client ID
        yahooClient = new YahooFantasy(
          YAHOO_CLIENT_ID,
          '', // Empty string for client secret in browser
          tokenCallback,
          REDIRECT_URI
        )
        
        console.log('Yahoo Fantasy client initialized (browser mode)')
      } else {
        // Server-side initialization requires both client ID and secret
        if (!YAHOO_CLIENT_ID || !YAHOO_CLIENT_SECRET) {
          console.error('Yahoo client credentials not configured for server', {
            clientId: YAHOO_CLIENT_ID ? 'present' : 'missing',
            clientSecret: YAHOO_CLIENT_SECRET ? 'present' : 'missing'
          })
          throw new Error('Yahoo client credentials not configured')
        }
        
        console.log('Initializing Yahoo Fantasy client in server mode')
        console.log('Using client ID:', YAHOO_CLIENT_ID ? `${YAHOO_CLIENT_ID.substring(0, 10)}...` : 'missing')
        console.log('Using redirect URI:', REDIRECT_URI)
        
        yahooClient = new YahooFantasy(
          YAHOO_CLIENT_ID,
          YAHOO_CLIENT_SECRET,
          tokenCallback,
          REDIRECT_URI
        )
        
        console.log('Yahoo Fantasy client initialized (server mode)')
      }
    }
    
    return yahooClient
  } catch (error) {
    console.error('Error initializing Yahoo Fantasy client:', error)
    throw error
  }
}

/**
 * Initiates the Yahoo OAuth flow
 */
export const initiateYahooAuth = () => {
  if (!YAHOO_CLIENT_ID) {
    console.error('Yahoo Client ID not configured')
    throw new Error('Yahoo Client ID not configured')
  }

  const state = generateRandomString(32)
  
  // Store state in session storage for verification
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('yahoo_oauth_state', state)
  }
  
  // Get the Yahoo client and redirect to auth page
  const yf = getYahooClient()
  
  // Redirect to Yahoo authorization page
  if (typeof window !== 'undefined') {
    yf.auth(window.location, state)
  }
}

/**
 * Exchanges authorization code for access tokens
 */
export const exchangeCodeForTokens = async (code: string): Promise<YahooTokens> => {
  try {
    const response = await fetch('/api/auth/yahoo/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }
    
    const data = await response.json()
    const { access_token, refresh_token, expires_in } = data
    
    // Calculate expiration time
    const expires_at = Date.now() + expires_in * 1000
    
    return { access_token, refresh_token, expires_at }
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    throw error
  }
}

/**
 * Stores Yahoo tokens in Firestore for the current user
 */
export const storeYahooTokens = async (tokens: YahooTokens) => {
  console.log('Attempting to store Yahoo tokens in Firestore...')
  
  const currentUser = auth.currentUser
  
  if (!currentUser) {
    console.error('No user logged in when trying to store Yahoo tokens')
    throw new Error('User must be logged in to store Yahoo tokens')
  }
  
  try {
    console.log(`Storing tokens for user: ${currentUser.uid}`)
    console.log('Token data:', {
      accessTokenPrefix: tokens.access_token ? tokens.access_token.substring(0, 10) + '...' : 'undefined',
      refreshTokenPrefix: tokens.refresh_token ? tokens.refresh_token.substring(0, 10) + '...' : 'undefined',
      expiresAt: tokens.expires_at ? new Date(tokens.expires_at).toLocaleString() : 'undefined'
    })
    
    // Get the auth token
    const authToken = await getAuthToken()
    if (!authToken) {
      throw new Error('Failed to get authentication token')
    }
    
    // Use the new API endpoint to store tokens
    const response = await fetch('/api/auth/yahoo/store-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: currentUser.uid,
        tokens: tokens
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to store tokens')
    }
    
    console.log('Yahoo tokens successfully stored in Firestore')
    return true
  } catch (error) {
    console.error('Error storing Yahoo tokens:', error)
    throw error
  }
}

/**
 * Retrieves Yahoo tokens for the current user
 */
export const getYahooTokens = async (): Promise<YahooTokens | null> => {
  console.log('Attempting to retrieve Yahoo tokens from Firestore...')
  
  const currentUser = auth.currentUser
  
  if (!currentUser) {
    console.log('No user logged in when trying to get Yahoo tokens')
    return null
  }
  
  try {
    console.log(`Retrieving tokens for user: ${currentUser.uid}`)
    
    // Get the auth token
    const authToken = await getAuthToken()
    if (!authToken) {
      console.error('Failed to get authentication token')
      return null
    }
    
    // Use the new API endpoint to get tokens - using GET method
    const response = await fetch(`/api/auth/yahoo/get-tokens?userId=${currentUser.uid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Error retrieving Yahoo tokens:', errorData)
      return null
    }
    
    const data = await response.json()
    
    if (!data.tokens) {
      console.error('No tokens found in response')
      return null
    }
    
    // Handle both token formats
    const tokens = data.tokens
    const yahooTokens: YahooTokens = {
      access_token: tokens.accessToken || tokens.access_token,
      refresh_token: tokens.refreshToken || tokens.refresh_token,
      expires_at: tokens.expiresAt || tokens.expires_at
    }
    
    console.log('Yahoo tokens retrieved successfully')
    console.log('Token data:', {
      accessTokenPrefix: yahooTokens.access_token ? yahooTokens.access_token.substring(0, 10) + '...' : 'undefined',
      refreshTokenPrefix: yahooTokens.refresh_token ? yahooTokens.refresh_token.substring(0, 10) + '...' : 'undefined',
      expiresAt: yahooTokens.expires_at ? new Date(yahooTokens.expires_at).toLocaleString() : 'undefined'
    })
    
    return yahooTokens
  } catch (error) {
    console.error('Error retrieving Yahoo tokens:', error)
    return null
  }
}

/**
 * Refreshes the Yahoo token if needed
 */
export const refreshYahooTokenIfNeeded = async (): Promise<YahooTokens | null> => {
  try {
    const tokens = await getYahooTokens()
    
    if (!tokens) {
      console.error('No Yahoo tokens found to refresh')
      return null
    }
    
    // Check if tokens are expired or about to expire (within 5 minutes)
    const isExpired = tokens.expires_at < Date.now()
    const isAboutToExpire = tokens.expires_at < (Date.now() + 5 * 60 * 1000)
    
    if (!isExpired && !isAboutToExpire) {
      // Tokens are still valid
      return tokens
    }
    
    console.log('Refreshing Yahoo tokens...')
    
    const currentUser = auth.currentUser
    if (!currentUser) {
      console.error('No user logged in when trying to refresh Yahoo tokens')
      return null
    }
    
    // Get the auth token
    const authToken = await getAuthToken()
    if (!authToken) {
      console.error('Failed to get authentication token')
      return null
    }
    
    // Make the refresh token request to the correct endpoint
    const response = await fetch('/api/auth/yahoo/refresh-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: currentUser.uid
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Error refreshing Yahoo tokens:', errorData)
      throw new Error(errorData.error || 'Failed to refresh token')
    }
    
    const data = await response.json()
    
    if (!data.success || !data.tokens) {
      console.error('No tokens returned from refresh endpoint')
      return null
    }
    
    // Format the tokens to match our expected structure
    const newTokens: YahooTokens = {
      access_token: data.tokens.accessToken,
      refresh_token: data.tokens.refreshToken,
      expires_at: data.tokens.expiresAt
    }
    
    console.log('Yahoo tokens refreshed successfully')
    console.log('Token data:', {
      accessTokenPrefix: newTokens.access_token ? newTokens.access_token.substring(0, 10) + '...' : 'undefined',
      refreshTokenPrefix: newTokens.refresh_token ? newTokens.refresh_token.substring(0, 10) + '...' : 'undefined',
      expiresAt: newTokens.expires_at ? new Date(newTokens.expires_at).toLocaleString() : 'undefined'
    })
    
    return newTokens
  } catch (error) {
    console.error('Error refreshing Yahoo token:', error)
    return null
  }
}

/**
 * Sets the user token in the Yahoo Fantasy client
 */
export const setYahooUserToken = async (): Promise<boolean> => {
  try {
    console.log('Getting Yahoo tokens...')
    const tokens = await getYahooTokens()
    
    if (!tokens) {
      console.error('No Yahoo tokens found')
      return false
    }
    
    console.log('Tokens found, checking expiration...')
    console.log('Token expires at:', new Date(tokens.expires_at).toLocaleString())
    console.log('Current time:', new Date().toLocaleString())
    console.log('Is expired:', tokens.expires_at < Date.now())
    
    // Check if tokens are expired
    if (tokens.expires_at < Date.now()) {
      console.log('Tokens are expired, attempting to refresh...')
      const refreshedTokens = await refreshYahooTokenIfNeeded()
      if (!refreshedTokens) {
        console.error('Failed to refresh expired tokens')
        return false
      }
    }
    
    // Get the Yahoo client and set the tokens
    try {
      console.log('Getting Yahoo client for token setting...')
      const yf = getYahooClient()
      
      if (!yf) {
        console.error('Failed to get Yahoo client')
        return false
      }
      
      // Add debug logging
      console.log('Setting Yahoo user token:', tokens.access_token ? tokens.access_token.substring(0, 10) + '...' : 'undefined')
      console.log('Setting Yahoo refresh token:', tokens.refresh_token ? tokens.refresh_token.substring(0, 10) + '...' : 'undefined')
      
      // Set the tokens
      if (!tokens.access_token || !tokens.refresh_token) {
        console.error('Missing access or refresh token')
        return false
      }
      
      yf.setUserToken(tokens.access_token)
      yf.setRefreshToken(tokens.refresh_token)
      
      console.log('Yahoo user token set successfully')
      return true
    } catch (error) {
      console.error('Error in Yahoo client while setting tokens:', error)
      return false
    }
  } catch (error) {
    console.error('Error setting Yahoo user token:', error)
    return false
  }
}

/**
 * Makes an authenticated request to the Yahoo Fantasy API directly without using the yahoo-fantasy package
 */
export const makeYahooApiRequest = async (endpoint: string) => {
  try {
    console.log(`Making Yahoo API request to: ${endpoint}`)
    
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      console.error('No user logged in when trying to make Yahoo API request')
      throw new Error('User must be logged in to make Yahoo API requests')
    }
    
    // Use the proxy API instead of making direct requests
    const response = await fetch('/api/yahoo/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint,
        userId: currentUser.uid
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Yahoo API request failed: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error making Yahoo API request:', error)
    throw error
  }
}

/**
 * Fetches user's Yahoo Fantasy leagues directly using the proxy API
 */
export const fetchUserLeaguesDirectly = async () => {
  console.log('Fetching user leagues directly from Yahoo API...')
  
  const currentUser = auth.currentUser
  
  if (!currentUser) {
    console.error('No user logged in when trying to fetch leagues')
    throw new Error('User must be logged in to fetch leagues')
  }
  
  try {
    // Get the auth token
    const authToken = await getAuthToken()
    if (!authToken) {
      throw new Error('Failed to get authentication token')
    }
    
    // Call the Yahoo proxy API
    const response = await fetch('/api/yahoo/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: currentUser.uid,
        endpoint: 'users;use_login=1/games'
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch leagues')
    }
    
    const data = await response.json()
    console.log('Yahoo API response received for games')
    
    // Check if the response has the expected structure
    if (!data.fantasy_content || !data.fantasy_content.users || !data.fantasy_content.users[0].user) {
      console.error('Unexpected Yahoo API response structure:', JSON.stringify(data).substring(0, 500) + '...')
      throw new Error('Unexpected response from Yahoo API')
    }
    
    // Extract games from the response
    const games = data.fantasy_content.users[0].user[1].games
    
    if (!games) {
      console.log('No games found in Yahoo response')
      return []
    }
    
    // Filter out the count property and process each game
    const gamesList = Object.keys(games)
      .filter(key => key !== 'count')
      .map(key => games[key].game[0])
    
    console.log(`Found ${gamesList.length} Yahoo Fantasy games`)
    
    // Sort games by season in descending order (most recent first)
    gamesList.sort((a, b) => parseInt(b.season) - parseInt(a.season))
    
    // For each game, fetch the leagues
    const allLeagues = []
    let totalLeaguesFound = 0
    
    for (const game of gamesList) {
      try {
        console.log(`Fetching leagues for game: ${game.name} (${game.game_key})`)
        
        // Make the API request through our proxy
        const leaguesResponse = await fetch('/api/yahoo/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.uid,
            endpoint: `users;use_login=1/games;game_keys=${game.game_key}/leagues`
          }),
        })
        
        if (!leaguesResponse.ok) {
          console.error(`Failed to fetch leagues for game ${game.game_key}:`, leaguesResponse.status, leaguesResponse.statusText)
          continue // Skip this game and try the next one
        }
        
        const leaguesData = await leaguesResponse.json()
        console.log(`Received response for game ${game.game_key} leagues`)
        
        // Check if the response has the expected structure
        if (!leaguesData.fantasy_content || !leaguesData.fantasy_content.users || !leaguesData.fantasy_content.users[0].user) {
          console.error(`Unexpected response structure for game ${game.game_key}:`, JSON.stringify(leaguesData).substring(0, 500) + '...')
          continue // Skip this game and try the next one
        }
        
        // Extract leagues from the response
        const userLeagues = leaguesData.fantasy_content.users[0].user[1].games[0].game[1].leagues
        
        if (!userLeagues || userLeagues.count === 0) {
          console.log(`No leagues found for game ${game.game_key}`)
          continue // Skip this game and try the next one
        }
        
        // Filter out the count property and process each league
        const leaguesList = Object.keys(userLeagues)
          .filter(key => key !== 'count')
          .map(key => {
            const league = userLeagues[key].league[0]
            return {
              league_id: league.league_id,
              name: league.name,
              season: game.season,
              league_key: league.league_key,
              num_teams: league.num_teams,
              is_finished: game.is_game_over === 1
            }
          })
        
        console.log(`Found ${leaguesList.length} leagues for game ${game.game_key}`)
        totalLeaguesFound += leaguesList.length
        
        // Add leagues to the result
        allLeagues.push(...leaguesList)
      } catch (gameError) {
        console.error(`Error fetching leagues for game ${game.game_key}:`, gameError)
        // Continue with the next game
      }
    }
    
    console.log(`Total leagues found across all games: ${totalLeaguesFound}`)
    
    // Sort leagues by season (most recent first)
    allLeagues.sort((a, b) => parseInt(b.season) - parseInt(a.season))
    
    return allLeagues
  } catch (error) {
    console.error('Error fetching user leagues directly:', error)
    throw error
  }
}

/**
 * Fetches details for a specific league
 */
export const fetchLeagueDetails = async (leagueKey: string) => {
  console.log(`Fetching league details for ${leagueKey} through proxy...`)
  
  const currentUser = auth.currentUser
  
  if (!currentUser) {
    console.error('No user logged in when trying to fetch league details')
    throw new Error('User must be logged in to fetch league details')
  }
  
  try {
    // Get the auth token
    const authToken = await getAuthToken()
    if (!authToken) {
      throw new Error('Failed to get authentication token')
    }
    
    // Call the Yahoo proxy API for basic league details
    const response = await fetch('/api/yahoo/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: currentUser.uid,
        endpoint: `league/${leagueKey}`
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch league details')
    }
    
    const data = await response.json()
    
    // Now fetch the league settings to get roster configuration
    const settingsResponse = await fetch('/api/yahoo/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: currentUser.uid,
        endpoint: `league/${leagueKey}/settings`
      }),
    })
    
    // Process the basic league data
    const leagueData = data.fantasy_content?.league?.[0] || {}
    const leagueDetails = {
      name: leagueData.name || '',
      league_key: leagueData.league_key || '',
      league_id: leagueData.league_id || '',
      season: leagueData.season || '',
      num_teams: leagueData.num_teams || 0,
      scoring_type: leagueData.scoring_type || '',
      start_date: leagueData.start_date || '',
      end_date: leagueData.end_date || '',
      current_week: leagueData.current_week || '',
      start_week: leagueData.start_week || '',
      end_week: leagueData.end_week || '',
      game_code: leagueData.game_code || '',
      league_type: leagueData.league_type || '',
      draft_status: leagueData.draft_status || '',
      draft_time: leagueData.draft_time || '',
      weekly_deadline: leagueData.weekly_deadline || '',
      is_finished: leagueData.is_finished === '1',
    }
    
    // Extract standings if available
    const standingsData = data.fantasy_content?.league?.[1]?.standings?.[0]?.teams || []
    const teams = []
    
    // Process teams data
    for (const key in standingsData) {
      if (key !== 'count') {
        const teamData = standingsData[key]?.team?.[0] || {}
        const teamStandings = standingsData[key]?.team?.[1]?.team_standings || {}
        
        teams.push({
          team_key: teamData.team_key || '',
          team_id: teamData.team_id || '',
          name: teamData.name || '',
          url: teamData.url || '',
          team_logo: teamData.team_logos?.[0]?.team_logo?.url || '',
          waiver_priority: teamData.waiver_priority || '',
          number_of_moves: teamData.number_of_moves || '',
          number_of_trades: teamData.number_of_trades || '',
          managers: teamData.managers || [],
          team_standings: {
            rank: teamStandings.rank || 0,
            playoff_seed: teamStandings.playoff_seed || 0,
            outcome_totals: {
              wins: teamStandings.outcome_totals?.wins || 0,
              losses: teamStandings.outcome_totals?.losses || 0,
              ties: teamStandings.outcome_totals?.ties || 0,
              percentage: teamStandings.outcome_totals?.percentage || '0.000'
            },
            points_for: parseFloat(teamStandings.points_for || '0'),
            points_against: parseFloat(teamStandings.points_against || '0')
          }
        })
      }
    }
    
    // Add settings data if available
    let settings = {}
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json()
      const rosterPositions = settingsData.fantasy_content?.league?.[1]?.settings?.[0]?.roster_positions || []
      const statCategories = settingsData.fantasy_content?.league?.[1]?.settings?.[0]?.stat_categories || {}
      const leagueSettings = settingsData.fantasy_content?.league?.[1]?.settings?.[0] || {}
      
      // Process roster positions
      const processedRosterPositions = []
      for (const key in rosterPositions) {
        if (key !== 'count') {
          const position = rosterPositions[key].roster_position
          if (position) {
            processedRosterPositions.push({
              position: position.position,
              position_type: position.position_type,
              count: parseInt(position.count || '1')
            })
          }
        }
      }
      
      // Process stat categories
      const processedStatCategories = {
        stats: []
      }
      
      if (statCategories.stats) {
        for (const key in statCategories.stats) {
          if (key !== 'count') {
            const stat = statCategories.stats[key].stat
            if (stat) {
              processedStatCategories.stats.push({
                stat_id: stat.stat_id,
                name: stat.name,
                display_name: stat.display_name,
                sort_order: stat.sort_order,
                position_type: stat.position_type,
                is_only_display_stat: stat.is_only_display_stat
              })
            }
          }
        }
      }
      
      settings = {
        roster_positions: processedRosterPositions,
        stat_categories: processedStatCategories,
        max_teams: leagueSettings.max_teams || leagueDetails.num_teams,
        waiver_type: leagueSettings.waiver_type || '',
        uses_playoff: leagueSettings.uses_playoff === '1',
        playoff_start_week: leagueSettings.playoff_start_week || '',
        uses_playoff_reseeding: leagueSettings.uses_playoff_reseeding === '1',
        uses_lock_eliminated_teams: leagueSettings.uses_lock_eliminated_teams === '1',
        num_playoff_teams: leagueSettings.num_playoff_teams || '',
        has_playoff_consolation_games: leagueSettings.has_playoff_consolation_games === '1'
      }
    }
    
    // Return the combined data
    return {
      details: {
        ...leagueDetails,
        settings
      },
      standings: {
        teams
      }
    }
    
  } catch (error) {
    console.error('Error fetching league details:', error)
    throw error
  }
}

/**
 * Clears Yahoo tokens from Firestore for the current user
 */
export const clearYahooTokens = async (): Promise<boolean> => {
  console.log('Attempting to clear Yahoo tokens...')
  
  const currentUser = auth.currentUser
  
  if (!currentUser) {
    console.error('No user logged in when trying to clear Yahoo tokens')
    throw new Error('User must be logged in to clear Yahoo tokens')
  }
  
  try {
    // Get the auth token
    const authToken = await getAuthToken()
    if (!authToken) {
      throw new Error('Failed to get authentication token')
    }
    
    // Call the API to clear tokens
    const response = await fetch('/api/auth/yahoo/clear-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: currentUser.uid
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to clear tokens')
    }
    
    console.log('Yahoo tokens successfully cleared')
    return true
  } catch (error) {
    console.error('Error clearing Yahoo tokens:', error)
    throw error
  }
}

/**
 * Generates a random string for OAuth state parameter
 */
const generateRandomString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  
  return result
}

// Define interfaces for Yahoo API responses
interface YahooGamesResponse {
  games?: Array<{
    game_key: string;
    game_id: string;
    name: string;
    code: string;
    season: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

interface YahooLeaguesResponse {
  games?: Array<{
    game_key: string;
    game_id: string;
    name: string;
    code: string;
    season: string;
    leagues?: Array<{
      league_id: string;
      name: string;
      league_key: string;
      num_teams: number;
      is_finished: number;
      [key: string]: any;
    }>;
    [key: string]: any;
  }>;
  [key: string]: any;
} 