import { auth } from '@clerk/nextjs/server'
import { SignInButton, SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import LadderStandings from './components/LadderStandings'
import ChallengesList from './components/ChallengesList'
import { getUserByClerkId, isUserAdmin } from './utils/user'

const prisma = new PrismaClient()

async function getPlayers() {
  return await prisma.user.findMany({
    orderBy: {
      rank: 'asc'
    }
  })
}

async function getChallenges() {
  return await prisma.challenge.findMany({
    include: {
      challenger: true,
      challenged: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export default async function Home() {
  const { userId } = await auth()
  const user = userId ? await getUserByClerkId(userId) : null
  const players = await getPlayers()
  const challenges = await getChallenges()
  const isAdmin = userId ? await isUserAdmin(userId) : false

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Border Bar Pool Ladder</h1>
        <div className="mb-8 text-center">
          {userId ? (
            <div>
              <p className="mb-4">Welcome to the Border Bar Pool Ladder, {user?.name}!</p>
              <Link href="/dashboard" className="text-blue-500 hover:underline mr-4">
                Go to Dashboard
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-blue-500 hover:underline mr-4">
                  Admin Panel
                </Link>
              )}
              <SignOutButton />
            </div>
          ) : (
            <div>
              <p className="mb-2">Please sign in to access the BBP Ladder.</p>
              <SignInButton mode="modal">
                <button className="text-blue-500 hover:underline">
                  Sign In
                </button>
              </SignInButton>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
            <LadderStandings 
              players={players} 
              isHomepage={true}
              isAdmin={false}
              userHasActiveChallenge={false}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">All Challenges</h2>
            <ChallengesList challenges={challenges} />
          </div>
        </div>
      </div>
    </main>
  )
}

