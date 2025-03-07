/**
 * API route to import a Yahoo Fantasy league for a user
 * Uses the Yahoo Fantasy service for real data
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { doc, collection, query, where, getDocs } from 'firebase/firestore'
import { createYahooFantasyService } from '@/lib/services/yahooFantasyService'

export async function POST(request: NextRequest) {
  try {
    const { userId, leagueKey } = await request.json()

    if (!userId || !leagueKey) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    console.log(`Importing Yahoo league ${leagueKey} for user ${userId}`)

    // Check if the league is already imported
    const leaguesRef = collection(db, 'leagues')
    const q = query(
      leaguesRef, 
      where('yahooLeagueKey', '==', leagueKey),
      where('managerIds', 'array-contains', userId)
    )
    
    const existingLeagues = await getDocs(q)
    
    if (!existingLeagues.empty) {
      return NextResponse.json(
        { message: 'League already imported', leagueId: existingLeagues.docs[0].id },
        { status: 200 }
      )
    }

    // Create Yahoo Fantasy service for the user
    const yahooService = createYahooFantasyService(userId)
    
    // Import the league
    const leagueId = await yahooService.importLeague(leagueKey)
    
    console.log(`Successfully imported Yahoo league ${leagueKey} as ${leagueId}`)

    return NextResponse.json({ 
      message: 'League imported successfully', 
      leagueId 
    })
  } catch (error) {
    console.error('Error importing Yahoo league:', error)
    
    // Provide specific error message for common issues
    if (error instanceof Error) {
      if (error.message.includes('No Yahoo tokens found')) {
        return NextResponse.json({
          error: 'You are not connected to Yahoo Fantasy. Please connect your account.',
          details: error.message
        }, { status: 401 })
      }
      
      if (error.message.includes('Failed to refresh Yahoo tokens')) {
        return NextResponse.json({
          error: 'Your Yahoo connection has expired. Please reconnect your account.',
          details: error.message
        }, { status: 401 })
      }
      
      return NextResponse.json({
        error: 'Failed to import league',
        details: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json(
      { error: 'Failed to import league' },
      { status: 500 }
    )
  }
}