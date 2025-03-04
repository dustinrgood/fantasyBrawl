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

// Check if Firebase is properly initialized
const isFirebaseInitialized = db && typeof db === 'object';

// Mock data for development without Firebase
const mockData = {
  users: [] as User[],
  managers: [] as Manager[],
  leagues: [] as League[],
  challenges: [] as Challenge[],
  matchups: [] as Matchup[],
  trashTalkMessages: [] as TrashTalkMessage[],
};

// User Services
export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
  if (!isFirebaseInitialized) {
    console.warn('Firebase not initialized. Using mock implementation.');
    const newUser = {
      ...userData,
      id: `mock-user-${Date.now()}`,
      createdAt: Date.now(),
    };
    mockData.users.push(newUser as User);
    return newUser.id;
  }

  const userRef = await addDoc(collection(db, 'users'), {
    ...userData,
    createdAt: serverTimestamp(),
  })
  return userRef.id
}

export const getUserById = async (userId: string): Promise<User | null> => {
  if (!isFirebaseInitialized) {
    console.warn('Firebase not initialized. Using mock implementation.');
    return mockData.users.find(user => user.id === userId) || null;
  }

  const userDoc = await getDoc(doc(db, 'users', userId))
  if (!userDoc.exists()) return null
  return { id: userDoc.id, ...userDoc.data() } as User
}

// Manager Services
export const createManager = async (managerData: Omit<Manager, 'id'>) => {
  if (!isFirebaseInitialized) {
    console.warn('Firebase not initialized. Using mock implementation.');
    const newManager = {
      ...managerData,
      id: `mock-manager-${Date.now()}`,
    };
    mockData.managers.push(newManager as Manager);
    return newManager.id;
  }

  const managerRef = await addDoc(collection(db, 'managers'), managerData)
  return managerRef.id
}

export const getManagerById = async (managerId: string): Promise<Manager | null> => {
  if (!isFirebaseInitialized) {
    console.warn('Firebase not initialized. Using mock implementation.');
    return mockData.managers.find(manager => manager.id === managerId) || null;
  }

  const managerDoc = await getDoc(doc(db, 'managers', managerId))
  if (!managerDoc.exists()) return null
  return { id: managerDoc.id, ...managerDoc.data() } as Manager
}

export const getManagersByUserId = async (userId: string): Promise<Manager[]> => {
  if (!isFirebaseInitialized) {
    console.warn('Firebase not initialized. Using mock implementation.');
    return mockData.managers.filter(manager => manager.userId === userId);
  }

  const managersQuery = query(collection(db, 'managers'), where('userId', '==', userId))
  const managersSnapshot = await getDocs(managersQuery)
  return managersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Manager))
}

export const updateManager = async (managerId: string, data: Partial<Manager>) => {
  if (!isFirebaseInitialized) {
    console.warn('Firebase not initialized. Using mock implementation.');
    const managerIndex = mockData.managers.findIndex(manager => manager.id === managerId);
    if (managerIndex !== -1) {
      mockData.managers[managerIndex] = { ...mockData.managers[managerIndex], ...data };
    }
    return;
  }

  await updateDoc(doc(db, 'managers', managerId), data)
}

// League Services
export const createLeague = async (leagueData: Omit<League, 'id' | 'createdAt'>) => {
  if (!isFirebaseInitialized) {
    console.warn('Firebase not initialized. Using mock implementation.');
    const newLeague = {
      ...leagueData,
      id: `mock-league-${Date.now()}`,
      createdAt: Date.now(),
    };
    mockData.leagues.push(newLeague as League);
    return newLeague.id;
  }

  const leagueRef = await addDoc(collection(db, 'leagues'), {
    ...leagueData,
    createdAt: serverTimestamp(),
  })
  return leagueRef.id
}

export const getLeagueById = async (leagueId: string): Promise<League | null> => {
  if (!isFirebaseInitialized) {
    console.warn('Firebase not initialized. Using mock implementation.');
    return mockData.leagues.find(league => league.id === leagueId) || null;
  }

  const leagueDoc = await getDoc(doc(db, 'leagues', leagueId))
  if (!leagueDoc.exists()) return null
  return { id: leagueDoc.id, ...leagueDoc.data() } as League
}

export const getLeaguesByManagerId = async (managerId: string): Promise<League[]> => {
  if (!isFirebaseInitialized) {
    console.warn('Firebase not initialized. Using mock implementation.');
    // Create some mock leagues for development
    if (mockData.leagues.length === 0) {
      mockData.leagues = [
        {
          id: 'mock-league-1',
          name: 'Mock Football League',
          description: 'A mock football league for development',
          sport: 'football',
          createdAt: Date.now(),
          createdBy: 'mock-user-1',
          managerIds: [managerId],
          rosterSpots: [
            { position: 'QB', count: 1 },
            { position: 'RB', count: 2 },
            { position: 'WR', count: 2 },
            { position: 'TE', count: 1 },
            { position: 'FLEX', count: 1 },
            { position: 'K', count: 1 },
            { position: 'DEF', count: 1 },
          ],
          scoringSystem: {
            type: 'ppr',
            rules: {
              passingYards: 0.04,
              passingTD: 4,
              rushingYards: 0.1,
              rushingTD: 6,
              reception: 1,
              receivingYards: 0.1,
              receivingTD: 6,
            },
          },
          isPublic: true,
          currentRecord: { wins: 5, losses: 2, ties: 0 },
        } as League,
        {
          id: 'mock-league-2',
          name: 'Mock Basketball League',
          description: 'A mock basketball league for development',
          sport: 'basketball',
          createdAt: Date.now(),
          createdBy: 'mock-user-1',
          managerIds: [managerId],
          rosterSpots: [
            { position: 'PG', count: 1 },
            { position: 'SG', count: 1 },
            { position: 'SF', count: 1 },
            { position: 'PF', count: 1 },
            { position: 'C', count: 1 },
            { position: 'G', count: 1 },
            { position: 'F', count: 1 },
            { position: 'UTIL', count: 2 },
          ],
          scoringSystem: {
            type: 'standard',
            rules: {
              points: 1,
              rebounds: 1.2,
              assists: 1.5,
              steals: 3,
              blocks: 3,
              turnovers: -1,
            },
          },
          isPublic: true,
          currentRecord: { wins: 3, losses: 4, ties: 0 },
        } as League,
      ];
    }
    return mockData.leagues.filter(league => league.managerIds.includes(managerId));
  }

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
  if (!isFirebaseInitialized) {
    console.warn('Firebase not initialized. Using mock implementation.');
    // Create some mock challenges for development
    if (mockData.challenges.length === 0) {
      mockData.challenges = [
        {
          id: 'mock-challenge-1',
          createdAt: Date.now(),
          createdBy: 'mock-user-1',
          status: 'accepted',
          challengerLeagueId: 'mock-league-1',
          challengedLeagueId: 'mock-league-2',
          weekNumber: 5,
          season: 2023,
          matchups: [
            { id: 'mock-matchup-1' },
            { id: 'mock-matchup-2' },
          ],
        } as Challenge,
        {
          id: 'mock-challenge-2',
          createdAt: Date.now(),
          createdBy: 'mock-user-2',
          status: 'pending',
          challengerLeagueId: 'mock-league-2',
          challengedLeagueId: 'mock-league-1',
          weekNumber: 6,
          season: 2023,
          matchups: [],
        } as Challenge,
      ];
    }
    return mockData.challenges.filter(
      challenge => challenge.challengerLeagueId === leagueId || challenge.challengedLeagueId === leagueId
    );
  }

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