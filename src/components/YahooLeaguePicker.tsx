'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import YahooAuthButton from '@/components/YahooAuthButton'

interface YahooLeague {
  league_id: string
  name: string
  season: string
  sport: string
  num_teams: number
  scoring_type: string
  is_finished: boolean
}

export default function YahooLeaguePicker() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const [leagues, setLeagues] = useState<YahooLeague[]>([])
  const [selectedLeagues, setSelectedLeagues] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingTokens, setProcessingTokens] = useState(false)
  
  // Handle tokens from URL
  useEffect(() => {
    const handleTokensFromUrl = async () => {
      if (!user) return;
      
      const success = searchParams.get('success');
      const tokensParam = searchParams.get('tokens');
      
      if (success === 'true' && tokensParam) {
        try {
          setProcessingTokens(true);
          console.debug('Processing Yahoo tokens from URL');
          
          // Parse tokens from URL
          const tokens = JSON.parse(tokensParam);
          console.debug('Parsed tokens:', { 
            access_token_prefix: tokens.access_token ? tokens.access_token.substring(0, 10) + '...' : 'undefined',
            refresh_token_prefix: tokens.refresh_token ? tokens.refresh_token.substring(0, 10) + '...' : 'undefined',
            expires_at: tokens.expires_at
          });
          
          // Store tokens using the server API
          const response = await fetch('/api/auth/yahoo/store-tokens', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: user.uid,
              tokens: {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: tokens.expires_at
              }
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response from store-tokens:', errorData);
            throw new Error(errorData.error || 'Failed to store tokens');
          }
          
          console.debug('Yahoo tokens stored successfully');
          
          // Remove tokens from URL (for security)
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('tokens');
          window.history.replaceState({}, '', newUrl.toString());
          
          // Wait a moment for the tokens to be properly stored
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Refresh the page to fetch leagues with the new tokens
          window.location.reload();
        } catch (error) {
          console.error('Error storing Yahoo tokens:', error);
          setError('Failed to store Yahoo authentication. Please try again.');
        } finally {
          setProcessingTokens(false);
        }
      }
    };
    
    if (!loading) {
      handleTokensFromUrl();
    }
  }, [user, loading, searchParams, router]);
  
  // Fetch Yahoo leagues
  useEffect(() => {
    const fetchYahooLeagues = async () => {
      if (!user || processingTokens) {
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.debug('Fetching Yahoo leagues for user:', user.uid);
        
        const response = await fetch('/api/yahoo/leagues', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user.uid })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response from leagues API:', errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.error || `Failed to fetch Yahoo leagues: ${response.status}`);
          } catch (e) {
            throw new Error(`Failed to fetch Yahoo leagues: ${response.status} - ${errorText.substring(0, 100)}`);
          }
        }
        
        const data = await response.json();
        console.debug('Leagues API response:', data);
        
        setLeagues(data.leagues || []);
        
        // Initialize selected leagues (all selected by default)
        const initialSelected: Record<string, boolean> = {};
        (data.leagues || []).forEach((league: YahooLeague) => {
          initialSelected[league.league_id] = true;
        });
        setSelectedLeagues(initialSelected);
      } catch (error) {
        console.error('Error fetching Yahoo leagues:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch Yahoo leagues');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!loading && user && !processingTokens) {
      fetchYahooLeagues();
    } else if (!loading && !user) {
      router.push('/login?redirect=/leagues/yahoo-picker');
    }
  }, [user, loading, router, processingTokens]);
  
  // Handle league selection
  const toggleLeagueSelection = (leagueId: string) => {
    setSelectedLeagues(prev => ({
      ...prev,
      [leagueId]: !prev[leagueId]
    }));
  };
  
  // Handle import
  const handleImport = async () => {
    if (!user) {
      router.push('/login?redirect=/leagues/yahoo-picker');
      return;
    }
    
    const leaguesToImport = Object.entries(selectedLeagues)
      .filter(([_, isSelected]) => isSelected)
      .map(([leagueId]) => leagueId);
    
    if (leaguesToImport.length === 0) {
      alert('Please select at least one league to import');
      return;
    }
    
    try {
      setIsImporting(true);
      
      const response = await fetch('/api/yahoo/import-leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.uid,
          leagueIds: leaguesToImport
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import leagues');
      }
      
      // Redirect to my leagues page
      router.push('/leagues/my');
    } catch (error) {
      console.error('Error importing leagues:', error);
      alert(error instanceof Error ? error.message : 'Failed to import leagues');
      setIsImporting(false);
    }
  };
  
  // Redirect if not logged in
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div>
      <div className="mb-6">
        <Link href="/leagues/my" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to My Leagues
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 mb-4">{error}</p>
          <p className="text-gray-700 mb-4">
            You may need to connect or reconnect your Yahoo account.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <YahooAuthButton />
            <button
              onClick={() => router.refresh()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
            <Link
              href="/leagues/my"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Go Back
            </Link>
          </div>
        </div>
      ) : leagues.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-700 mb-4">
            No Yahoo Fantasy leagues found for your account. Make sure you have active leagues in Yahoo Fantasy.
          </p>
          <p className="text-gray-700 mb-4">
            If you have leagues in Yahoo Fantasy but don't see them here, you may need to reconnect your account.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <YahooAuthButton />
            <Link
              href="/leagues/my"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to My Leagues
            </Link>
            <a
              href="https://fantasy.yahoo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Go to Yahoo Fantasy
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Your Yahoo Fantasy Leagues</h2>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      const allSelected = leagues.every(league => selectedLeagues[league.league_id]);
                      const newSelection: Record<string, boolean> = {};
                      
                      leagues.forEach(league => {
                        newSelection[league.league_id] = !allSelected;
                      });
                      
                      setSelectedLeagues(newSelection);
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {leagues.every(league => selectedLeagues[league.league_id])
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                </div>
              </div>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {leagues.map(league => (
                <li key={league.league_id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`league-${league.league_id}`}
                        checked={selectedLeagues[league.league_id] || false}
                        onChange={() => toggleLeagueSelection(league.league_id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`league-${league.league_id}`}
                        className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        <div className="font-medium">{league.name}</div>
                        <div className="text-gray-500 text-xs">
                          {league.sport.toUpperCase()} • Season: {league.season} • Teams: {league.num_teams}
                        </div>
                      </label>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleImport}
              disabled={isImporting || leagues.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Selected Leagues'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
} 