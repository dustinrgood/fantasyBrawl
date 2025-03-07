import React from 'react';
import { YahooTeam } from '@/lib/services/yahooFantasyServices';
import Link from 'next/link';
import { Trophy, User, ArrowRight, Shield } from 'lucide-react';

interface TeamCardProps {
  team: YahooTeam;
  leagueId: string;
}

export default function TeamCard({ team, leagueId }: TeamCardProps) {
  // Generate a fallback ID if team_id is missing
  const teamId = team?.team_id || `unknown-${Math.random().toString(36).substring(2, 9)}`;
  
  // Handle case where team data might be incomplete
  if (!team || !team.team_key) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 mr-3 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-400">Unknown Team</h3>
            <p className="text-sm text-gray-400">Missing data</p>
          </div>
        </div>
      </div>
    );
  }

  // For team details page, we'll use the team_id from the team object
  const teamDetailsUrl = `/teams/${leagueId}/${teamId}`;
  
  // Format the team name and manager name for display
  const displayName = team.name || `Team ${team.team_id}`;
  const displayManager = team.manager_name || 'Unknown Manager';

  return (
    <Link href={teamDetailsUrl}>
      <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white hover:border-indigo-300">
        <div className="flex items-center mb-4">
          {team.logo ? (
            <img 
              src={team.logo} 
              alt={`${displayName} logo`} 
              className="w-12 h-12 mr-3 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                // Replace broken image with a fallback
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMjFWMTlDMjAgMTcuOTM5MSAxOS41Nzg2IDE2LjkyMTcgMTguODI4NCAxNi4xNzE2QzE4LjA3ODMgMTUuNDIxNCAxNy4wNjA5IDE1IDE2IDE1SDhDNi45MzkxIDE1IDUuOTIxNzIgMTUuNDIxNCA1LjE3MTU3IDE2LjE3MTZDNC40MjE0MyAxNi45MjE3IDQgMTcuOTM5MSA0IDE5VjIxIj48L3BhdGg+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ij48L2NpcmNsZT48L3N2Zz4=';
              }}
            />
          ) : (
            <div className="w-12 h-12 mr-3 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <User className="h-6 w-6" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg">{displayName}</h3>
            <p className="text-sm text-gray-600">
              Manager: {displayManager}
            </p>
          </div>
        </div>
        
        <div className="border-t pt-3 mt-2">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {team.standing && (
              <div className="flex items-center">
                <Trophy className="h-4 w-4 text-amber-500 mr-1" />
                <span className="text-sm">Rank: {team.standing}</span>
              </div>
            )}
            
            {team.waiver_priority && (
              <div className="text-sm text-gray-600 flex items-center">
                <Shield className="h-4 w-4 text-indigo-500 mr-1" />
                <span>Waiver: #{team.waiver_priority}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-2">
          <span className="text-sm text-indigo-600 flex items-center">
            View details <ArrowRight className="h-3 w-3 ml-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}