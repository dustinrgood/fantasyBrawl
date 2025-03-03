import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

/**
 * This route disconnects a user's Yahoo account by removing their tokens
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
    
    console.log(`Disconnecting Yahoo account for user: ${userId}`)
    
    // Get the user document
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if the user has Yahoo tokens
    if (!userDoc.data().yahooTokens) {
      return NextResponse.json({
        success: true,
        message: 'User was not connected to Yahoo'
      })
    }
    
    // Remove the Yahoo tokens
    await updateDoc(userRef, {
      yahooTokens: null,
      yahooTokensUpdatedAt: null
    })
    
    console.log(`Successfully disconnected Yahoo account for user: ${userId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Yahoo account disconnected successfully'
    })
  } catch (error) {
    console.error('Error disconnecting Yahoo account:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 