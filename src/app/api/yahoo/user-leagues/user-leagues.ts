/**
 * API route to get all fantasy leagues for a user from Yahoo
 * Uses the Yahoo Fantasy API service for real data
 */
import { NextRequest, NextResponse } from 'next/server'
import { createYahooFantasyService } from '@/lib/services/yahooFantasyService'

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
    
    console.log(`Fetching Yahoo leagues for user: ${userId}`)
    
    // Create Yahoo Fantasy service for the user
    const yahooService = createYahooFantasyService(userId)
    
    // Get leagues from Yahoo API
    const leagues = await yahooService.getLeagues()
    
    console.log(`Found ${leagues.length} Yahoo fantasy leagues`)
    
    return NextResponse.json({ leagues })
  } catch (error) {
    console.error('Error fetching Yahoo leagues:', error)
    
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
        error: 'Failed to fetch Yahoo leagues',
        details: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch Yahoo leagues' },
      { status: 500 }
    )
  }
}