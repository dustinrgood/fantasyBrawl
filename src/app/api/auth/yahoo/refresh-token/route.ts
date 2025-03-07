/**
 * API route to refresh Yahoo OAuth tokens
 * Standardized version that handles all token formats and updates Firestore
 */
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

// Yahoo OAuth refresh endpoint
const YAHOO_REFRESH_URL = 'https://api.login.yahoo.com/oauth2/get_token'
const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    // Validate required parameters
    if (!userId) {
      console.error('Missing userId in request body')
      return NextResponse.json(
        { error: 'Missing userId in request body' },
        { status: 400 }
      )
    }

    console.log(`Refreshing Yahoo tokens for user: ${userId}`)

    // Check if user exists in Firestore
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      console.error(`User document not found for userId: ${userId}`)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get the current tokens
    const userData = userDoc.data();
    if (!userData.yahooTokens) {
      console.error(`No Yahoo tokens found for user: ${userId}`)
      return NextResponse.json(
        { error: 'No Yahoo tokens found' },
        { status: 404 }
      )
    }

    // Get the refresh token, handling both formats
    const refreshToken = userData.yahooTokens.refreshToken || userData.yahooTokens.refresh_token;
    
    if (!refreshToken) {
      console.error('No refresh token found in user data')
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 400 }
      )
    }

    // Create Basic Auth header with client ID and secret
    const authString = `${YAHOO_CLIENT_ID}:${YAHOO_CLIENT_SECRET}`
    const base64Auth = Buffer.from(authString).toString('base64')
    
    // Prepare the request to Yahoo's token endpoint
    const formData = new URLSearchParams()
    formData.append('grant_type', 'refresh_token')
    formData.append('refresh_token', refreshToken)

    try {
      // Make the request to Yahoo
      const response = await axios.post(YAHOO_REFRESH_URL, formData, {
        headers: {
          'Authorization': `Basic ${base64Auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        // Skip SSL verification in development
        ...(process.env.NODE_ENV === 'development' ? {
          httpsAgent: new (require('https').Agent)({ 
            rejectUnauthorized: false 
          })
        } : {})
      })
      
      if (response.status !== 200) {
        console.error('Failed to refresh Yahoo tokens', response.data)
        return NextResponse.json(
          { error: 'Failed to refresh Yahoo tokens' },
          { status: response.status }
        )
      }

      // Extract the new tokens - use consistent camelCase format
      const newTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken, // Use the new refresh token if provided, otherwise keep the old one
        expiresAt: Date.now() + response.data.expires_in * 1000
      }

      // Update the user document with the new tokens
      await updateDoc(userRef, {
        'yahooTokens': newTokens,
        'yahooConnected': true,
        'yahooTokensUpdatedAt': new Date().toISOString()
      })

      console.log(`Successfully refreshed Yahoo tokens for user: ${userId}`)

      return NextResponse.json({ 
        success: true,
        tokens: newTokens
      })
    } catch (yahooError) {
      console.error('Error refreshing Yahoo tokens from Yahoo API:', yahooError)
      
      // Check if it's an invalid refresh token
      if (axios.isAxiosError(yahooError) && 
          yahooError.response?.data?.error === 'invalid_grant') {
        return NextResponse.json({
          error: 'Your Yahoo authorization has expired. Please reconnect your account.',
          code: 'invalid_grant'
        }, { status: 401 })
      }
      
      throw yahooError
    }
  } catch (error) {
    console.error('Error refreshing Yahoo tokens:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to refresh Yahoo tokens',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}