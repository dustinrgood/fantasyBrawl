import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { Agent } from 'https'

// Create a custom agent that ignores SSL certificate errors in development
const isDev = process.env.NODE_ENV === 'development'
const httpsAgent = isDev ? new Agent({ rejectUnauthorized: false }) : undefined

/**
 * This route proxies requests to the Yahoo Fantasy API
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { userId, endpoint, params } = body
    
    if (!userId) {
      console.error('Missing userId in Yahoo proxy request')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    if (!endpoint) {
      console.error('Missing endpoint in Yahoo proxy request')
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      )
    }
    
    console.log(`Proxying request to Yahoo API: ${endpoint}`)
    console.log(`User ID: ${userId}`)
    
    // Get the tokens
    const tokensUrl = new URL('/api/auth/yahoo/get-tokens', request.nextUrl.origin)
    tokensUrl.searchParams.append('userId', userId)
    
    console.log(`Fetching tokens from: ${tokensUrl.toString()}`)
    
    const tokensResponse = await axios.get(tokensUrl.toString(), {
      httpsAgent,
      timeout: 10000
    })
    
    if (tokensResponse.status !== 200 || !tokensResponse.data.tokens) {
      console.error('Failed to get Yahoo tokens:', tokensResponse.data)
      return NextResponse.json(
        { error: 'Failed to get Yahoo tokens' },
        { status: 401 }
      )
    }
    
    let tokens = tokensResponse.data.tokens
    
    // Check if tokens are expired
    const expiresAt = new Date(tokens.expiresAt || tokens.expires_at)
    const isExpired = expiresAt <= new Date()
    
    if (isExpired) {
      console.log('Yahoo tokens are expired, refreshing...')
      // Refresh the tokens
      const refreshUrl = new URL('/api/auth/yahoo/refresh-token', request.nextUrl.origin)
      
      try {
        const refreshResponse = await axios.post(
          refreshUrl.toString(),
          { userId },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            httpsAgent,
            timeout: 10000
          }
        )
        
        if (refreshResponse.status !== 200) {
          console.error('Failed to refresh Yahoo tokens:', refreshResponse.data)
          return NextResponse.json(
            { error: 'Failed to refresh Yahoo tokens' },
            { status: 401 }
          )
        }
        
        console.log('Yahoo tokens refreshed successfully')
        
        // Get the new tokens
        const newTokensResponse = await axios.get(tokensUrl.toString(), {
          httpsAgent,
          timeout: 10000
        })
        
        if (newTokensResponse.status !== 200 || !newTokensResponse.data.tokens) {
          console.error('Failed to get refreshed Yahoo tokens:', newTokensResponse.data)
          return NextResponse.json(
            { error: 'Failed to get refreshed Yahoo tokens' },
            { status: 401 }
          )
        }
        
        tokens = newTokensResponse.data.tokens
      } catch (refreshError) {
        console.error('Error refreshing Yahoo tokens:', refreshError)
        return NextResponse.json(
          { error: 'Failed to refresh Yahoo tokens' },
          { status: 401 }
        )
      }
    }
    
    // Build the Yahoo API URL
    const yahooApiUrl = new URL(`https://fantasysports.yahooapis.com/fantasy/v2/${endpoint}`)
    
    // Add format parameter if not already in params
    if (!params || !params.format) {
      yahooApiUrl.searchParams.append('format', 'json')
    }
    
    // Add any additional parameters
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          yahooApiUrl.searchParams.append(key, value as string)
        }
      }
    }
    
    console.log(`Making request to Yahoo API: ${yahooApiUrl.toString()}`)
    
    // Get the access token, handling both formats
    const accessToken = tokens.accessToken || tokens.access_token;

    if (!accessToken) {
      console.error('No access token found in tokens:', tokens);
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401 }
      );
    }
    
    // Make the request to Yahoo API
    try {
      const yahooResponse = await axios.get(yahooApiUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        httpsAgent,
        timeout: 15000
      })
      
      // Return the Yahoo API response
      return NextResponse.json(yahooResponse.data)
    } catch (yahooError: any) {
      console.error('Error from Yahoo API:', yahooError.message)
      if (yahooError.response) {
        console.error('Yahoo API response status:', yahooError.response.status)
        console.error('Yahoo API response data:', yahooError.response.data)
        
        return NextResponse.json(
          { error: `Yahoo API error: ${yahooError.response.status}`, details: yahooError.response.data },
          { status: yahooError.response.status }
        )
      }
      
      return NextResponse.json(
        { error: `Yahoo API error: ${yahooError.message}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error proxying request to Yahoo API:', error)
    
    // Check for specific axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500
      const message = error.response?.data?.error || error.message
      
      return NextResponse.json(
        { error: message },
        { status }
      )
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 