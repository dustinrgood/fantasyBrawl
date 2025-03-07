/**
 * API route to get detailed information for a specific Yahoo Fantasy league
 * Uses the Yahoo Fantasy API service for real data
 */
import { NextRequest, NextResponse } from 'next/server'
import { createYahooFantasyService } from '@/lib/services/yahooFantasyService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leagueKey = searchParams.get('leagueKey')
    const userId = searchParams.get('userId')
    
    if (!leagueKey) {
      return NextResponse.json({ 
        error: 'League key is required' 
      }, { status: 400 })
    }
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 })
    }
    
    console.log(`League details request for league: ${leagueKey}`)
    console.log(`User ID: ${userId}`)
    
    // Create Yahoo Fantasy service for the user
    const yahooService = createYahooFantasyService(userId)
    
    // Get league details from Yahoo API
    const leagueDetails = await yahooService.getLeagueDetails(leagueKey)
    
    return NextResponse.json({ 
      league: leagueDetails
    })
  } catch (error) {
    console.error('Error in league details API:', error)
    
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
        error: 'Failed to fetch league details',
        details: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      error: 'Failed to fetch league details',
      details: String(error)
    }, { status: 500 })
  }
}