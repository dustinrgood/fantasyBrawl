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
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    if (!endpoint) {
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
      return NextResponse.json(
        { error: 'Failed to get Yahoo tokens' },
        { status: 401 }
      )
    }
    
    let tokens = tokensResponse.data.tokens
    
    // Check if tokens are expired
    const expiresAt = new Date(tokens.expiresAt)
    const isExpired = expiresAt <= new Date()
    
    if (isExpired) {
      // Refresh the tokens
      const refreshUrl = new URL('/api/auth/yahoo/refresh-tokens', request.nextUrl.origin)
      
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
        return NextResponse.json(
          { error: 'Failed to refresh Yahoo tokens' },
          { status: 401 }
        )
      }
      
      // Get the new tokens
      const newTokensResponse = await axios.get(tokensUrl.toString(), {
        httpsAgent,
        timeout: 10000
      })
      
      if (newTokensResponse.status !== 200 || !newTokensResponse.data.tokens) {
        return NextResponse.json(
          { error: 'Failed to get refreshed Yahoo tokens' },
          { status: 401 }
        )
      }
      
      tokens = newTokensResponse.data.tokens
    }
    
    // Build the Yahoo API URL
    const yahooApiUrl = new URL(`https://fantasysports.yahooapis.com/fantasy/v2/${endpoint}`)
    
    // Add format parameter
    yahooApiUrl.searchParams.append('format', 'json')
    
    // Add any additional parameters
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        yahooApiUrl.searchParams.append(key, value as string)
      }
    }
    
    console.log(`Making request to Yahoo API: ${yahooApiUrl.toString()}`)
    
    // Make the request to Yahoo API
    const yahooResponse = await axios.get(yahooApiUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${tokens.accessToken || ''}`,
        'Content-Type': 'application/json'
      },
      httpsAgent,
      timeout: 15000
    })
    
    if (yahooResponse.status !== 200) {
      return NextResponse.json(
        { error: 'Failed to fetch data from Yahoo API' },
        { status: yahooResponse.status }
      )
    }
    
    // Return the Yahoo API response
    return NextResponse.json(yahooResponse.data)
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