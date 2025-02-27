import LeagueDetailsPage from '@/components/LeagueDetailsPage'
import Navigation from '@/components/Navigation'

interface PublicLeagueDetailsProps {
  params: {
    leagueId: string
  }
}

export const metadata = {
  title: 'League Details | Fantasy League Challenge',
  description: 'View and import public fantasy league details',
}

export default function PublicLeagueDetailsRoute({ params }: PublicLeagueDetailsProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <LeagueDetailsPage leagueId={params.leagueId} />
    </div>
  )
} 