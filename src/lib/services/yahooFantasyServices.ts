/**
 * Yahoo Fantasy Sports API Service
 * This service handles all interactions with the Yahoo Fantasy Sports API
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Agent } from 'https'
import { db } from '@/lib/firebase/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

// Types for tokens
interface YahooTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number | string
}

// League interfaces
export interface YahooLeague {
  league_id: string
  league_key: string
  name: string
  season: string
  sport: string
  num_teams: number
  scoring_type: string
  is_finished: boolean
  logo_url?: string
  draft_status?: string
}

export interface YahooLeagueDetails extends YahooLeague {
  current_week: number
  start_week: number
  end_week: number
  playoff_start_week: number
  teams: YahooTeam[]
  teams_error?: string
  settings: any // Detailed settings object
  standings?: any // League standings
  commissioner?: {
    name: string
    email?: string
    teamId: string
  }
}

export interface YahooTeam {
  team_id: string
  team_key: string
  name: string
  manager_name: string
  manager_email?: string
  logo?: string
  waiver_priority?: number
  standing?: number
}

/**
 * Yahoo Fantasy Sports API Service
 */
export class YahooFantasyService {
  private baseUrl = 'https://fantasysports.yahooapis.com/fantasy/v2'
  private client: AxiosInstance
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    
    // Create axios client with custom settings
    const config: AxiosRequestConfig = {
      baseURL: this.baseUrl,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    // Add SSL bypass for development
    if (process.env.NODE_ENV === 'development') {
      config.httpsAgent = new Agent({ rejectUnauthorized: false })
    }
    
    this.client = axios.create(config)
    
    // Add request interceptor to add authorization header
    this.client.interceptors.request.use(async (config) => {
      // Get tokens and refresh if needed
      const token = await this.getAccessToken()
      config.headers.Authorization = `Bearer ${token}`
      return config
    })
    
  }

