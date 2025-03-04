import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import axios from 'axios'
import { Agent } from 'https'

// Create a custom agent that ignores SSL certificate errors in development
const isDev = process.env.NODE_ENV === 'development'
const httpsAgent = isDev ? new Agent({ rejectUnauthorized: false }) : undefined

/**
 * This route fetches Yahoo leagues for a user
 * It uses the Yahoo API proxy to get the user's leagues
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
    
    // Get the user document to check if they have Yahoo tokens
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists() || !userDoc.data().yahooTokens) {
      return NextResponse.json(
        { error: 'User has not connected their Yahoo account' },
        { status: 401 }
      )
    }
    
    // Use the Yahoo API proxy to fetch leagues
    try {
      // First, get the list of games (sports)
      console.log('Fetching Yahoo games (sports) for user')
      const gamesResponse = await axios.post(`${request.nextUrl.origin}/api/yahoo/proxy`, {
        userId,
        endpoint: 'users;use_login=1/games',
        params: {
          format: 'json'
        }
      }, {
        httpsAgent,
        timeout: 15000
      })
      
      if (gamesResponse.status !== 200) {
        throw new Error(`Yahoo API request failed: ${gamesResponse.status}`)
      }
      
      // Parse the Yahoo API response for games
      const gamesData = gamesResponse.data
      
      // Log the structure of the response for debugging
      console.log('Yahoo games response structure:', JSON.stringify(gamesData, null, 2).substring(0, 1000) + '...')
      
      // Check if the response has the expected structure
      if (!gamesData.fantasy_content) {
        console.error('Missing fantasy_content in Yahoo API response')
        throw new Error('Unexpected response from Yahoo API: missing fantasy_content')
      }
      
      if (!gamesData.fantasy_content.users) {
        console.error('Missing users in Yahoo API response')
        throw new Error('Unexpected response from Yahoo API: missing users')
      }
      
      if (!gamesData.fantasy_content.users[0].user) {
        console.error('Missing user in Yahoo API response')
        throw new Error('Unexpected response from Yahoo API: missing user')
      }
      
      // Extract games from the response
      const user = gamesData.fantasy_content.users[0].user
      
      // Check if games exist in the user object
      if (!user[1] || !user[1].games) {
        console.log('No games found in user data')
        return NextResponse.json({ leagues: [] })
      }
      
      const games = user[1].games
      
      if (!games || games.count === 0) {
        // No games found
        console.log('No Yahoo fantasy games found for user')
        return NextResponse.json({ leagues: [] })
      }
      
      console.log(`Found ${games.count} Yahoo fantasy games`)
      
      // Process each game to get its leagues
      const allLeagues = []
      
      for (let i = 0; i < games.count; i++) {
        // Make sure game exists at this index
        if (!games[i] || !games[i].game) {
          console.warn(`Game at index ${i} is missing or invalid`)
          continue
        }
        
        try {
          const game = games[i].game[0]
          
          if (!game || !game.game_key) {
            console.warn(`Game data at index ${i} is missing or invalid`)
            continue
          }
          
          const gameKey = game.game_key
          
          console.log(`Fetching leagues for game: ${gameKey} (${game.name || 'Unknown'})`)
          
          // Get leagues for this game
          const leaguesResponse = await axios.post(`${request.nextUrl.origin}/api/yahoo/proxy`, {
            userId,
            endpoint: `users;use_login=1/games;game_keys=${gameKey}/leagues`,
            params: {
              format: 'json'
            }
          }, {
            httpsAgent,
            timeout: 15000
          })
          
          if (leaguesResponse.status !== 200) {
            console.warn(`Failed to fetch leagues for game ${gameKey}: ${leaguesResponse.status}`)
            continue
          }
          
          const leaguesData = leaguesResponse.data
          
          // Log the structure of the leagues response for debugging
          console.log(`Leagues response for game ${gameKey} structure:`, 
            JSON.stringify(leaguesData, null, 2).substring(0, 1000) + '...')
          
          // Check if the response has the expected structure for leagues
          if (!leaguesData.fantasy_content) {
            console.warn(`Missing fantasy_content in leagues response for game ${gameKey}`)
            continue
          }
          
          if (!leaguesData.fantasy_content.users) {
            console.warn(`Missing users in leagues response for game ${gameKey}`)
            continue
          }
          
          if (!leaguesData.fantasy_content.users[0].user) {
            console.warn(`Missing user in leagues response for game ${gameKey}`)
            continue
          }
          
          if (!leaguesData.fantasy_content.users[0].user[1].games) {
            console.warn(`Missing games in leagues response for game ${gameKey}`)
            continue
          }
          
          if (!leaguesData.fantasy_content.users[0].user[1].games[0].game) {
            console.warn(`Missing game in leagues response for game ${gameKey}`)
            continue
          }
          
          if (!leaguesData.fantasy_content.users[0].user[1].games[0].game[1].leagues) {
            console.warn(`No leagues found for game ${gameKey}`)
            continue
          }
          
          const gameLeagues = leaguesData.fantasy_content.users[0].user[1].games[0].game[1].leagues
          
          if (!gameLeagues.count || gameLeagues.count === 0) {
            console.log(`No leagues found for game ${gameKey}`)
            continue
          }
          
          console.log(`Found ${gameLeagues.count} leagues for game ${gameKey}`)
          
          // Process each league in the game
          for (let j = 0; j < gameLeagues.count; j++) {
            if (!gameLeagues[j] || !gameLeagues[j].league || !gameLeagues[j].league[0]) {
              console.warn(`League at index ${j} for game ${gameKey} is missing or invalid`)
              continue
            }
            
            const league = gameLeagues[j].league[0]
            
            if (!league.league_id) {
              console.warn(`League at index ${j} for game ${gameKey} is missing league_id`)
              continue
            }
            
            allLeagues.push({
              league_id: league.league_id,
              league_key: league.league_key || `${gameKey}.l.${league.league_id}`,
              name: league.name || 'Unknown League',
              season: league.season || 'Unknown',
              sport: game.code || 'Unknown',
              num_teams: league.num_teams || 0,
              scoring_type: league.scoring_type || 'unknown',
              is_finished: league.is_finished === '1'
            })
          }
        } catch (gameError) {
          console.error(`Error processing game at index ${i}:`, gameError)
          // Continue with other games even if one fails
        }
      }
      
      console.log(`Found ${allLeagues.length} leagues across all games`)
      return NextResponse.json({ leagues: allLeagues })
    } catch (error) {
      console.error('Error fetching from Yahoo API:', error)
      
      // Check for specific axios errors
      if (axios.isAxiosError(error) && error.response) {
        console.error('Yahoo API error response:', error.response.data)
        return NextResponse.json(
          { error: `Yahoo API error: ${error.response.status}`, details: error.response.data },
          { status: error.response.status }
        )
      }
      
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch Yahoo leagues' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching Yahoo leagues:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Yahoo leagues' },
      { status: 500 }
    )
  }
} 