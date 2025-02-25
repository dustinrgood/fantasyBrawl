import { db } from '../firebase/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import {
  User,
  Manager,
  League,
  Challenge,
  Matchup,
  TrashTalkMessage,
  FantasyTeam,
  Player,
} from '../types/fantasy'

// User Services
export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
  const userRef = await addDoc(collection(db, 'users'), {
    ...userData,
    createdAt: serverTimestamp(),
  })
  return userRef.id
}

export const getUserById = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId))
  if (!userDoc.exists()) return null
  return { id: userDoc.id, ...userDoc.data() } as User
}

// Manager Services
export const createManager = async (managerData: Omit<Manager, 'id'>) => {
  const managerRef = await addDoc(collection(db, 'managers'), managerData)
  return managerRef.id
}

export const getManagerById = async (managerId: string): Promise<Manager | null> => {
  const managerDoc = await getDoc(doc(db, 'managers', managerId))
  if (!managerDoc.exists()) return null
  return { id: managerDoc.id, ...managerDoc.data() } as Manager
}

export const getManagersByUserId = async (userId: string): Promise<Manager[]> => {
  const managersQuery = query(collection(db, 'managers'), where('userId', '==', userId))
  const managersSnapshot = await getDocs(managersQuery)
  return managersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Manager))
}

export const updateManager = async (managerId: string, data: Partial<Manager>) => {
  await updateDoc(doc(db, 'managers', managerId), data)
}

// League Services
export const createLeague = async (leagueData: Omit<League, 'id' | 'createdAt'>) => {
  const leagueRef = await addDoc(collection(db, 'leagues'), {
    ...leagueData,
    createdAt: serverTimestamp(),
  })
  return leagueRef.id
}

export const getLeagueById = async (leagueId: string): Promise<League | null> => {
  const leagueDoc = await getDoc(doc(db, 'leagues', leagueId))
  if (!leagueDoc.exists()) return null
  return { id: leagueDoc.id, ...leagueDoc.data() } as League
}

export const getLeaguesByManagerId = async (managerId: string): Promise<League[]> => {
  const leaguesQuery = query(
    collection(db, 'leagues'),
    where('managerIds', 'array-contains', managerId)
  )
  const leaguesSnapshot = await getDocs(leaguesQuery)
  return leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as League))
}

export const updateLeague = async (leagueId: string, data: Partial<League>) => {
  await updateDoc(doc(db, 'leagues', leagueId), data)
}

export const deleteLeague = async (leagueId: string) => {
  await deleteDoc(doc(db, 'leagues', leagueId))
}

// Find compatible leagues
export const findCompatibleLeagues = async (leagueId: string): Promise<League[]> => {
  const league = await getLeagueById(leagueId)
  if (!league) return []

  // Get all leagues of the same sport
  const leaguesQuery = query(
    collection(db, 'leagues'),
    where('sport', '==', league.sport),
    where('isPublic', '==', true)
  )
  const leaguesSnapshot = await getDocs(leaguesQuery)
  
  // Filter leagues with the same number of managers and roster spots
  return leaguesSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as League))
    .filter(otherLeague => 
      otherLeague.id !== leagueId && 
      otherLeague.managerIds.length === league.managerIds.length &&
      areRosterSpotsCompatible(league.rosterSpots, otherLeague.rosterSpots)
    )
}

// Helper function to check if roster spots are compatible
const areRosterSpotsCompatible = (spots1: any[], spots2: any[]): boolean => {
  if (spots1.length !== spots2.length) return false
  
  // Create maps of position to count for both roster configurations
  const map1 = spots1.reduce((acc, spot) => {
    acc[spot.position] = (acc[spot.position] || 0) + spot.count
    return acc
  }, {} as Record<string, number>)
  
  const map2 = spots2.reduce((acc, spot) => {
    acc[spot.position] = (acc[spot.position] || 0) + spot.count
    return acc
  }, {} as Record<string, number>)
  
  // Check if all positions have the same count
  for (const position in map1) {
    if (map1[position] !== map2[position]) return false
  }
  
  // Check if map2 has any positions not in map1
  for (const position in map2) {
    if (map1[position] === undefined) return false
  }
  
  return true
}

