import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

/**
 * This route stores Yahoo tokens for a user
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { userId, tokens } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    if (!tokens || !tokens.access_token || !tokens.refresh_token || !tokens.expires_at) {
      return NextResponse.json(
        { error: 'Invalid tokens provided' },
        { status: 400 }
      )
    }
    
    console.log(`Storing Yahoo tokens for user: ${userId}`)
    
    // Format the tokens for storage
    const yahooTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(tokens.expires_at).toISOString()
    }
    
    // Check if the user document exists
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      // Update the existing document
      await updateDoc(userRef, {
        yahooTokens,
        yahooTokensUpdatedAt: new Date().toISOString()
      })
    } else {
      // Create a new document
      await setDoc(userRef, {
        yahooTokens,
        yahooTokensUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      })
    }
    
    console.log(`Successfully stored Yahoo tokens for user: ${userId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Tokens stored successfully'
    })
  } catch (error) {
    console.error('Error storing Yahoo tokens:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 