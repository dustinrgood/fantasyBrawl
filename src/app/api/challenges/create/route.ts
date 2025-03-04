import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth } from '@/lib/firebase/firebase'

export async function POST(request: Request) {
  try {
    const { leagueId, wagerType, wagerAmount, challengerId } = await request.json()

    // Validate the request
    if (!leagueId || !wagerType || !wagerAmount || !challengerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the challenge
    const challenge = {
      leagueId,
      wagerType,
      wagerAmount,
      challengerId,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // Add to Firestore
    const challengeRef = await addDoc(collection(db, 'challenges'), challenge)

    return NextResponse.json({ 
      challengeId: challengeRef.id,
      message: 'Challenge created successfully' 
    })

  } catch (error) {
    console.error('Error creating challenge:', error)
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    )
  }
} 