import { NextResponse } from 'next/server'
import axios from 'axios'

// NBA Game Key for the current season (2023-2024)
// This changes each season - check Yahoo Fantasy API docs for the latest
const NBA_GAME_KEY = '418' // This is for the 2023-2024 NBA season

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = searchParams.get('limit') || '10'
    
    // Get the origin with protocol
    const origin = new URL(request.url).origin

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    console.log(`Fetching NBA public leagues for user: ${userId}`)
    
    // Fix: Use a fully qualified URL with protocol, host, and path
    // This was causing the "Invalid URL" error
    const tokensUrl = `${origin}/api/auth/yahoo/get-tokens?userId=${userId}`
    console.log(`Fetching tokens from: ${tokensUrl}`)
    
    try {
      const tokensResponse = await fetch(tokensUrl)
      
      if (!tokensResponse.ok) {
        console.error('Failed to get Yahoo tokens:', await tokensResponse.text())
        return NextResponse.json(
          { error: 'Failed to get Yahoo tokens' },
          { status: tokensResponse.status }
        )
      }
      
      const { tokens } = await tokensResponse.json()
      
      if (!tokens) {
        console.error('No Yahoo tokens found for user:', userId)
        return NextResponse.json(
          { error: 'No Yahoo tokens found' },
          { status: 401 }
        )
      }

      console.log('Token structure:', {
        keys: Object.keys(tokens),
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        hasExpiresAt: !!tokens.expiresAt,
        hasAccess_Token: !!tokens.access_token,
        hasRefresh_Token: !!tokens.refresh_token,
        hasExpires_At: !!tokens.expires_at,
      })
      
      // Get the access token (handle both formats)
      const accessToken = tokens.access_token || tokens.accessToken
      
      if (!accessToken) {
        console.error('No valid access token found in tokens object')
        return NextResponse.json(
          { error: 'No valid access token found' },
          { status: 401 }
        )
      }
      
      // Check if token is expired
      const expiresAtStr = tokens.expires_at || tokens.expiresAt
      // Ignore the isExpired flag from the token object and calculate it directly
      const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null
      
      // IMPORTANT: The Yahoo debug page shows isExpired: true but the expiration date is in the future
      // This is a mismatch in the Yahoo API. We'll ignore the isExpired flag and use the date comparison
      const currentDate = new Date()
      const isExpired = expiresAt ? expiresAt <= currentDate : true
      
      console.log('Token expiration check:', {
        expiresAtStr,
        expiresAtDate: expiresAt ? expiresAt.toLocaleString() : 'undefined',
        currentDate: currentDate.toLocaleString(),
        isExpired,
        // Log the raw token expiration flag for debugging
        rawIsExpired: tokens.isExpired
      })
      
      if (isExpired) {
        console.log('Token is expired, refreshing...')
        
        // Refresh the token - use fully qualified URL
        const refreshUrl = `${origin}/api/auth/yahoo/refresh-token`
        console.log(`Refreshing token using: ${refreshUrl}`)
        
        const refreshResponse = await fetch(refreshUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            refreshToken: tokens.refresh_token || tokens.refreshToken,
          }),
        })
        
        if (!refreshResponse.ok) {
          console.error('Failed to refresh token:', await refreshResponse.text())
          return NextResponse.json(
            { error: 'Failed to refresh Yahoo token. Please reconnect your Yahoo account.' },
            { status: 401 }
          )
        }
        
        const refreshData = await refreshResponse.json()
        
        if (!refreshData.tokens || !(refreshData.tokens.access_token || refreshData.tokens.accessToken)) {
          console.error('No valid tokens returned after refresh')
          return NextResponse.json(
            { error: 'Failed to refresh Yahoo token. Please reconnect your Yahoo account.' },
            { status: 401 }
          )
        }
        
        // Use the new access token
        const newAccessToken = refreshData.tokens.access_token || refreshData.tokens.accessToken
        
        // Return mock data instead of trying to fetch from Yahoo API
        // This will allow UI testing while we figure out the correct API approach
        const mockLeagues = getMockLeagues()
        return NextResponse.json({ leagues: mockLeagues })
      }
      
      // Return mock data instead of trying to fetch from Yahoo API
      const mockLeagues = getMockLeagues()
      return NextResponse.json({ leagues: mockLeagues })
      
    } catch (error) {
      console.error('Error fetching or refreshing tokens:', error)
      return NextResponse.json(
        { error: 'Failed to authenticate with Yahoo' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching NBA public leagues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch NBA public leagues' },
      { status: 500 }
    )
  }
}

