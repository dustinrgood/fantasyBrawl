import { Metadata } from 'next'
import NBAPublicLeaguesPage from '@/components/NBAPublicLeaguesPage'

export const metadata: Metadata = {
  title: 'Public NBA Leagues | Fantasy League Challenge',
  description: 'Browse and import public NBA fantasy leagues from Yahoo',
}

export default function NBAPublicLeaguesRoute() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NBAPublicLeaguesPage />
    </div>
  )
} 