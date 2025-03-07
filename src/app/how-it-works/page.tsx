// src/app/how-it-works/page.tsx - Created a dedicated page to showcase the LeagueBrawl concept with marketing copy
import Link from 'next/link'
import { Trophy, Users, MessageSquare, Award, Zap, Star } from 'lucide-react'

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">LeagueBrawl</h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">Where Fantasy Leagues Unite and Compete</p>
            <p className="text-lg max-w-3xl mx-auto mb-8">
              Fantasy sports revolutionized fandom. Now LeagueBrawl is taking it to the next level.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* League vs League Section */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <Trophy className="h-8 w-8 text-indigo-600 mr-4" />
              <h2 className="text-3xl font-bold">League vs League: A New Way to Play</h2>
            </div>
            <p className="text-lg text-gray-700 mb-6">
              Imagine your fantasy league taking on another from across the country. Every week, each manager goes head to head with their counterpart from the rival league. Win your matchup? You score a point for your league. It's simple, exciting, and transforms the entire fantasy experience.
            </p>
            <div className="bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Every Matchup Matters</h3>
              <p className="text-gray-700">
                In LeagueBrawl, success is truly a team effort. Your Chicago league might be facing a talented crew from Boston, with the outcome hanging on every individual contest. Even if you're out of playoff contention in your regular league, your performance could be the difference maker in securing your league's victory for the week.
              </p>
            </div>
          </div>

          {/* More Than Individual Glory Section */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <Users className="h-8 w-8 text-indigo-600 mr-4" />
              <h2 className="text-3xl font-bold">More Than Individual Glory</h2>
            </div>
            <p className="text-lg text-gray-700 mb-6">
              The LeagueBrawl scoring system adds an extra layer of excitement to every fantasy season:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Each manager faces off against their counterpart from the opposing league</li>
              <li>Winners of individual matchups earn points for their league</li>
              <li>Weekly victories build toward season-long success</li>
              <li>Every manager's performance impacts the league's standing</li>
            </ul>
          </div>

          {/* Trash Talk Section */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <MessageSquare className="h-8 w-8 text-indigo-600 mr-4" />
              <h2 className="text-3xl font-bold">Trash Talk Elevated</h2>
            </div>
            <p className="text-lg text-gray-700 mb-6">
              LeagueBrawl turns friendly banter into an art form:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>AI Smack Generator crafts personalized burns based on your opponent's worst fantasy blunders</li>
              <li>Drop voice messages to celebrate clutch victories or console crushing defeats</li>
              <li>Launch perfectly timed memes from our ever-growing collection</li>
              <li>Watch rival leagues squirm as your trash talk game reaches new heights</li>
              <li>Cross-league chat channels where legends are made and egos are shattered</li>
            </ul>
          </div>

          {/* The Ultimate Prize Section */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <Award className="h-8 w-8 text-indigo-600 mr-4" />
              <h2 className="text-3xl font-bold">The Ultimate Prize</h2>
            </div>
            <p className="text-lg text-gray-700 mb-6">
              Victory in LeagueBrawl isn't just about online triumph. Winning leagues earn tickets to championship events in their respective sports. Experience the biggest games of the year alongside your league mates, creating memories that last a lifetime.
            </p>
          </div>

          {/* Last Place Becomes Legendary Section */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <Star className="h-8 w-8 text-indigo-600 mr-4" />
              <h2 className="text-3xl font-bold">Where Last Place Becomes Legendary</h2>
            </div>
            <p className="text-lg text-gray-700 mb-6">
              Picture this: It's the final week of playoffs. Your league needs one more win to secure tickets to the Super Bowl. The hopes of your entire league rest on the shoulders of your last place manager, who's barely set their lineup all season. Against all odds, they unleash their best performance of the year, their auto-drafted sleeper picks finally paying off at the perfect moment. Final score: victory. Next stop: Super Bowl Sunday with your entire league.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              These are the moments LeagueBrawl creates. Where every manager, regardless of their league standing, can become the hero of an epic season.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Every week brings new rivals. Every matchup writes new stories. Every victory adds to your league's legend.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to take your league to the next level?</h2>
            <p className="text-xl mb-8">Join LeagueBrawl today.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 text-base font-medium rounded-md shadow-sm">
                Get Started
              </Link>
              <Link href="/lobby" className="inline-flex items-center justify-center px-6 py-3 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-base font-medium rounded-md shadow-sm">
                Find Challenges
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 