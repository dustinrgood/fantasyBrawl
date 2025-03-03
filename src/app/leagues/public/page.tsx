import PublicLeaguesPage from '@/components/PublicLeaguesPage'
import Navigation from '@/components/Navigation'

export const metadata = {
  title: 'Public Leagues | Fantasy League Challenge',
  description: 'Browse and import public fantasy leagues',
}

export default function PublicLeaguesRoute() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <PublicLeaguesPage />
    </div>
  )
} 