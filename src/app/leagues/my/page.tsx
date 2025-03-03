import ImportedYahooLeagues from '@/components/ImportedYahooLeagues'
import { ArrowLeft, Activity } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'My Leagues | Fantasy League Challenge',
  description: 'View and manage your imported fantasy leagues',
}

export default function MyLeaguesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-default py-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Leagues</h1>
              <p className="text-gray-600">
                View and manage your imported fantasy leagues
              </p>
            </div>
            <div className="mt-4 md:mt-0 space-x-2">
              <Link 
                href="/leagues/public" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Public Leagues
              </Link>
              <Link 
                href="/leagues/nba-public" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Activity className="h-4 w-4 mr-1" />
                NBA Leagues
              </Link>
            </div>
          </div>
        </div>
        
        <ImportedYahooLeagues />
        
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">About My Leagues</h3>
          <p className="text-blue-700 mb-4">
            This page shows all the fantasy leagues you've imported from Yahoo. With your leagues, you can:
          </p>
          <ul className="list-disc list-inside text-blue-700 space-y-2">
            <li>View detailed league information and team standings</li>
            <li>Create challenges against other leagues</li>
            <li>Track your league's performance in challenges</li>
            <li>Import additional leagues from Yahoo</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 