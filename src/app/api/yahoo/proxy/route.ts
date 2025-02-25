import { NextRequest, NextResponse } from 'next/server'
import { Agent } from 'https'
import axios, { AxiosError } from 'axios'

const YAHOO_API_BASE_URL = 'https://fantasysports.yahooapis.com/fantasy/v2'

// Create a custom agent that ignores SSL certificate errors in development
const isDev = process.env.NODE_ENV === 'development'

// Create a global HTTPS agent for development that ignores certificate errors
const httpsAgent = isDev ? new Agent({ rejectUnauthorized: false }) : undefined

// Set global axios defaults for development
if (isDev && typeof process !== 'undefined') {
  // This is a more reliable way to disable certificate validation for axios
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  // Set global axios defaults
  axios.defaults.httpsAgent = httpsAgent;
}

/**
 * This route acts as a proxy for Yahoo Fantasy API requests
 * It handles authentication and CORS issues by making the request from the server
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { endpoint, userId } = body
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      )
    }
    
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          needsAuth: true 
        },
        { status: 401 }
      )
    }
    
    console.log(`Proxying request to Yahoo API: ${endpoint}`)
    console.log(`User ID: ${userId}`)
    
    // Get tokens using axios instead of fetch
    const tokenUrl = new URL(`/api/auth/yahoo/get-tokens?userId=${userId}`, request.url).toString()
    console.log(`Fetching tokens from: ${tokenUrl}`)
    
    try {
      const tokenResponse = await axios.get(tokenUrl, {
        httpsAgent,
        // Add timeout to prevent hanging requests
        timeout: 10000
      })
      
      if (tokenResponse.status !== 200) {
        console.error('Error getting Yahoo tokens:', tokenResponse.data)
        return NextResponse.json(
          { error: 'Failed to get Yahoo tokens' },
          { status: 500 }
        )
      }
      
      const tokenData = tokenResponse.data
      
      if (!tokenData.found) {
        console.error('No Yahoo tokens found in proxy request')
        console.error(`User ${userId} has no Yahoo tokens`)
        return NextResponse.json(
          { 
            error: 'No Yahoo tokens found. Please authenticate with Yahoo first.',
            needsYahooAuth: true,
            userId
          },
          { status: 401 }
        )
      }
      
      const tokens = tokenData.tokens
      
      console.log('Yahoo tokens found:', {
        accessTokenPrefix: tokens.access_token.substring(0, 10) + '...',
        refreshTokenPrefix: tokens.refresh_token.substring(0, 10) + '...',
        expiresAt: new Date(tokens.expires_at).toLocaleString(),
        isExpired: tokens.expires_at < Date.now()
      })
      
      // Only refresh tokens if they're expired or about to expire (within 5 minutes)
      const isExpired = tokens.expires_at < Date.now();
      const isAboutToExpire = tokens.expires_at < (Date.now() + 5 * 60 * 1000);

      if (isExpired || isAboutToExpire) {
        console.log('Tokens expired or about to expire, refreshing...')
        try {
          // Basic auth for Yahoo OAuth
          const YAHOO_CLIENT_ID = process.env.NEXT_PUBLIC_YAHOO_CLIENT_ID
          const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET
          
          if (!YAHOO_CLIENT_ID || !YAHOO_CLIENT_SECRET) {
            throw new Error('Yahoo client credentials not configured')
          }
          
          // Prepare the refresh token request
          const tokenRequestBody = new URLSearchParams()
          tokenRequestBody.append('grant_type', 'refresh_token')
          tokenRequestBody.append('refresh_token', tokens.refresh_token)
          tokenRequestBody.append('client_id', YAHOO_CLIENT_ID)
          tokenRequestBody.append('client_secret', YAHOO_CLIENT_SECRET)
          
          // Make the refresh token request using axios
          const refreshResponse = await axios.post(
            'https://api.login.yahoo.com/oauth2/get_token', 
            tokenRequestBody.toString(),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              httpsAgent,
              timeout: 10000
            }
          )
          
          if (refreshResponse.status !== 200) {
            throw new Error(`Failed to refresh token: ${refreshResponse.status} ${refreshResponse.statusText}`)
          }
          
          const refreshData = refreshResponse.data
          
          // Update tokens
          tokens.access_token = refreshData.access_token
          tokens.refresh_token = refreshData.refresh_token
          tokens.expires_at = Date.now() + refreshData.expires_in * 1000
          
          // Store the refreshed tokens using axios
          const storeUrl = new URL('/api/auth/yahoo/store-tokens', request.url).toString()
          const storeResponse = await axios.post(
            storeUrl, 
            {
              userId,
              tokens
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
              httpsAgent,
              timeout: 10000
            }
          )
          
          if (storeResponse.status !== 200) {
            console.error('Failed to store refreshed tokens:', storeResponse.data)
          }
          
          console.log('Tokens refreshed successfully')
        } catch (refreshError) {
          console.error('Error refreshing tokens:', refreshError)
          // Continue with the existing token and hope for the best
        }
      }
      
      // Make the request to Yahoo API using axios
      const url = `${YAHOO_API_BASE_URL}/${endpoint}?format=json`
      console.log(`Making request to Yahoo API: ${url}`)
      
      try {
        const yahooResponse = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
          httpsAgent,
          timeout: 15000
        })
        
        if (yahooResponse.status !== 200) {
          console.error(`Yahoo API request failed: ${yahooResponse.status} ${yahooResponse.statusText}`)
          
          // If unauthorized, the token might be invalid
          if (yahooResponse.status === 401) {
            return NextResponse.json(
              { 
                error: 'Yahoo API authentication failed. Please reconnect your Yahoo account.',
                needsYahooReauth: true 
              },
              { status: 401 }
            )
          }
          
          return NextResponse.json(
            { error: `Yahoo API request failed: ${yahooResponse.status} ${yahooResponse.statusText}` },
            { status: yahooResponse.status }
          )
        }
        
        const yahooData = yahooResponse.data
        
        return NextResponse.json(yahooData)
      } catch (error) {
        const yahooError = error as AxiosError
        console.error('Error making Yahoo API request:', yahooError)
        return NextResponse.json(
          { error: 'Failed to fetch data from Yahoo API', details: yahooError.message },
          { status: 500 }
        )
      }
    } catch (error) {
      const tokenError = error as AxiosError
      console.error('Error fetching tokens:', tokenError)
      return NextResponse.json(
        { error: 'Failed to fetch Yahoo tokens', details: tokenError.message },
        { status: 500 }
      )
    }
  } catch (error) {
    const proxyError = error as Error
    console.error('Error in Yahoo proxy:', proxyError)
    
    return NextResponse.json(
      { error: 'Internal server error in Yahoo proxy', details: proxyError.message },
      { status: 500 }
    )
  }
} 