// Challenge Services
export const createChallenge = async (challengeData: Omit<Challenge, 'id' | 'createdAt' | 'matchups'>) => {
  const challengeRef = await addDoc(collection(db, 'challenges'), {
    ...challengeData,
    createdAt: serverTimestamp(),
    matchups: [],
    status: 'pending',
  })
  return challengeRef.id
}

export const getChallengeById = async (challengeId: string): Promise<Challenge | null> => {
  const challengeDoc = await getDoc(doc(db, 'challenges', challengeId))
  if (!challengeDoc.exists()) return null
  return { id: challengeDoc.id, ...challengeDoc.data() } as Challenge
}

export const getChallengesByLeagueId = async (leagueId: string): Promise<Challenge[]> => {
  const challengesQuery = query(
    collection(db, 'challenges'),
    where('challengerLeagueId', '==', leagueId)
  )
  const challengedQuery = query(
    collection(db, 'challenges'),
    where('challengedLeagueId', '==', leagueId)
  )
  
  const [challengerSnapshot, challengedSnapshot] = await Promise.all([
    getDocs(challengesQuery),
    getDocs(challengedQuery)
  ])
  
  const challenges = [
    ...challengerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge)),
    ...challengedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge))
  ]
  
  return challenges
}

export const updateChallenge = async (challengeId: string, data: Partial<Challenge>) => {
  await updateDoc(doc(db, 'challenges', challengeId), data)
}

export const deleteChallenge = async (challengeId: string) => {
  await deleteDoc(doc(db, 'challenges', challengeId))
}

// Matchup Services
export const createMatchup = async (matchupData: Omit<Matchup, 'id' | 'trashTalkMessages'>) => {
  const matchupRef = await addDoc(collection(db, 'matchups'), {
    ...matchupData,
    trashTalkMessages: [],
  })
  
  // Update the challenge with the new matchup ID
  const challengeDoc = await getDoc(doc(db, 'challenges', matchupData.challengeId))
  if (challengeDoc.exists()) {
    const challenge = challengeDoc.data() as Challenge
    await updateDoc(doc(db, 'challenges', matchupData.challengeId), {
      matchups: [...(challenge.matchups || []), { id: matchupRef.id }],
    })
  }
  
  return matchupRef.id
}

export const getMatchupById = async (matchupId: string): Promise<Matchup | null> => {
  const matchupDoc = await getDoc(doc(db, 'matchups', matchupId))
  if (!matchupDoc.exists()) return null
  return { id: matchupDoc.id, ...matchupDoc.data() } as Matchup
}

export const getMatchupsByChallengeId = async (challengeId: string): Promise<Matchup[]> => {
  const matchupsQuery = query(
    collection(db, 'matchups'),
    where('challengeId', '==', challengeId)
  )
  const matchupsSnapshot = await getDocs(matchupsQuery)
  return matchupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Matchup))
}

export const updateMatchup = async (matchupId: string, data: Partial<Matchup>) => {
  await updateDoc(doc(db, 'matchups', matchupId), data)
}

// Trash Talk Message Services
export const createTrashTalkMessage = async (messageData: Omit<TrashTalkMessage, 'id' | 'createdAt'>) => {
  const messageRef = await addDoc(collection(db, 'trashTalkMessages'), {
    ...messageData,
    createdAt: serverTimestamp(),
  })
  
  // Update the matchup with the new message ID
  const matchupDoc = await getDoc(doc(db, 'matchups', messageData.matchupId))
  if (matchupDoc.exists()) {
    const matchup = matchupDoc.data() as Matchup
    await updateDoc(doc(db, 'matchups', messageData.matchupId), {
      trashTalkMessages: [...(matchup.trashTalkMessages || []), { id: messageRef.id }],
    })
  }
  
  return messageRef.id
}

export const getTrashTalkMessagesByMatchupId = async (matchupId: string): Promise<TrashTalkMessage[]> => {
  const messagesQuery = query(
    collection(db, 'trashTalkMessages'),
    where('matchupId', '==', matchupId),
    orderBy('createdAt', 'asc')
  )
  const messagesSnapshot = await getDocs(messagesQuery)
  return messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrashTalkMessage))
} 