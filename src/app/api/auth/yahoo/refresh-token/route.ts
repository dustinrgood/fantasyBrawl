import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

// Yahoo OAuth refresh endpoint
const YAHOO_REFRESH_URL = 'https://api.login.yahoo.com/oauth2/get_token'
// Your Yahoo client ID and secret should be stored in environment variables
const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET

/**
 * This route refreshes Yahoo OAuth tokens
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, refreshToken } = await request.json()

    // Validate required parameters
    if (!userId) {
      console.error('Missing userId in request body')
      return NextResponse.json(
        { error: 'Missing userId in request body' },
        { status: 400 }
      )
    }

    if (!refreshToken) {
      console.error('Missing refreshToken in request body')
      return NextResponse.json(
        { error: 'Missing refreshToken in request body' },
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

    // Prepare the request to Yahoo's token endpoint
    const formData = new URLSearchParams()
    formData.append('grant_type', 'refresh_token')
    formData.append('refresh_token', refreshToken)
    
    // Create Basic Auth header with client ID and secret
    const authString = `${YAHOO_CLIENT_ID}:${YAHOO_CLIENT_SECRET}`
    const base64Auth = Buffer.from(authString).toString('base64')
    
    // Make the request to Yahoo
    const response = await axios.post(YAHOO_REFRESH_URL, formData, {
      headers: {
        'Authorization': `Basic ${base64Auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (response.status !== 200) {
      console.error('Failed to refresh Yahoo tokens', response.data)
      return NextResponse.json(
        { error: 'Failed to refresh Yahoo tokens' },
        { status: response.status }
      )
    }

    // Extract the new tokens
    const newTokens = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token || refreshToken, // Use the new refresh token if provided, otherwise keep the old one
      expires_at: new Date(Date.now() + response.data.expires_in * 1000).toISOString()
    }

    // Update the user document with the new tokens
    await updateDoc(userRef, {
      'yahooTokens': newTokens
    })

    console.log(`Successfully refreshed Yahoo tokens for user: ${userId}`)

    return NextResponse.json({ 
      success: true,
      tokens: newTokens
    })
  } catch (error) {
    console.error('Error refreshing Yahoo tokens:', error)
    return NextResponse.json(
      { error: 'Failed to refresh Yahoo tokens' },
      { status: 500 }
    )
  }
} 