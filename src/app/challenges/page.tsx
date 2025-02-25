import AppNavbar from '../../components/AppNavbar'
import Link from 'next/link'
import { Plus, Eye, MessageSquare, Check, X } from 'lucide-react'

export default function ChallengesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Challenges</h1>
          <p className="text-lg text-gray-600">Manage your league challenges</p>
        </div>
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <Link 
            href="/challenges/new" 
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Find New Challenges
          </Link>
          
          <div className="w-full sm:w-auto">
            <select className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option>Active Challenges</option>
              <option>Pending Challenges</option>
              <option>Completed Challenges</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Active Challenge */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
              <h2 className="text-xl font-semibold mb-2 sm:mb-0">Fantasy Football League vs. Touchdown Titans</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">👥</span>
                <span>10 teams each</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">📅</span>
                <span>Week 12 • 2023-2024 Season</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">🏆</span>
                <span>Current Score: 5-5</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/challenges/1" 
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
              <Link 
                href="/challenges/1/trash-talk" 
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Trash Talk
              </Link>
            </div>
          </div>
          
          {/* Pending Challenge */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
              <h2 className="text-xl font-semibold mb-2 sm:mb-0">Basketball Champions vs. Hoop Dreams</h2>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Pending
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">👥</span>
                <span>8 teams each</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">📅</span>
                <span>Week 18 • 2023-2024 Season</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                Accept
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                <X className="h-4 w-4 mr-2" />
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 