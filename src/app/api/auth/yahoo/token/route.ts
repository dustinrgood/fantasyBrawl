import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Agent } from 'https'

// Yahoo OAuth configuration
const YAHOO_CLIENT_ID = process.env.NEXT_PUBLIC_YAHOO_CLIENT_ID
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/yahoo/callback`
  : 'https://localhost:3000/api/auth/yahoo/callback'

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
 * This route exchanges the authorization code for access and refresh tokens
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Token exchange request received')
    
    // Get the authorization code from the cookie
    const cookieStore = cookies()
    const code = cookieStore.get('yahoo_auth_code')?.value
    
    if (!code) {
      console.error('No authorization code found in cookie')
      return NextResponse.json(
        { error: 'No authorization code found' },
        { status: 400 }
      )
    }
    
    console.log('Retrieved authorization code from cookie')
    
    // Prepare the token request
    const tokenRequestBody = new URLSearchParams()
    tokenRequestBody.append('grant_type', 'authorization_code')
    tokenRequestBody.append('code', code)
    tokenRequestBody.append('redirect_uri', REDIRECT_URI)
    tokenRequestBody.append('client_id', YAHOO_CLIENT_ID || '')
    tokenRequestBody.append('client_secret', YAHOO_CLIENT_SECRET || '')
    
    console.log(`Using secure redirect URI: ${REDIRECT_URI}`)
    console.log(`Client ID (partial): ${YAHOO_CLIENT_ID?.substring(0, 10)}...`)
    
    // Make the token request
    console.log('Sending token request to Yahoo')
    const tokenResponse = await fetchWithSslDisabled('https://api.login.yahoo.com/oauth2/get_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody.toString(),
    })
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', tokenResponse.status, tokenResponse.statusText, errorText)
      
      return NextResponse.json(
        { error: `Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}` },
        { status: tokenResponse.status }
      )
    }
    
    // Parse the token response
    const tokenData = await tokenResponse.json()
    console.log('Token exchange successful')
    
    // Clear the authorization code cookie
    cookieStore.delete('yahoo_auth_code')
    cookieStore.delete('yahoo_auth_state')
    
    // Return the tokens
    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    })
  } catch (error) {
    console.error('Error in token exchange:', error)
    
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    )
  }
} 