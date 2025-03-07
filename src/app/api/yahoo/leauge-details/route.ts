/**
 * API route to get detailed information for a specific Yahoo Fantasy league
 * Uses the Yahoo Fantasy API service for real data
 */
import { NextRequest, NextResponse } from 'next/server'
import { createYahooFantasyService } from '@/lib/services/yahooFantasyServices'

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
    
    // Check if user has Yahoo tokens
    const hasTokens = await yahooService.hasYahooTokens();
    if (!hasTokens) {
      console.error('No Yahoo tokens found for user:', userId);
      return NextResponse.json({
        error: 'You are not connected to Yahoo Fantasy. Please connect your account.',
        details: 'No Yahoo tokens found in user profile'
      }, { status: 401 });
    }
    
    // Get league details from Yahoo API
    const leagueDetails = await yahooService.getLeagueDetails(leagueKey)
    
    // Get teams separately to handle potential errors
    try {
      const teams = await yahooService.getLeagueTeams(leagueKey);
      leagueDetails.teams = teams;
    } catch (teamsError: any) {
      console.error('Error fetching teams for league details:', teamsError);
      // Continue without teams data
      leagueDetails.teams = [];
      
      // Add a flag to indicate teams couldn't be loaded
      leagueDetails.teams_error = teamsError.message || 'Failed to load teams';
    }
    
    return NextResponse.json({ 
      league: leagueDetails
    })
  } catch (error: any) {
    console.error('Error in league details API:', error)
    
    // Provide specific error message for common issues
    if (error instanceof Error) {
      if (error.message.includes('No Yahoo tokens found')) {
        return NextResponse.json({
          error: 'You are not connected to Yahoo Fantasy. Please connect your account.',
          details: error.message
        }, { status: 401 })
      }
      
      if (error.message.includes('Failed to refresh Yahoo tokens') || error.message.includes('invalid_grant')) {
        return NextResponse.json({
          error: 'Your Yahoo connection has expired. Please reconnect your account.',
          details: error.message
        }, { status: 401 })
      }
      
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        return NextResponse.json({
          error: 'Unable to access this league. You may not have permission or the league key is invalid.',
          details: error.message
        }, { status: 400 });
      }
      
      // Check for response property on error object (Axios error)
      if ('response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 400) {
        return NextResponse.json({
          error: 'League not found or you do not have permission to access it.',
          details: error.message
        }, { status: 404 });
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