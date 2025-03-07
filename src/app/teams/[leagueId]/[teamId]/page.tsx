'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import TeamDetails from '@/components/teams/TeamDetails';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';

export default function TeamDetailPage() {
  const params = useParams();
  const { leagueId, teamId } = params;
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const { user } = useAuth();

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      setError('');
      setErrorDetails('');
      console.debug(`Fetching details for team: ${teamId} in league: ${leagueId}`);
      
      if (!user?.uid) {
        throw new Error('You must be logged in to view team details');
      }
      
      // Construct the Yahoo team key format
      const teamKey = `${leagueId}.t.${teamId}`;
      const response = await fetch(`/api/yahoo/team-details?teamKey=${teamKey}&userId=${user.uid}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch team details');
      }
      
      const data = await response.json();
      console.debug('Received team details:', data.team);
      setTeam(data.team);
    } catch (err) {
      console.error('Error fetching team details:', err);
      if (err instanceof Error) {
        setError(err.message);
        setErrorDetails(err.stack || '');
      } else {
        setError('Failed to load team details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leagueId && teamId && user?.uid) {
      fetchTeamDetails();
    } else {
      setLoading(false);
      if (!user?.uid) {
        setError('You must be logged in to view team details');
      } else if (!leagueId || !teamId) {
        setError('Invalid team or league ID');
      }
    }
  }, [leagueId, teamId, user?.uid]);

  const handleRetry = () => {
    if (!loading) {
      fetchTeamDetails();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Link href={`/leagues/${leagueId}`} className="text-indigo-600 mb-6 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to League
        </Link>
        
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error Loading Team</h2>
          <p>{error}</p>
          
          {errorDetails && (
            <details className="mt-4">
              <summary className="text-sm cursor-pointer">Show technical details</summary>
              <pre className="mt-2 text-xs bg-red-100 p-3 rounded overflow-auto max-h-[200px]">
                {errorDetails}
              </pre>
            </details>
          )}
          
          <button 
            onClick={handleRetry} 
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md flex items-center w-fit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto p-4">
        <Link href={`/leagues/${leagueId}`} className="text-indigo-600 mb-6 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to League
        </Link>
        
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Team Not Found</h2>
          <p>The team you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Link href={`/leagues/${leagueId}`} className="text-indigo-600 mb-6 flex items-center inline-block">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to League
      </Link>
      
      <TeamDetails team={team} leagueId={leagueId as string} />
    </div>
  );
}