  /**
   * Get the user's access token, refreshing if necessary
   */
  private async getAccessToken(): Promise<string> {
    try {
      // Get tokens from Firestore
      const tokens = await this.getTokensFromFirestore();
      
      if (!tokens) {
        console.error('No Yahoo tokens found for user:', this.userId);
        throw new Error('No Yahoo tokens found for this user. Please connect your Yahoo Fantasy account.');
      }
      
      // Check if token is expired or about to expire (within 5 minutes)
      const expiresAt = typeof tokens.expiresAt === 'string' 
        ? parseInt(tokens.expiresAt) 
        : tokens.expiresAt;
      
      const isExpired = Date.now() >= expiresAt - 5 * 60 * 1000; // 5 minutes buffer
      
      if (isExpired) {
        console.debug('Yahoo tokens are expired or about to expire, refreshing...');
        return await this.refreshTokens(tokens.refreshToken);
      }
      
      return tokens.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  /**
   * Get tokens from Firestore
   */
  private async getTokensFromFirestore(): Promise<YahooTokens | null> {
    try {
      const userRef = doc(db, 'users', this.userId)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists() || !userDoc.data().yahooTokens) {
        return null
      }
      
      const tokens = userDoc.data().yahooTokens
      
      // Normalize token format
      return {
        accessToken: tokens.accessToken || tokens.access_token,
        refreshToken: tokens.refreshToken || tokens.refresh_token,
        expiresAt: tokens.expiresAt || tokens.expires_at
      }
    } catch (error) {
      console.error('Error getting Yahoo tokens from Firestore:', error)
      throw error
    }
  }

  /**
   * Refresh tokens using the refresh token
   */
  private async refreshTokens(refreshToken: string): Promise<string> {
    try {
      const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID;
      const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET;
      
      if (!YAHOO_CLIENT_ID || !YAHOO_CLIENT_SECRET) {
        console.error('Missing Yahoo API credentials in environment variables');
        throw new Error('Yahoo API credentials not configured');
      }
      
      // Create basic auth header
      const authString = `${YAHOO_CLIENT_ID}:${YAHOO_CLIENT_SECRET}`;
      const base64Auth = Buffer.from(authString).toString('base64');
      
      // Prepare the request to Yahoo's token endpoint
      const formData = new URLSearchParams();
      formData.append('grant_type', 'refresh_token');
      formData.append('refresh_token', refreshToken);
      
      console.debug('Refreshing Yahoo tokens...');
      
      // Make the request to Yahoo
      const response = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${base64Auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error refreshing Yahoo tokens:', response.status, errorText);
        throw new Error(`Failed to refresh Yahoo tokens: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      // Calculate expiration time (data.expires_in is in seconds)
      const expiresAt = Date.now() + data.expires_in * 1000;
      
      // Store the new tokens in Firestore
      const userRef = doc(db, 'users', this.userId);
      await updateDoc(userRef, {
        yahooTokens: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt
        }
      });
      
      console.debug('Yahoo tokens refreshed successfully');
      
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing Yahoo tokens:', error);
      
      // Add more context to the error
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('invalid_grant')) {
          error.message = 'Your Yahoo authorization has expired. Please reconnect your account.';
        } else {
          error.message = `Failed to refresh Yahoo tokens: ${error.message}`;
        }
      }
      
      throw error;
    }
  }

  /**
   * Get all games (sports) for the user
   */
  async getGames(): Promise<any> {
    try {
      const response = await this.client.get('/users;use_login=1/games?format=json')
      return response.data.fantasy_content
    } catch (error) {
      console.error('Error getting Yahoo games:', error)
      throw error
    }
  }

  /**
   * Get all leagues for the user
   */
  async getLeagues(): Promise<YahooLeague[]> {
    try {
      // First get all games (sports)
      const gamesData = await this.getGames()
      
      // Extract games from the response
      const user = gamesData.users[0].user
      
      // Check if games exist in the user object
      if (!user[1] || !user[1].games) {
        console.log('No games found in user data')
        return []
      }
      
      const games = user[1].games
      
      if (!games || games.count === 0) {
        console.log('No Yahoo fantasy games found for user')
        return []
      }
      
      // Process each game to get its leagues
      const allLeagues: YahooLeague[] = []
      
      for (let i = 0; i < games.count; i++) {
        if (!games[i] || !games[i].game) continue
        
        const game = games[i].game[0]
        
        if (!game || !game.game_key) continue
        
        const gameKey = game.game_key
        
        // Get leagues for this game
        try {
          const leaguesResponse = await this.client.get(
            `/users;use_login=1/games;game_keys=${gameKey}/leagues?format=json`
          )
          
          const leaguesData = leaguesResponse.data
          
          if (!leaguesData.fantasy_content?.users?.[0]?.user?.[1]?.games?.[0]?.game?.[1]?.leagues) {
            continue
          }
          
          const gameLeagues = leaguesData.fantasy_content.users[0].user[1].games[0].game[1].leagues
          
          if (!gameLeagues.count || gameLeagues.count === 0) {
            continue
          }
          
          // Process each league in the game
          for (let j = 0; j < gameLeagues.count; j++) {
            if (!gameLeagues[j]?.league?.[0]) continue
            
            const league = gameLeagues[j].league[0]
            
            if (!league.league_id) continue
            
            allLeagues.push({
              league_id: league.league_id,
              league_key: league.league_key || `${gameKey}.l.${league.league_id}`,
              name: league.name || 'Unknown League',
              season: league.season || 'Unknown',
              sport: game.code || 'Unknown',
              num_teams: league.num_teams || 0,
              scoring_type: league.scoring_type || 'unknown',
              is_finished: league.is_finished === '1',
              logo_url: league.logo_url,
              draft_status: league.draft_status
            })
          }
        } catch (error) {
          console.error(`Error getting leagues for game ${gameKey}:`, error)
          // Continue with other games even if one fails
        }
      }
      
      return allLeagues
    } catch (error) {
      console.error('Error getting Yahoo leagues:', error)
      throw error
    }
  }

  /**
   * Get detailed information for a specific league
   */
  async getLeagueDetails(leagueKey: string): Promise<YahooLeagueDetails> {
    try {
      console.debug(`Getting details for league: ${leagueKey}`);
      
      // Add a cache-busting parameter to ensure we get fresh data
      const cacheBuster = Date.now();
      
      // Use a batch request to get all the data we need
      const response = await this.client.get(
        `/league/${leagueKey}/metadata,settings?format=json&_=${cacheBuster}`
      );
      
      console.debug('Received league metadata response');
      
      if (!response.data || !response.data.fantasy_content || !response.data.fantasy_content.league) {
        console.error('Invalid response format from Yahoo API:', response.data);
        throw new Error('Invalid response format from Yahoo API');
      }
      
      const leagueData = response.data.fantasy_content.league[0];
      const leagueSettings = response.data.fantasy_content.league[1].settings[0];
      
      // Create a basic league details object without teams first
      // This allows us to return partial data if team fetching fails
      const basicLeagueDetails: YahooLeagueDetails = {
        league_id: leagueData.league_id,
        league_key: leagueData.league_key,
        name: leagueData.name,
        season: leagueData.season,
        sport: leagueData.game_code,
        num_teams: parseInt(leagueData.num_teams),
        scoring_type: leagueData.scoring_type,
        is_finished: leagueData.is_finished === '1',
        logo_url: leagueData.logo_url,
        draft_status: leagueData.draft_status,
        current_week: parseInt(leagueData.current_week),
        start_week: parseInt(leagueSettings.start_week),
        end_week: parseInt(leagueSettings.end_week),
        playoff_start_week: parseInt(leagueSettings.playoff_start_week),
        teams: [], // Empty array initially
        settings: leagueSettings,
        commissioner: undefined, // We'll set this later if available
        teams_error: undefined
      };
      
      // Get commissioner info - only if we have basic league details
      try {
        const commissionerTeamId = leagueSettings.commissioner_team_id;
        
        if (commissionerTeamId) {
          console.debug(`Fetching commissioner info for team ID: ${commissionerTeamId}`);
          
          const teamResponse = await this.client.get(
            `/team/${leagueKey}.t.${commissionerTeamId}/metadata?format=json`
          );
          
          const managerData = teamResponse.data.fantasy_content.team[0][0].managers[0].manager;
          
          if (managerData) {
            basicLeagueDetails.commissioner = {
              name: managerData.nickname || 'Unknown',
              email: managerData.email || undefined,
              teamId: commissionerTeamId
            };
            console.debug(`Commissioner info found: ${basicLeagueDetails.commissioner.name}`);
          }
        }
      } catch (error) {
        console.error('Error getting commissioner info:', error);
        // Continue without commissioner info
      }
      
      return basicLeagueDetails;
    } catch (error: any) {
      console.error('Error getting Yahoo league details:', error);
      
      // Add more context to the error
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data));
        
        if (error.response.status === 400) {
          console.error('400 Bad Request error. This could be due to invalid league key or permission issues.');
          throw new Error(`Failed to get league details for ${leagueKey}: Bad Request (400) - The league key may be invalid or you may not have permission to access this league.`);
        }
      }
      
      if (error instanceof Error) {
        error.message = `Failed to get league details for ${leagueKey}: ${error.message}`;
      }
      
      throw error;
    }
  }

  /**
   * Get teams for a specific league
   * This is separated from getLeagueDetails to allow for better error handling
   */
  async getLeagueTeams(leagueKey: string): Promise<YahooTeam[]> {
    try {
      console.debug(`Getting teams for league: ${leagueKey}`);
      
      // Add a cache-busting parameter to ensure we get fresh data
      const cacheBuster = Date.now();
      
      // Get teams in the league - with enhanced error handling
      const teamsResponse = await this.client.get(
        `/league/${leagueKey}/teams?format=json&_=${cacheBuster}`
      );
      
      console.debug('Teams response status:', teamsResponse.status);
      
      // Log the raw response data for debugging
      console.debug('Raw teams response data:', JSON.stringify(teamsResponse.data).substring(0, 5000));
      
      if (!teamsResponse.data || !teamsResponse.data.fantasy_content || !teamsResponse.data.fantasy_content.league) {
        console.error('Invalid teams response format from Yahoo API:', teamsResponse.data);
        throw new Error('Invalid teams response format from Yahoo API');
      }
      
      // Log the league data structure
      console.debug('League data structure:', 
        JSON.stringify(teamsResponse.data.fantasy_content.league).substring(0, 5000));
      
      const teamsData = teamsResponse.data.fantasy_content.league[1].teams;
      
      // Log the teams data structure
      console.debug('Teams data structure:', JSON.stringify(teamsData).substring(0, 5000));
      
      const teams: YahooTeam[] = [];
      
      console.debug(`Found ${teamsData?.count || 0} teams in response`);
      
      if (teamsData && teamsData.count > 0) {
        // Track team keys to ensure uniqueness
        const usedTeamKeys = new Set<string>();
        
        for (let i = 0; i < teamsData.count; i++) {
          try {
            if (!teamsData[i]) {
              console.debug(`Skipping team at index ${i} due to missing data`);
              continue;
            }
            
            // Yahoo API returns team data in a specific format
            // The team data is in an array where the first element is the team metadata
            // and the second element contains additional team data
            const teamEntry = teamsData[i].team;
            
            if (!teamEntry) {
              console.debug(`No team entry found at index ${i}`);
              continue;
            }
            
            // Extract team data from the first element (array or object)
            let teamData: any = null;
            let teamId = '';
            let teamKey = '';
            let teamName = '';
            
            // Handle different team data structures
            if (Array.isArray(teamEntry)) {
              // If teamEntry is an array, the first element contains the basic team data
              teamData = teamEntry[0];
              teamId = teamData.team_id;
              teamKey = teamData.team_key;
              teamName = teamData.name || teamData.n || ''; // Yahoo API sometimes uses 'n' for name
            } else {
              // If teamEntry is an object, extract data directly
              teamData = teamEntry;
              teamId = teamData.team_id;
              teamKey = teamData.team_key;
              teamName = teamData.name || teamData.n || ''; // Yahoo API sometimes uses 'n' for name
            }
            
            console.debug(`Processing team ${i}: ID=${teamId}, Key=${teamKey}, Name=${teamName}`);
            
            // Generate a unique team key if missing or duplicate
            if (!teamKey || usedTeamKeys.has(teamKey)) {
              teamKey = `${leagueKey}.t.${i}-${Date.now()}`;
              console.debug(`Generated unique team key for team at index ${i}: ${teamKey}`);
            }
            
            usedTeamKeys.add(teamKey);
            
            // Extract manager information
            let managerName = 'Unknown Manager';
            let managerEmail = undefined;
            
            // Handle different manager data structures
            if (teamData.managers) {
              const managers = teamData.managers;
              
              // Try different ways to access manager data
              if (Array.isArray(managers)) {
                // If managers is an array of manager objects
                if (managers.length > 0 && managers[0].manager) {
                  const manager = managers[0].manager;
                  managerName = manager.nickname || manager.name || 'Unknown Manager';
                  managerEmail = manager.email;
                  console.debug(`Found manager in array: ${managerName}`);
                }
              } else if (managers[0] && managers[0].manager) {
                // If managers is an object with numbered properties
                const manager = managers[0].manager;
                managerName = manager.nickname || manager.name || 'Unknown Manager';
                managerEmail = manager.email;
                console.debug(`Found manager in object: ${managerName}`);
              } else if (managers.manager) {
                // If managers has a direct manager property
                const manager = managers.manager;
                managerName = manager.nickname || manager.name || 'Unknown Manager';
                managerEmail = manager.email;
                console.debug(`Found manager directly: ${managerName}`);
              } else if (managers.count && managers.count > 0) {
                // If managers has a count property (it's an object with numbered properties)
                for (let j = 0; j < managers.count; j++) {
                  if (managers[j] && managers[j].manager) {
                    const manager = managers[j].manager;
                    managerName = manager.nickname || manager.name || 'Unknown Manager';
                    managerEmail = manager.email;
                    console.debug(`Found manager at index ${j}: ${managerName}`);
                    break; // Just use the first manager
                  }
                }
              }
            }
            
            console.debug(`Final manager name for team ${i}: ${managerName}`);
            
            // Extract team logo
            let teamLogo = undefined;
            
            // Handle different team_logos data structures
            if (teamData.team_logos) {
              const logos = teamData.team_logos;
              
              if (Array.isArray(logos)) {
                // If logos is an array of logo objects
                if (logos.length > 0 && logos[0].team_logo) {
                  teamLogo = logos[0].team_logo.url;
                }
              } else if (logos[0] && logos[0].team_logo) {
                // If logos is an object with numbered properties
                teamLogo = logos[0].team_logo.url;
              } else if (logos.team_logo) {
                // If logos has a direct team_logo property
                teamLogo = logos.team_logo.url;
              }
            }
            
            // Create the team object
            const teamObj: YahooTeam = {
              team_id: teamId || `${i}`,
              team_key: teamKey,
              name: teamName || `Team ${i + 1}`,
              manager_name: managerName,
              manager_email: managerEmail,
              logo: teamLogo,
              waiver_priority: teamData.waiver_priority,
              standing: teamData.team_standings?.rank
            };
            
            // Log the final team object
            console.debug(`Final team object for index ${i}:`, teamObj);
            
            teams.push(teamObj);
          } catch (teamError) {
            console.error(`Error processing team at index ${i}:`, teamError);
            // Continue with next team
          }
        }
      }
      
      console.debug(`Successfully processed ${teams.length} teams`);
      return teams;
      
    } catch (error: any) {
      console.error('Error fetching teams for league:', error);
      
      if (error.response) {
        console.error('Teams request failed with status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data));
        
        if (error.response.status === 400) {
          throw new Error(`Failed to get teams for league ${leagueKey}: Bad Request (400) - The league key may be invalid or you may not have permission to access this league.`);
        }
      }
      
      throw error;
    }
  }

  /**
   * Import a league into the user's account
   */
  async importLeague(leagueKey: string): Promise<string> {
    try {
      // Get league details
      const leagueDetails = await this.getLeagueDetails(leagueKey)
      
      // Create a new league document in Firestore
      const leagueId = `yahoo-${leagueDetails.league_id}`
      const leagueRef = doc(db, 'leagues', leagueId)
      
      await updateDoc(leagueRef, {
        id: leagueId,
        name: leagueDetails.name,
        description: `Yahoo Fantasy ${leagueDetails.sport.toUpperCase()} League`,
        sport: leagueDetails.sport.toLowerCase(),
        season: leagueDetails.season,
        managerIds: [this.userId], // Add the current user as a manager
        scoringSystem: { 
          type: leagueDetails.scoring_type, 
          description: leagueDetails.scoring_type === 'head' ? 'Head-to-Head' : 'Rotisserie' 
        },
        isPublic: false,
        createdAt: new Date().toISOString(),
        yahooLeagueKey: leagueKey,
        yahooLeagueId: leagueDetails.league_id,
        numTeams: leagueDetails.num_teams,
        draftStatus: leagueDetails.draft_status || 'completed',
        logoUrl: leagueDetails.logo_url || null,
        commissioner: leagueDetails.commissioner || null,
        importedAt: new Date().toISOString(),
        importedBy: this.userId
      })
      
      return leagueId
    } catch (error) {
      console.error('Error importing Yahoo league:', error)
      throw error
    }
  }

  /**
   * Get team details
   */
  async getTeamDetails(teamKey: string): Promise<any> {
    try {
      console.debug(`Getting details for team: ${teamKey}`);
      
      // Add a cache-busting parameter to ensure we get fresh data
      const cacheBuster = Date.now();
      
      // Use a batch request to get all the data we need
      const response = await this.client.get(
        `/team/${teamKey}/metadata,stats,standings,roster?format=json&_=${cacheBuster}`
      );
      
      console.debug('Received team details response');
      
      if (!response.data || !response.data.fantasy_content || !response.data.fantasy_content.team) {
        console.error('Invalid response format from Yahoo API:', response.data);
        throw new Error('Invalid response format from Yahoo API');
      }
      
      // Log the response data for debugging
      console.debug('Team details response data structure:', 
        JSON.stringify(response.data.fantasy_content.team).substring(0, 5000));
      
      const teamData = response.data.fantasy_content.team;
      
      // Extract team metadata from the first element
      let team: any = null;
      
      // Handle different team data structures
      if (Array.isArray(teamData[0])) {
        team = teamData[0][0];
      } else {
        team = teamData[0];
      }
      
      if (!team) {
        console.error('Team data not found in response');
        throw new Error('Team data not found in response');
      }
      
      console.debug('Team metadata:', JSON.stringify(team).substring(0, 1000));
      
      // Extract additional team data from the second element
      let teamStats = null;
      let teamStandings = null;
      let roster = null;
      
      // Check if the second element exists
      if (teamData[1]) {
        // Extract team stats if available
        if (teamData[1].team_stats) {
          teamStats = teamData[1].team_stats;
        }
        
        // Extract team standings if available
        if (teamData[1].team_standings) {
          teamStandings = teamData[1].team_standings;
        }
        
        // Extract roster if available
        if (teamData[1].roster) {
          roster = teamData[1].roster[0]?.players;
        }
      }
      
      // Extract manager information
      let managerName = 'Unknown Manager';
      let managerEmail = undefined;
      
      // Handle different manager data structures
      if (team.managers) {
        const managers = team.managers;
        
        // Try different ways to access manager data
        if (Array.isArray(managers)) {
          // If managers is an array of manager objects
          if (managers.length > 0 && managers[0].manager) {
            const manager = managers[0].manager;
            managerName = manager.nickname || manager.name || 'Unknown Manager';
            managerEmail = manager.email;
            console.debug(`Found manager in array: ${managerName}`);
          }
        } else if (managers[0] && managers[0].manager) {
          // If managers is an object with numbered properties
          const manager = managers[0].manager;
          managerName = manager.nickname || manager.name || 'Unknown Manager';
          managerEmail = manager.email;
          console.debug(`Found manager in object: ${managerName}`);
        } else if (managers.manager) {
          // If managers has a direct manager property
          const manager = managers.manager;
          managerName = manager.nickname || manager.name || 'Unknown Manager';
          managerEmail = manager.email;
          console.debug(`Found manager directly: ${managerName}`);
        } else if (managers.count && managers.count > 0) {
          // If managers has a count property (it's an object with numbered properties)
          for (let j = 0; j < managers.count; j++) {
            if (managers[j] && managers[j].manager) {
              const manager = managers[j].manager;
              managerName = manager.nickname || manager.name || 'Unknown Manager';
              managerEmail = manager.email;
              console.debug(`Found manager at index ${j}: ${managerName}`);
              break; // Just use the first manager
            }
          }
        }
      }
      
      // Extract team logo
      let teamLogo = undefined;
      
      // Handle different team_logos data structures
      if (team.team_logos) {
        const logos = team.team_logos;
        
        if (Array.isArray(logos)) {
          // If logos is an array of logo objects
          if (logos.length > 0 && logos[0].team_logo) {
            teamLogo = logos[0].team_logo.url;
          }
        } else if (logos[0] && logos[0].team_logo) {
          // If logos is an object with numbered properties
          teamLogo = logos[0].team_logo.url;
        } else if (logos.team_logo) {
          // If logos has a direct team_logo property
          teamLogo = logos.team_logo.url;
        }
      }
      
      // Format the basic team data
      const formattedTeam = {
        team_id: team.team_id,
        team_key: team.team_key,
        name: team.name || team.n || `Team ${team.team_id}`,
        manager_name: managerName,
        manager_email: managerEmail,
        logo: teamLogo,
        
        // Add standings info if available
        standing: teamStandings?.rank,
        record: teamStandings ? `${teamStandings.outcome_totals.wins}-${teamStandings.outcome_totals.losses}` : null,
        points: teamStats?.total,
        
        // Add roster
        roster: this.formatRoster(roster)
      };
      
      console.debug('Formatted team data:', JSON.stringify(formattedTeam).substring(0, 1000));
      
      return formattedTeam;
    } catch (error: any) {
      console.error('Error getting Yahoo team details:', error);
      
      // Add more context to the error
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data));
        
        if (error.response.status === 400) {
          throw new Error(`Failed to get team details for ${teamKey}: Bad Request (400) - The team key may be invalid or you may not have permission to access this team.`);
        }
      }
      
      if (error instanceof Error) {
        error.message = `Failed to get team details for ${teamKey}: ${error.message}`;
      }
      
      throw error;
    }
  }

  // Also add the formatRoster method inside the class
  private formatRoster(rosterData: any): any[] {
    if (!rosterData || !rosterData.count) {
      return [];
    }
    
    console.debug(`Formatting roster with ${rosterData.count} players`);
    
    const players = [];
    
    for (let i = 0; i < rosterData.count; i++) {
      try {
        if (!rosterData[i]?.player) {
          console.debug(`Skipping player at index ${i} due to missing data`);
          continue;
        }
        
        // Log the player data structure
        console.debug(`Player data structure at index ${i}:`, 
          JSON.stringify(rosterData[i].player).substring(0, 1000));
        
        // Handle different player data structures
        const playerEntry = rosterData[i].player;
        let playerData: any = null;
        let selectedPosition = 'BN';
        
        if (Array.isArray(playerEntry)) {
          // If playerEntry is an array, the first element contains the basic player data
          playerData = playerEntry[0];
          
          // Extract selected position from the second element if available
          if (playerEntry[1] && playerEntry[1].selected_position) {
            selectedPosition = playerEntry[1].selected_position.position;
          }
        } else {
          // If playerEntry is an object, extract data directly
          playerData = playerEntry;
          
          // Try to extract selected position
          if (playerEntry.selected_position) {
            selectedPosition = playerEntry.selected_position.position;
          }
        }
        
        if (!playerData) {
          console.debug(`Skipping player at index ${i} due to invalid data structure`);
          continue;
        }
        
        // Extract player name
        let playerName = 'Unknown Player';
        if (playerData.name) {
          if (typeof playerData.name === 'string') {
            playerName = playerData.name;
          } else if (playerData.name.full) {
            playerName = playerData.name.full;
          } else if (playerData.name.first && playerData.name.last) {
            playerName = `${playerData.name.first} ${playerData.name.last}`;
          }
        }
        
        players.push({
          player_id: playerData.player_id,
          player_key: playerData.player_key,
          name: playerName,
          position: playerData.display_position,
          status: playerData.status || 'Active',
          team: playerData.editorial_team_abbr || '',
          selected_position: selectedPosition
        });
      } catch (error) {
        console.error(`Error processing player at index ${i}:`, error);
        // Continue with next player
      }
    }
    
    console.debug(`Successfully processed ${players.length} players`);
    return players;
  }

  /**
   * Search for public leagues
   * Note: Yahoo doesn't provide a direct API for this, so functionality is limited
   */
  async searchPublicLeagues(sport?: string): Promise<YahooLeague[]> {
    try {
      // First get games for the specified sport or all sports
      const gamesData = await this.getGames()
      
      // Filter games by sport if specified
      const filteredGames = []
      const user = gamesData.users[0].user
      
      if (!user[1] || !user[1].games) {
        return []
      }
      
      const games = user[1].games
      
      if (!games || games.count === 0) {
        return []
      }
      
      for (let i = 0; i < games.count; i++) {
        if (!games[i] || !games[i].game) continue
        
        const game = games[i].game[0]
        
        if (!game || !game.game_key) continue
        
        // Filter by sport if specified
        if (sport && game.code.toLowerCase() !== sport.toLowerCase()) {
          continue
        }
        
        filteredGames.push(game)
      }
      
      // Yahoo doesn't provide a public league discovery API
      // This would require Yahoo to add this feature
      // For now, return a limited set based on available games
      
      // Note: This is a limitation of the Yahoo API
      console.warn('Public league search is limited due to Yahoo API restrictions')
      
      return []
    } catch (error) {
      console.error('Error searching public Yahoo leagues:', error)
      throw error
    }
  }
  
  /**
   * Check if the user has Yahoo tokens
   */
  async hasYahooTokens(): Promise<boolean> {
    try {
      const tokens = await this.getTokensFromFirestore();
      return tokens !== null;
    } catch (error) {
      console.error('Error checking Yahoo tokens:', error);
      return false;
    }
  }

  /**
   * Get the Yahoo OAuth URL for reconnecting
   */
  getYahooAuthUrl(): string {
    const YAHOO_CLIENT_ID = process.env.NEXT_PUBLIC_YAHOO_CLIENT_ID;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/yahoo/callback`;
    
    if (!YAHOO_CLIENT_ID) {
      throw new Error('Yahoo client ID not configured');
    }
    
    if (!REDIRECT_URI) {
      throw new Error('Redirect URI not configured');
    }
    
    const authUrl = new URL('https://api.login.yahoo.com/oauth2/request_auth');
    authUrl.searchParams.append('client_id', YAHOO_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('language', 'en-us');
    
    return authUrl.toString();
  }
}

/**
 * Create a Yahoo Fantasy Service instance for a user
 */
export function createYahooFantasyService(userId: string): YahooFantasyService {
  return new YahooFantasyService(userId)
}