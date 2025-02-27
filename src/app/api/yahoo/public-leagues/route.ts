import { NextResponse } from 'next/server'

// Mock data for public leagues
const MOCK_PUBLIC_LEAGUES = [
  {
    id: 'public-league-1',
    name: 'Fantasy Football Champions',
    description: 'A competitive fantasy football league for serious players',
    sport: 'football',
    season: '2023',
    managerIds: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10'],
    scoringSystem: { type: 'ppr', description: 'Points Per Reception' },
    isPublic: true,
    createdAt: '2023-08-15T12:00:00Z'
  },
  {
    id: 'public-league-2',
    name: 'Basketball Elite',
    description: 'Fantasy basketball league with advanced scoring',
    sport: 'basketball',
    season: '2023-2024',
    managerIds: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8'],
    scoringSystem: { type: 'h2h', description: 'Head-to-Head Points' },
    isPublic: true,
    createdAt: '2023-10-10T14:30:00Z'
  },
  {
    id: 'public-league-3',
    name: 'Baseball Legends',
    description: 'Fantasy baseball league with traditional rotisserie scoring',
    sport: 'baseball',
    season: '2023',
    managerIds: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12'],
    scoringSystem: { type: 'roto', description: 'Rotisserie' },
    isPublic: true,
    createdAt: '2023-03-20T09:15:00Z'
  },
  {
    id: 'public-league-4',
    name: 'Hockey Masters',
    description: 'Fantasy hockey league for NHL fans',
    sport: 'hockey',
    season: '2023-2024',
    managerIds: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10'],
    scoringSystem: { type: 'points', description: 'Points Only' },
    isPublic: true,
    createdAt: '2023-09-25T16:45:00Z'
  },
  {
    id: 'public-league-5',
    name: 'Football Dynasty',
    description: 'Multi-year dynasty fantasy football league',
    sport: 'football',
    season: '2023',
    managerIds: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12'],
    scoringSystem: { type: 'standard', description: 'Standard Scoring' },
    isPublic: true,
    createdAt: '2023-07-05T11:20:00Z'
  }
]

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const teamSizesParam = searchParams.get('teamSizes')
    
    // Filter leagues based on query parameters
    let filteredLeagues = [...MOCK_PUBLIC_LEAGUES]
    
    if (sport) {
      filteredLeagues = filteredLeagues.filter(league => 
        league.sport.toLowerCase() === sport.toLowerCase()
      )
    }
    
    if (teamSizesParam) {
      const teamSizes = teamSizesParam.split(',').map(size => parseInt(size))
      filteredLeagues = filteredLeagues.filter(league => 
        teamSizes.includes(league.managerIds.length)
      )
    }
    
    // Return the filtered leagues
    return NextResponse.json({ leagues: filteredLeagues })
  } catch (error) {
    console.error('Error fetching public leagues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch public leagues' },
      { status: 500 }
    )
  }
} 