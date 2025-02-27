import { db } from '@/lib/firebase/firebase'
import { doc, collection, addDoc, getDoc, getDocs, updateDoc, query, where, serverTimestamp, setDoc, arrayUnion } from 'firebase/firestore'
import { League } from '@/lib/types/fantasy'
import { auth } from '@/lib/firebase/firebase'

/**
 * Save a public league to the user's leagues collection
 */
export const importPublicLeague = async (league: League): Promise<string> => {
  try {
    // Get the current user from Firebase Auth
    const auth = (await import('@/lib/firebase/firebase')).auth
    const user = auth.currentUser
    
    if (!user) {
      throw new Error('You must be logged in to import a league')
    }
    
    // Create a new league ID
    const importedLeagueId = `imported-${league.id}-${Date.now()}`
    
    // Create the imported league object
    const importedLeague = {
      ...league,
      id: importedLeagueId,
      importedFrom: league.id,
      importedAt: new Date().toISOString(),
      ownerId: user.uid
    }
    
    // Store the imported league in Firestore
    const leagueDocRef = doc(db, 'leagues', importedLeagueId)
    await setDoc(leagueDocRef, importedLeague)
    
    // Add the league to the user's imported leagues
    const userDocRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userDocRef)
    
    if (userDoc.exists()) {
      // Update the existing user document
      await updateDoc(userDocRef, {
        importedLeagues: arrayUnion(importedLeagueId)
      })
    } else {
      // Create a new user document
      await setDoc(userDocRef, {
        importedLeagues: [importedLeagueId]
      })
    }
    
    return importedLeagueId
  } catch (error) {
    console.error('Error importing public league:', error)
    throw error
  }
}

/**
 * Get all leagues created or imported by the current user
 */
export const getUserLeagues = async (): Promise<League[]> => {
  try {
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      return []
    }
    
    const leaguesQuery = query(
      collection(db, 'leagues'),
      where('createdBy', '==', currentUser.uid)
    )
    
    const leaguesSnapshot = await getDocs(leaguesQuery)
    
    return leaguesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as League))
  } catch (error) {
    console.error('Error fetching user leagues:', error)
    return []
  }
}

/**
 * Get a specific league by ID
 */
export const getLeagueById = async (leagueId: string): Promise<League | null> => {
  try {
    const leagueDoc = await getDoc(doc(db, 'leagues', leagueId))
    
    if (!leagueDoc.exists()) {
      return null
    }
    
    return {
      id: leagueDoc.id,
      ...leagueDoc.data()
    } as League
  } catch (error) {
    console.error(`Error fetching league with ID ${leagueId}:`, error)
    return null
  }
}

/**
 * Check if the current user has permission to access the league
 */
export const checkLeaguePermission = async (leagueId: string): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      return false
    }
    
    const leagueDoc = await getDoc(doc(db, 'leagues', leagueId))
    
    if (!leagueDoc.exists()) {
      return false
    }
    
    const league = leagueDoc.data() as League
    
    // Check if user is the creator
    if (league.createdBy === currentUser.uid) {
      return true
    }
    
    // Check if user is a manager
    if (league.managerIds.includes(currentUser.uid)) {
      return true
    }
    
    // Check if league is public
    if (league.isPublic) {
      return true
    }
    
    return false
  } catch (error) {
    console.error(`Error checking permission for league ${leagueId}:`, error)
    return false
  }
}

/**
 * Delete a league
 */
export const deleteLeague = async (leagueId: string): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      throw new Error('You must be logged in to delete a league')
    }
    
    const leagueDoc = await getDoc(doc(db, 'leagues', leagueId))
    
    if (!leagueDoc.exists()) {
      throw new Error('League not found')
    }
    
    const league = leagueDoc.data() as League
    
    // Check if user is the creator
    if (league.createdBy !== currentUser.uid) {
      throw new Error('You do not have permission to delete this league')
    }
    
    // Delete the league
    await updateDoc(doc(db, 'leagues', leagueId), {
      deleted: true,
      deletedAt: serverTimestamp()
    })
    
    // We're doing a soft delete here, but you could use deleteDoc instead
    // await deleteDoc(doc(db, 'leagues', leagueId))
    
    return true
  } catch (error) {
    console.error(`Error deleting league ${leagueId}:`, error)
    throw error
  }
}