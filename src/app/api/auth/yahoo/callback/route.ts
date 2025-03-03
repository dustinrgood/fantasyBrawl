import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// Yahoo OAuth configuration
const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET
const YAHOO_REDIRECT_URI = process.env.YAHOO_REDIRECT_URI || 'https://localhost:3001/api/auth/yahoo/callback'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code and state from the query parameters
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for errors in the callback
    if (error) {
      console.error(`Yahoo OAuth error: ${error}`)
      return NextResponse.redirect(new URL('/leagues/yahoo-picker?error=auth_failed', request.url))
    }

    // Validate required parameters
    if (!code) {
      console.error('Missing authorization code in callback')
      return NextResponse.redirect(new URL('/leagues/yahoo-picker?error=missing_code', request.url))
    }

    if (!state) {
      console.error('Missing state parameter in callback')
      return NextResponse.redirect(new URL('/leagues/yahoo-picker?error=missing_state', request.url))
    }

    // In a real implementation, you would verify the state parameter
    // against the one stored in your database or cache
    console.log(`Received state: ${state}`)

    // Check if Yahoo client credentials are configured
    if (!YAHOO_CLIENT_ID || !YAHOO_CLIENT_SECRET) {
      console.error('Yahoo client credentials not configured')
      return NextResponse.redirect(new URL('/leagues/yahoo-picker?error=config_error', request.url))
    }

    // Exchange the authorization code for tokens
    const tokenRequestBody = new URLSearchParams()
    tokenRequestBody.append('grant_type', 'authorization_code')
    tokenRequestBody.append('code', code)
    tokenRequestBody.append('redirect_uri', YAHOO_REDIRECT_URI)
    tokenRequestBody.append('client_id', YAHOO_CLIENT_ID)
    tokenRequestBody.append('client_secret', YAHOO_CLIENT_SECRET)

    // Make the token request
    const tokenResponse = await axios.post(
      'https://api.login.yahoo.com/oauth2/get_token',
      tokenRequestBody.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    if (tokenResponse.status !== 200) {
      console.error('Failed to exchange code for tokens:', tokenResponse.status, tokenResponse.statusText)
      return NextResponse.redirect(new URL('/leagues/yahoo-picker?error=token_error', request.url))
    }

    // Extract the tokens
    const tokenData = tokenResponse.data
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    }

    // In a real implementation, you would:
    // 1. Extract the user ID from the state parameter or from the token
    // 2. Store the tokens in your database for the user
    console.log('Successfully obtained Yahoo tokens')

    // For now, we'll redirect to a page where the user can manually store their tokens
    const redirectUrl = new URL('/leagues/yahoo-picker?success=true', request.url)
    
    // In a real implementation, you would not pass tokens in the URL
    // This is just for demonstration purposes
    redirectUrl.searchParams.append('tokens', JSON.stringify(tokens))
    
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Error handling Yahoo OAuth callback:', error)
    return NextResponse.redirect(new URL('/leagues/yahoo-picker?error=server_error', request.url))
  }
} 