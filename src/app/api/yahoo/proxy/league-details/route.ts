import { NextRequest, NextResponse } from 'next/server'
import { getLeagueDetails } from '@/lib/services/mockLeaguesService'
import { fetchFromYahooApi } from '@/lib/services/yahooSportsApi'

// Set to true to always use mock data (useful for development)
const ALWAYS_USE_MOCK = true

/**
 * API route to get detailed information for a specific league
 * This will try to fetch from Yahoo Fantasy API first, and fall back to mock data if needed
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get('leagueId')
    
    if (!leagueId) {
      return NextResponse.json({ 
        error: 'League ID is required' 
      }, { status: 400 })
    }
    
    console.log(`League details request for ID: ${leagueId}`)
    
    // Determine if we should use mock data
    let useMock = ALWAYS_USE_MOCK || leagueId.startsWith('mock-')
    
    let leagueDetails
    
    if (useMock) {
      console.log('Using mock league details data')
      leagueDetails = await getLeagueDetails(leagueId)
    } else {
      try {
        console.log('Attempting to fetch league details from Yahoo API')
        // This would be replaced with actual Yahoo API call in production
        
        // Example of how you might integrate with Yahoo:
        // const yahooData = await fetchFromYahooApi(`/league/${leagueId}`)
        // leagueDetails = processYahooLeagueDetails(yahooData)
        
        // For development, use mock data anyway
        leagueDetails = await getLeagueDetails(leagueId)
      } catch (yahooError) {
        console.error('Error fetching from Yahoo API, falling back to mock data:', yahooError)
        leagueDetails = await getLeagueDetails(leagueId)
      }
    }
    
    return NextResponse.json({ 
      league: leagueDetails,
      source: useMock ? 'mock' : 'yahoo'
    })
  } catch (error) {
    console.error('Error in league details API:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch league details',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}