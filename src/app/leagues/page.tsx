import Navigation from '../../components/Navigation'
import Link from 'next/link'
import { Plus, Trophy, Users, Calendar, ArrowRight } from 'lucide-react'

export default function Leagues() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container-default section-padding">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="page-header">
            <h1 className="page-title">My Leagues</h1>
            <p className="page-subtitle">Manage your fantasy leagues</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link 
              href="/leagues/create" 
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create League
            </Link>
          </div>
        </div>
        
        {/* League List */}
        <div className="space-y-6">
          {/* League Card 1 */}
          <div className="card p-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <Trophy className="h-6 w-6 text-indigo-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">Fantasy Football League</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>10 teams</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>2023-2024 Season</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span>Yahoo Fantasy</span>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Link href="/leagues/1" className="btn btn-primary">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View League
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* League Card 2 */}
          <div className="card p-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <Trophy className="h-6 w-6 text-indigo-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">Basketball Champions</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>8 teams</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>2023-2024 Season</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span>Yahoo Fantasy</span>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Link href="/leagues/2" className="btn btn-primary">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View League
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 