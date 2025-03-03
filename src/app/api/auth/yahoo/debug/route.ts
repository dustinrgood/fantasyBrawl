import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { Agent } from 'https'

// Create a custom agent that ignores SSL certificate errors in development
const isDev = process.env.NODE_ENV === 'development'
const httpsAgent = isDev ? new Agent({ rejectUnauthorized: false }) : undefined

/**
 * Helper function to check if it's currently the NFL offseason
 */
function isNflOffseason(): boolean {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1 // JavaScript months are 0-indexed
  
  // NFL offseason is roughly February (2) to August (8)
  return currentMonth >= 2 && currentMonth <= 8
}

/**
 * This route provides debug information about Yahoo authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the query parameters
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    console.log(`Fetching Yahoo debug info for user: ${userId}`)
    
    // Get the tokens
    const tokensUrl = new URL('/api/auth/yahoo/get-tokens', request.nextUrl.origin)
    tokensUrl.searchParams.append('userId', userId)
    
    const tokensResponse = await axios.get(tokensUrl.toString(), {
      httpsAgent,
      timeout: 10000
    })
    
    if (tokensResponse.status !== 200 || !tokensResponse.data.tokens) {
      return NextResponse.json({
        isConnected: false,
        error: 'No Yahoo tokens found'
      })
    }
    
    const tokens = tokensResponse.data.tokens
    console.log('Debug route received tokens:', {
      keys: Object.keys(tokens),
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      hasExpiresAt: !!tokens.expiresAt,
      hasAccess_Token: !!tokens.access_token,
      hasRefresh_Token: !!tokens.refresh_token,
      hasExpires_At: !!tokens.expires_at,
      tokenType: typeof tokens
    })
    
    // Handle both token formats (camelCase and snake_case)
    const accessToken = tokens.access_token || tokens.accessToken
    const refreshToken = tokens.refresh_token || tokens.refreshToken
    const expiresAt = tokens.expires_at || tokens.expiresAt
    
    // Check if tokens are expired
    const isExpired = expiresAt ? new Date(expiresAt) <= new Date() : true
    
    // Prepare the debug info
    const debugInfo: {
      isConnected: boolean;
      tokens: {
        accessTokenPrefix: string;
        refreshTokenPrefix: string;
        expiresAt: string | number;
        isExpired: boolean;
        raw?: any;
      };
      games?: Array<{
        id: string;
        key: string;
        name: string;
        code: string;
        season: string;
        isActive: boolean;
      }>;
      error?: string;
    } = {
      isConnected: !!accessToken && !!refreshToken,
      tokens: {
        accessTokenPrefix: accessToken ? accessToken.substring(0, 10) + '...' : 'undefined',
        refreshTokenPrefix: refreshToken ? refreshToken.substring(0, 10) + '...' : 'undefined',
        expiresAt: expiresAt || 'undefined',
        isExpired,
        raw: {
          keys: Object.keys(tokens),
          hasAccessToken: !!tokens.accessToken,
          hasRefreshToken: !!tokens.refreshToken,
          hasExpiresAt: !!tokens.expiresAt,
          hasAccess_Token: !!tokens.access_token,
          hasRefresh_Token: !!tokens.refresh_token,
          hasExpires_At: !!tokens.expires_at
        }
      }
    }
    
    // If tokens are not expired, try to fetch games
    if (!isExpired) {
      try {
        // Make a request to the Yahoo API to get games
        const proxyUrl = new URL('/api/yahoo/proxy', request.nextUrl.origin)
        const proxyResponse = await axios.post(
          proxyUrl.toString(),
          {
            userId,
            endpoint: 'users;use_login=1/games'
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            httpsAgent,
            timeout: 10000
          }
        )
        
        if (proxyResponse.status === 200 && proxyResponse.data.fantasy_content) {
          const fantasyContent = proxyResponse.data.fantasy_content
          const games = []
          
          // Extract games from the response
          if (fantasyContent.users?.[0]?.user?.[1]?.games) {
            const gamesData = fantasyContent.users[0].user[1].games
            
            // Yahoo API returns games as an object with numeric keys and a 'count' property
            for (const key in gamesData) {
              if (key !== 'count' && !isNaN(parseInt(key))) {
                const game = gamesData[key].game[0]
                games.push({
                  id: game.game_id,
                  key: game.game_key,
                  name: game.name,
                  code: game.code,
                  season: game.season,
                  isActive: game.is_registration_over === 0
                })
              }
            }
          }
          
          debugInfo.games = games
        }
      } catch (error) {
        console.error('Error fetching Yahoo games:', error)
        // Don't fail the entire request if games fetch fails
      }
    }
    
    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error('Error in Yahoo debug route:', error)
    
    return NextResponse.json(
      { 
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 