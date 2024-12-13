import { auth } from '@clerk/nextjs/server'
import { SignOutButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { getUserByClerkId } from '../utils/user'
import LadderStandings from '../components/LadderStandings'
import { revalidatePath } from 'next/cache'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const prisma = new PrismaClient()

async function getPlayers() {
  return await prisma.user.findMany({
    orderBy: {
      rank: 'asc'
    }
  })
}

async function getUserChallengeStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      activeChallenge: {
        include: {
          challenger: true,
          challenged: true
        }
      }
    }
  })

  return {
    hasActiveChallenge: !!user?.activeChallenge,
    activeChallenge: user?.activeChallenge
  }
}

async function createChallenge(formData: FormData) {
  'use server'
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await getUserByClerkId(userId)
  const challengedId = formData.get('challengedId') as string

  if (user) {
    try {
      const newChallenge = await prisma.challenge.create({
        data: {
          challengerId: user.id,
          challengedId,
          status: 'PENDING',
        },
      })
      await prisma.user.update({
        where: { id: user.id },
        data: { activeChallenge: { connect: { id: newChallenge.id } } },
      })
      revalidatePath('/dashboard')
    } catch (error) {
      console.error('Failed to create challenge:', error)
      throw new Error('Failed to create challenge')
    }
  }
}

async function submitChallengeScore(formData: FormData) {
  'use server'
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const challengeId = formData.get('challengeId') as string
  const challengerScore = parseInt(formData.get('challengerScore') as string)
  const challengedScore = parseInt(formData.get('challengedScore') as string)

  if (isNaN(challengerScore) || isNaN(challengedScore)) {
    throw new Error('Invalid scores provided')
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/challenges/${challengeId}/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ challengerScore, challengedScore }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to submit challenge score')
    }

    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error submitting challenge score:', error)
    throw error
  }
}

async function getMaxRankDifference() {
  const config = await prisma.config.findFirst()
  return config?.maxRankDifference || 5
}

export default async function Dashboard() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await getUserByClerkId(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const players = await getPlayers()
  const { hasActiveChallenge, activeChallenge } = await getUserChallengeStatus(userId)
  const maxRankDifference = await getMaxRankDifference()
  const currentUserRank = user.rank

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome to your Billiards Ladder dashboard, {user.name}!</p>
      
      {hasActiveChallenge && activeChallenge && (
        <div className="mb-8 p-4 bg-yellow-100 rounded-md">
          <h2 className="text-xl font-bold mb-2">Your Active Challenge</h2>
          {activeChallenge.challengerId === user.id ? (
            <p>You have challenged {activeChallenge.challenged.name}.</p>
          ) : (
            <p>You have been challenged by {activeChallenge.challenger.name}.</p>
          )}
          {activeChallenge.status === 'ACCEPTED' && (
            <form action={submitChallengeScore} className="mt-4 space-y-4">
              <input type="hidden" name="challengeId" value={activeChallenge.id} />
              <div>
                <label htmlFor="challengerScore" className="block text-sm font-medium text-gray-700">
                  {activeChallenge.challengerId === user.id ? 'Your Score' : 'Challenger Score'}
                </label>
                <Input
                  type="number"
                  id="challengerScore"
                  name="challengerScore"
                  required
                  min="0"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="challengedScore" className="block text-sm font-medium text-gray-700">
                  {activeChallenge.challengedId === user.id ? 'Your Score' : 'Challenged Score'}
                </label>
                <Input
                  type="number"
                  id="challengedScore"
                  name="challengedScore"
                  required
                  min="0"
                  className="mt-1"
                />
              </div>
              <Button type="submit">Submit Scores</Button>
            </form>
          )}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Ladder Standings</h2>
        <LadderStandings 
          players={players} 
          isAdmin={false} 
          currentUserId={user.id}
          currentUserRank={currentUserRank}
          maxRankDifference={maxRankDifference}
          userHasActiveChallenge={hasActiveChallenge}
          onChallenge={createChallenge}
        />
      </div>

      <SignOutButton />
    </div>
  )
}

