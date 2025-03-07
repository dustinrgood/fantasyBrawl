import React, { useEffect, useState } from 'react';
import { YahooTeam } from '@/lib/services/yahooFantasyServices';
import TeamCard from './TeamCard';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface TeamsTabProps {
  leagueId: string;
  leagueKey: string; // Yahoo league key
}

export default function TeamsTab({ leagueId, leagueKey }: TeamsTabProps) {
  const [teams, setTeams] = useState<YahooTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [yahooAuthUrl, setYahooAuthUrl] = useState('');
  const { user } = useAuth();

  console.debug('TeamsTab rendered with:', { leagueId, leagueKey, userId: user?.uid });

  // Get Yahoo auth URL for reconnecting
  useEffect(() => {
    async function getYahooAuthUrl() {
      try {
        const response = await fetch('/api/yahoo/auth-url');
        if (response.ok) {
          const data = await response.json();
          setYahooAuthUrl(data.url);
        }
      } catch (err) {
        console.error('Error getting Yahoo auth URL:', err);
      }
    }

    getYahooAuthUrl();
  }, []);

  useEffect(() => {
    // Only fetch teams if we haven't already attempted to fetch them
    if (hasAttemptedFetch) {
      console.debug('Already attempted to fetch teams, skipping');
      return;
    }

    async function fetchTeams() {
      try {
        setLoading(true);
        setError('');
        setErrorDetails('');
        
        if (!user?.uid) {
          throw new Error('You must be logged in to view teams');
        }
        
        if (!leagueKey) {
          throw new Error('Invalid league key');
        }
        
        console.debug(`Fetching teams for league: ${leagueKey} with userId: ${user.uid.substring(0, 5)}...`);
        
        const response = await fetch(`/api/yahoo/league-teams?leagueKey=${leagueKey}&userId=${user.uid}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error response:', errorData);
          
          if (errorData.error && errorData.error.includes('not connected to Yahoo')) {
            throw new Error('You need to connect your Yahoo Fantasy account');
          } else if (errorData.error && errorData.error.includes('expired')) {
            throw new Error('Your Yahoo connection has expired. Please reconnect your account.');
          } else if (errorData.error && errorData.error.includes('League not found')) {
            throw new Error('League not found. Please check the league key and try again.');
          } else {
            throw new Error(errorData.error || 'Failed to fetch teams');
          }
        }
        
        const data = await response.json();
        console.debug(`Received ${data.teams?.length || 0} teams:`, data.teams);
        setTeams(data.teams || []);
      } catch (err) {
        console.error('Error fetching teams:', err);
        
        if (err instanceof Error) {
          setError(err.message);
          setErrorDetails(err.stack || '');
        } else {
          setError('Failed to load teams. Please try again later.');
        }
      } finally {
        setLoading(false);
        setHasAttemptedFetch(true);
      }
    }

    fetchTeams();
  }, [leagueKey, user?.uid, hasAttemptedFetch]);

  // Force a re-fetch when the component becomes visible
  const handleRefresh = () => {
    if (!loading) {
      setHasAttemptedFetch(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-gray-600">Loading teams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Error loading teams</p>
            <p className="text-sm">{error}</p>
            
            {(error.includes('connect your Yahoo') || error.includes('expired')) && (
              <div className="mt-2">
                <p className="text-sm">
                  {error.includes('connect your Yahoo') 
                    ? 'You need to connect your Yahoo Fantasy account to view teams.'
                    : 'Your Yahoo connection has expired. Please reconnect your account.'}
                </p>
                {yahooAuthUrl ? (
                  <a 
                    href={yahooAuthUrl} 
                    className="mt-2 inline-flex items-center text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                  >
                    Connect to Yahoo Fantasy <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                ) : (
                  <a 
                    href="/profile" 
                    className="mt-2 inline-flex items-center text-sm text-red-800 hover:text-red-900"
                  >
                    Go to Profile <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            )}
            
            {errorDetails && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer">Show technical details</summary>
                <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto max-h-[100px]">
                  {errorDetails}
                </pre>
              </details>
            )}
            
            <button 
              onClick={handleRefresh} 
              className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded flex items-center"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teams-container">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">League Teams</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{teams.length} teams</span>
          <button 
            onClick={handleRefresh} 
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
          </button>
        </div>
      </div>
      
      {teams.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">No teams found in this league.</p>
          <button 
            onClick={handleRefresh} 
            className="mt-3 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-1 rounded flex items-center mx-auto"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <TeamCard key={team.team_key} team={team} leagueId={leagueId} />
          ))}
        </div>
      )}
    </div>
  );
}