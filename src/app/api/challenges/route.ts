import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Query challenges where the user is either the challenger or the challenged
    const challengesRef = collection(db, 'challenges')
    const q = query(
      challengesRef,
      where('challengerId', '==', userId)
    )

    const querySnapshot = await getDocs(q)
    const challengesPromises = querySnapshot.docs.map(async (docSnap) => {
      const challengeData = docSnap.data()
      
      // Fetch league details
      const leagueRef = doc(db, 'leagues', challengeData.leagueId)
      const leagueSnap = await getDoc(leagueRef)
      const leagueData = leagueSnap.exists() ? leagueSnap.data() : null

      return {
        id: docSnap.id,
        ...challengeData,
        leagueName: leagueData?.name || `League ${challengeData.leagueId}`,
        sport: leagueData?.sport || null,
        teamCount: leagueData?.teamCount || null
      }
    })

    const challenges = await Promise.all(challengesPromises)

    return NextResponse.json({ challenges })

  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    )
  }
} 