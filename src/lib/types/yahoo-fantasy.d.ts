declare module 'yahoo-fantasy' {
  export default class YahooFantasy {
    constructor(
      clientId: string,
      clientSecret: string,
      tokenCallback?: (err: Error | null, tokens: any) => void,
      redirectUri?: string
    );
    
    auth(response: any, state?: string): void;
    authCallback(request: any, callback: (err: Error | null, tokens: any) => void): void;
    setUserToken(token: string): void;
    setRefreshToken(token: string): void;
    
    user: {
      games(callback: (err: Error | null, data: any) => void): void;
      game_leagues(gameKey: string, callback: (err: Error | null, data: any) => void): void;
    };
    
    league: {
      meta(leagueKey: string, callback: (err: Error | null, data: any) => void): void;
      standings(leagueKey: string, callback: (err: Error | null, data: any) => void): void;
      teams(leagueKey: string, callback: (err: Error | null, data: any) => void): void;
      players(leagueKey: string, callback: (err: Error | null, data: any) => void): void;
      scoreboard(leagueKey: string, week: number, callback: (err: Error | null, data: any) => void): void;
    };
    
    team: {
      meta(teamKey: string, callback: (err: Error | null, data: any) => void): void;
      stats(teamKey: string, callback: (err: Error | null, data: any) => void): void;
      roster(teamKey: string, callback: (err: Error | null, data: any) => void): void;
    };
    
    player: {
      meta(playerKey: string, callback: (err: Error | null, data: any) => void): void;
      stats(playerKey: string, week: number | string, callback: (err: Error | null, data: any) => void): void;
    };
  }
  
  // Define interfaces for the response data
  interface YahooGame {
    game_key: string;
    game_id: string;
    name: string;
    code: string;
    type: string;
    url: string;
    season: string;
    is_registration_over: number;
    is_game_over: number;
    is_offseason: number;
  }
  
  interface YahooLeague {
    league_key: string;
    league_id: string;
    name: string;
    url: string;
    draft_status: string;
    num_teams: number;
    edit_key: string;
    weekly_deadline: string;
    league_update_timestamp: string;
    scoring_type: string;
    league_type: string;
    renew: string;
    renewed: string;
    iris_group_chat_id: string;
    short_invitation_url: string;
    allow_add_to_dl_extra_pos: number;
    is_pro_league: number;
    is_cash_league: number;
    current_week: number;
    start_week: number;
    start_date: string;
    end_week: number;
    end_date: string;
    is_finished: number;
  }
  
  interface YahooTeam {
    team_key: string;
    team_id: string;
    name: string;
    url: string;
    team_logo: string;
    waiver_priority: number;
    number_of_moves: number;
    number_of_trades: number;
    managers: any[];
    team_standings: {
      rank: number;
      playoff_seed: number;
      outcome_totals: {
        wins: number;
        losses: number;
        ties: number;
        percentage: string;
      };
      points_for: number;
      points_against: number;
    };
  }
  
  interface YahooPlayer {
    player_key: string;
    player_id: string;
    name: {
      full: string;
      first: string;
      last: string;
      ascii_first: string;
      ascii_last: string;
    };
    editorial_player_key: string;
    editorial_team_key: string;
    editorial_team_full_name: string;
    editorial_team_abbr: string;
    uniform_number: string;
    display_position: string;
    headshot: {
      url: string;
      size: string;
    };
    is_undroppable: number;
    position_type: string;
    eligible_positions: string[];
  }
} 