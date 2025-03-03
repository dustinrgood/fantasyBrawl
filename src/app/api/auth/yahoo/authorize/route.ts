import { NextRequest, NextResponse } from 'next/server'

// Yahoo OAuth configuration
const YAHOO_CLIENT_ID = process.env.NEXT_PUBLIC_YAHOO_CLIENT_ID
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/yahoo/callback`
  : 'https://localhost:3001/api/auth/yahoo/callback'

// Generate a random string for state parameter
function generateRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

/**
 * Initiates the Yahoo OAuth flow
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { userId } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    if (!YAHOO_CLIENT_ID) {
      console.error('Yahoo Client ID not configured')
      return NextResponse.json(
        { error: 'Yahoo Client ID not configured' },
        { status: 500 }
      )
    }
    
    // Generate state parameter
    const state = generateRandomString(32)
    
    // Store state and user ID in a cookie for verification
    const stateData = JSON.stringify({ state, userId })
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 10, // 10 minutes
      path: '/'
    }
    
    // Build the authorization URL
    const authUrl = new URL('https://api.login.yahoo.com/oauth2/request_auth')
    authUrl.searchParams.append('client_id', YAHOO_CLIENT_ID)
    
    // Ensure we're using HTTPS for the redirect URI
    let redirectUri = REDIRECT_URI
    if (redirectUri.startsWith('http://')) {
      redirectUri = redirectUri.replace('http://', 'https://')
    }
    
    // Add required parameters
    authUrl.searchParams.append('redirect_uri', redirectUri)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('state', state)
    
    // Request write access (fspt-w) which includes read access
    authUrl.searchParams.append('scope', 'fspt-w')
    
    // Add language parameter
    authUrl.searchParams.append('language', 'en-us')
    
    console.log('Initiating Yahoo auth with parameters:')
    console.log('- Client ID:', YAHOO_CLIENT_ID.substring(0, 10) + '...')
    console.log('- Redirect URI:', redirectUri)
    console.log('- State:', state.substring(0, 5) + '...')
    console.log('- User ID:', userId)
    
    // Return the authorization URL
    const response = NextResponse.json({
      success: true,
      authUrl: authUrl.toString()
    })
    
    // Set the cookie with state data
    response.cookies.set('yahoo_oauth_state', stateData, cookieOptions)
    
    return response
  } catch (error) {
    console.error('Error initiating Yahoo authorization:', error)
    
    return NextResponse.json(
      { error: 'Failed to initiate Yahoo authorization' },
      { status: 500 }
    )
  }
} 