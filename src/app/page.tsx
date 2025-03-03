// src/app/page.tsx
import Link from 'next/link'
import { Trophy, Users, MessageSquare } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Fantasy League Challenge</h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">Take your fantasy sports competition to the next level by challenging other leagues</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/dashboard" className="inline-flex items-center justify-center px-4 py-2 bg-white text-indigo-600 hover:bg-gray-100 text-sm font-medium rounded-md shadow-sm">
                Get Started
              </Link>
              <Link href="/lobby" className="inline-flex items-center justify-center px-4 py-2 border border-white text-white hover:bg-indigo-700 text-sm font-medium rounded-md shadow-sm">
                Find Challenges
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">League vs League</h3>
              <p className="text-gray-600 text-center">
                Challenge other compatible leagues and compete for bragging rights. Leagues with the same number of managers and roster spots can face off.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Manager Matchups</h3>
              <p className="text-gray-600 text-center">
                Each manager in your league will face off against a manager in the opposing league. The team with the most wins takes the crown.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">AI-Powered Trash Talk</h3>
              <p className="text-gray-600 text-center">
                Generate hilarious and personalized trash talk using AI. Send text or voice messages to your opponents to spice up the competition.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to elevate your fantasy experience?</h2>
            <p className="text-xl mb-8">Join the challenge today and take your fantasy league to the next level.</p>
            <Link href="/dashboard" className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium rounded-md shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}