'use client'

import LeagueDetailsPage from '@/components/LeagueDetailsPage'

export default function LeagueDetails({ params }: { params: { leagueId: string } }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <LeagueDetailsPage leagueId={params.leagueId} />
    </div>
  )
}

export const metadata = {
  title: 'League Details | Fantasy League Challenge',
  description: 'View and import public fantasy league details',
} 