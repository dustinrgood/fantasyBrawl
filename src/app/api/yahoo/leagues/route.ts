import { NextRequest, NextResponse } from 'next/server'

// Mock data for Yahoo leagues
const MOCK_YAHOO_LEAGUES = [
  {
    league_id: 'yahoo-123456',
    name: 'Fantasy Football Champions',
    season: '2023',
    sport: 'football',
    num_teams: 12,
    scoring_type: 'Half PPR',
    is_finished: false
  },
  {
    league_id: 'yahoo-234567',
    name: 'Basketball Elite',
    season: '2023-2024',
    sport: 'basketball',
    num_teams: 10,
    scoring_type: 'Head-to-Head',
    is_finished: false
  },
  {
    league_id: 'yahoo-345678',
    name: 'Baseball Dynasty',
    season: '2023',
    sport: 'baseball',
    num_teams: 14,
    scoring_type: 'Rotisserie',
    is_finished: true
  }
]

/**
 * This route fetches Yahoo leagues for a user
 * In a real implementation, it would use the Yahoo API
 * For now, it returns mock data
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
    
    console.log(`Fetching Yahoo leagues for user: ${userId}`)
    
    // In a real implementation, we would fetch leagues from Yahoo API
    // For now, return mock data
    return NextResponse.json({
      leagues: MOCK_YAHOO_LEAGUES
    })
  } catch (error) {
    console.error('Error fetching Yahoo leagues:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch Yahoo leagues' },
      { status: 500 }
    )
  }
} 