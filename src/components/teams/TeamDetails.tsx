import React, { useState } from 'react';
import { YahooTeam } from '@/lib/services/yahooFantasyServices';
import Link from 'next/link';
import { User, Trophy, BarChart2, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface TeamDetailsProps {
  team: any; // Full team details from Yahoo
  leagueId: string;
}

export default function TeamDetails({ team, leagueId }: TeamDetailsProps) {
  const [showFullRoster, setShowFullRoster] = useState(false);

  // Group players by position for better organization
  const groupedRoster = team.roster ? team.roster.reduce((acc: any, player: any) => {
    const position = player.selected_position;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(player);
    return acc;
  }, {}) : {};

  // Sort positions in a logical order
  const positionOrder = ['QB', 'WR', 'RB', 'TE', 'K', 'DEF', 'BN', 'IR'];
  const sortedPositions = Object.keys(groupedRoster).sort((a, b) => {
    const aIndex = positionOrder.indexOf(a);
    const bIndex = positionOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Team Header */}
      <div className="p-6 border-b">
        <div className="flex items-center mb-4">
          {team.logo ? (
            <img 
              src={team.logo} 
              alt={`${team.name} logo`} 
              className="w-20 h-20 mr-4 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 mr-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <User className="h-10 w-10" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            <p className="text-gray-600">Manager: {team.manager_name}</p>
            {team.manager_email && (
              <p className="text-gray-500 text-sm">{team.manager_email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Team Stats Section */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-amber-500" />
          Team Performance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Standing</div>
            <div className="text-xl font-bold">{team.standing || 'N/A'}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Record</div>
            <div className="text-xl font-bold">{team.record || 'N/A'}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Points</div>
            <div className="text-xl font-bold">{team.points ? Number(team.points).toFixed(1) : 'N/A'}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Waiver Priority</div>
            <div className="text-xl font-bold">{team.waiver_priority || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Team Roster Section */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Users className="h-5 w-5 mr-2 text-indigo-600" />
            Team Roster
          </h2>
          {team.roster && team.roster.length > 0 && (
            <button 
              onClick={() => setShowFullRoster(!showFullRoster)}
              className="text-sm text-indigo-600 flex items-center"
            >
              {showFullRoster ? (
                <>Show Starters Only <ChevronUp className="ml-1 h-4 w-4" /></>
              ) : (
                <>Show Full Roster <ChevronDown className="ml-1 h-4 w-4" /></>
              )}
            </button>
          )}
        </div>

        {!team.roster || team.roster.length === 0 ? (
          <p className="text-gray-600 p-4 bg-gray-50 rounded-lg">Roster data not available.</p>
        ) : (
          <div className="space-y-4">
            {sortedPositions.map(position => {
              // Skip bench players if not showing full roster
              if (!showFullRoster && ['BN', 'IR', 'Bench', 'IL', 'Reserve'].includes(position)) {
                return null;
              }
              
              return (
                <div key={position} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h3 className="font-medium">{position === 'BN' ? 'Bench' : position}</h3>
                  </div>
                  <div className="divide-y">
                    {groupedRoster[position].map((player: any, index: number) => (
                      <div key={index} className="px-4 py-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-gray-500">
                            {player.team} • {player.position}
                          </div>
                        </div>
                        {player.status && player.status !== 'Active' && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                            {player.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}