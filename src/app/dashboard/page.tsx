import { auth } from '@clerk/nextjs/server'
import { SignOutButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { getUserByClerkId } from '../utils/user'
import LadderStandings from '../components/LadderStandings'
import { revalidatePath } from 'next/cache'

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
    }
  }
}

export default async function Dashboard() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await getUserByClerkId(userId)
  const players = await getPlayers()
  const { hasActiveChallenge, activeChallenge } = await getUserChallengeStatus(userId)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome to your Billiards Ladder dashboard, {user?.name}!</p>
      
      {hasActiveChallenge && activeChallenge && (
        <div className="mb-8 p-4 bg-yellow-100 rounded-md">
          <h2 className="text-xl font-bold mb-2">Your Active Challenge</h2>
          {activeChallenge.challengerId === user?.id ? (
            <p>You have challenged {activeChallenge.challenged.name}. Waiting for the match to be played.</p>
          ) : (
            <p>You have been challenged by {activeChallenge.challenger.name}. Waiting for the match to be played.</p>
          )}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Ladder Standings</h2>
        <LadderStandings 
          players={players} 
          isAdmin={false} 
          currentUserId={user?.id}
          userHasActiveChallenge={hasActiveChallenge}
          onChallenge={createChallenge}
        />
      </div>

      <SignOutButton />
    </div>
  )
}

