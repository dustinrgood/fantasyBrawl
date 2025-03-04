export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: number
}

export interface Manager {
  id: string
  userId: string
  displayName: string
  avatarUrl?: string
  bio?: string
  leagueIds: string[]
}

export interface TeamRecord {
  wins: number
  losses: number
  ties: number
}

export interface League {
  id: string
  name: string
  description?: string
  sport: 'football' | 'basketball' | 'baseball' | 'hockey'
  createdAt: number
  createdBy: string // userId
  managerIds: string[]
  rosterSpots: RosterSpot[]
  scoringSystem: ScoringSystem
  isPublic: boolean
  currentRecord?: TeamRecord
  record?: string // For display purposes
}

export interface RosterSpot {
  position: string
  count: number
}

export interface ScoringSystem {
  type: 'standard' | 'ppr' | 'halfPpr' | 'custom'
  rules: Record<string, number> // e.g., { 'passingYards': 0.04, 'rushingYards': 0.1, ... }
}

export interface Challenge {
  id: string
  createdAt: number
  createdBy: string // userId
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  challengerLeagueId: string
  challengedLeagueId: string
  weekNumber: number
  season: number
  matchups: Matchup[]
  winnerLeagueId?: string
}

export interface Matchup {
  id: string
  challengeId: string
  challengerManagerId: string
  challengedManagerId: string
  challengerScore?: number
  challengedScore?: number
  winnerId?: string
  trashTalkMessages: TrashTalkMessage[]
}

export interface TrashTalkMessage {
  id: string
  matchupId: string
  senderId: string // managerId
  content: string
  createdAt: number
  type: 'text' | 'voice'
  mediaUrl?: string // URL to voice message if type is 'voice'
  isAiGenerated: boolean
}

export interface FantasyTeam {
  id: string
  managerId: string
  leagueId: string
  name: string
  logo?: string
  players: Player[]
  record: TeamRecord
}

export interface Player {
  id: string
  name: string
  position: string
  team: string
  stats: Record<string, number> // e.g., { 'passingYards': 300, 'rushingYards': 50, ... }
} 