// Function to return mock leagues data
function getMockLeagues() {
  console.log('Returning mock leagues data for UI testing');
  
  return [
    {
      id: '12345',
      yahooLeagueKey: 'nba.l.12345',
      yahooLeagueId: '12345',
      name: 'NBA Public League 1',
      description: 'A competitive NBA fantasy league for the 2023-2024 season',
      sport: 'basketball',
      season: '2023-2024',
      logoUrl: 'https://s.yimg.com/cv/apiv2/default/nba/nba_2.png',
      scoringSystem: {
        type: 'head',
        description: 'Head-to-Head'
      },
      isPublic: true,
      createdAt: new Date().toISOString(),
      numTeams: 12,
      draftStatus: 'completed',
      managerIds: ['user1', 'user2', 'user3'],
      commissioner: {
        name: 'Yahoo Fantasy',
        email: null,
        teamId: 'team1'
      }
    },
    {
      id: '67890',
      yahooLeagueKey: 'nba.l.67890',
      yahooLeagueId: '67890',
      name: 'NBA Public League 2',
      description: 'A rotisserie scoring NBA fantasy league for casual players',
      sport: 'basketball',
      season: '2023-2024',
      logoUrl: 'https://s.yimg.com/cv/apiv2/default/nba/nba_1.png',
      scoringSystem: {
        type: 'roto',
        description: 'Rotisserie'
      },
      isPublic: true,
      createdAt: new Date().toISOString(),
      numTeams: 10,
      draftStatus: 'completed',
      managerIds: ['user4', 'user5', 'user6'],
      commissioner: {
        name: 'Yahoo Fantasy',
        email: null,
        teamId: 'team2'
      }
    }
  ];
}

// This function is kept for reference but not used anymore
async function fetchYahooPublicLeagues(accessToken: string, limit: number = 10) {
  console.log('Fetching Yahoo public leagues...');
  
  try {
    // According to Yahoo API documentation, we need to use the league directory endpoint
    // This endpoint returns public leagues for a specific game
    const url = 'https://fantasysports.yahooapis.com/fantasy/v2/league/nba.l.12345?format=json';
    
    console.log(`Making request to Yahoo Fantasy API: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    console.log(`Yahoo API response status: ${response.status}`);
    
    // For debugging purposes, log the error response if status is not 200
    if (response.status !== 200) {
      console.error('Error response from Yahoo API:', response.data);
      throw new Error(`Failed to fetch leagues: ${response.status} ${response.statusText}`);
    }
    
    // Log the response data structure for debugging
    console.log('Response data structure:', Object.keys(response.data));
    
    // Since we can't get public leagues directly, let's return a mock response for now
    // This will allow us to test the UI while we figure out the correct API approach
    return getMockLeagues();
    
  } catch (error: unknown) {
    // Log the full error for debugging
    console.error('Error fetching Yahoo public leagues:', error);
    
    // Check if it's an axios error with a response
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
}

// Function to fetch commissioner information for a league
async function fetchLeagueCommissioner(accessToken: string, leagueKey: string) {
  try {
    // Yahoo Fantasy API endpoint for league settings (includes commissioner)
    const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/settings?format=json`
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    
    // Extract commissioner data from the response
    const commissionerTeamId = response.data?.fantasy_content?.league?.[0]?.settings?.[0]?.commissioner_team_id
    
    if (!commissionerTeamId) {
      return null
    }
    
    // Now fetch the team info to get the manager
    const teamUrl = `https://fantasysports.yahooapis.com/fantasy/v2/team/${leagueKey}.t.${commissionerTeamId}/metadata?format=json`
    
    const teamResponse = await axios.get(teamUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    
    const managerData = teamResponse.data?.fantasy_content?.team?.[0]?.[0]?.managers?.[0]?.manager
    
    if (!managerData) {
      return null
    }
    
    return {
      name: managerData.nickname || 'Unknown',
      email: managerData.email || null,
      teamId: commissionerTeamId
    }
  } catch (error) {
    console.error('Error fetching commissioner info:', error)
    return null
  }
} 