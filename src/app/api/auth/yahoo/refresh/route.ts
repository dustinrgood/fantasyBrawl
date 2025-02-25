import { NextRequest, NextResponse } from 'next/server'
import { Agent } from 'https'

// Yahoo OAuth configuration
const YAHOO_CLIENT_ID = process.env.NEXT_PUBLIC_YAHOO_CLIENT_ID
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET

// Yahoo token endpoint
const YAHOO_TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token'

// Create a custom agent that ignores SSL certificate errors in development
const isDev = process.env.NODE_ENV === 'development'
const fetchWithSslDisabled = (url: string, options: RequestInit = {}) => {
  if (isDev) {
    // @ts-ignore - Node.js specific property
    options.agent = new Agent({ rejectUnauthorized: false });
  }
  return fetch(url, options);
};

/**
 * This route refreshes the Yahoo access token using the refresh token
 * It should be called when the access token is expired or about to expire
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refresh_token } = body

    console.log('Token refresh request received')
    console.log('Refresh token (first 10 chars):', refresh_token ? refresh_token.substring(0, 10) + '...' : 'missing')

    if (!refresh_token) {
      console.error('No refresh token provided in request')
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    if (!YAHOO_CLIENT_ID || !YAHOO_CLIENT_SECRET) {
      console.error('Missing Yahoo credentials:', { 
        clientId: YAHOO_CLIENT_ID ? 'present' : 'missing', 
        clientSecret: YAHOO_CLIENT_SECRET ? 'present' : 'missing' 
      })
      return NextResponse.json(
        { error: 'Yahoo API credentials are not configured' },
        { status: 500 }
      )
    }

    // Basic auth for Yahoo OAuth
    const basicAuth = Buffer.from(`${YAHOO_CLIENT_ID}:${YAHOO_CLIENT_SECRET}`).toString('base64')

    console.log('Refreshing token with Yahoo API')
    console.log('Using client ID:', YAHOO_CLIENT_ID ? YAHOO_CLIENT_ID.substring(0, 10) + '...' : 'missing')

    try {
      // Exchange refresh token for new access token using fetch instead of axios
      const response = await fetchWithSslDisabled(YAHOO_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token,
        }).toString(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Yahoo API error during token refresh:', response.status, response.statusText)
        console.error('Yahoo API error details:', errorData)
        
        // Check if it's an invalid refresh token error
        if (errorData?.error === 'invalid_grant') {
          return NextResponse.json(
            { 
              error: 'Invalid refresh token. You may need to reconnect to Yahoo.',
              details: errorData
            },
            { status: 400 }
          )
        }
        
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Token refresh successful')
      console.log('New access token (first 10 chars):', data.access_token.substring(0, 10) + '...')
      console.log('New refresh token (first 10 chars):', data.refresh_token.substring(0, 10) + '...')
      console.log('Token expires in:', data.expires_in, 'seconds')

      // Return the new tokens to the client
      return NextResponse.json({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      })
    } catch (yahooError: any) {
      console.error('Error during Yahoo token refresh:', yahooError)
      throw yahooError
    }
  } catch (error: any) {
    console.error('Error refreshing token:', error.message)
    
    return NextResponse.json(
      { 
        error: 'Failed to refresh token',
        details: error.message
      },
      { status: 500 }
    )
  }
} 