'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import TeamDetails from '@/components/teams/TeamDetails';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function TeamDetailPage() {
  const params = useParams();
  const { leagueId, teamId } = params;
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    async function fetchTeamDetails() {
      try {
        setLoading(true);
        console.debug(`Fetching details for team: ${teamId} in league: ${leagueId}`);
        
        // Construct the Yahoo team key format
        const teamKey = `${leagueId}.t.${teamId}`;
        const response = await fetch(`/api/yahoo/team-details?teamKey=${teamKey}&userId=${user?.uid}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch team details');
        }
        
        const data = await response.json();
        console.debug('Received team details:', data.team);
        setTeam(data.team);
      } catch (err) {
        console.error('Error fetching team details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load team details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

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