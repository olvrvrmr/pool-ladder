import { auth} from '@clerk/nextjs/server'
import { SignInButton, SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import LadderStandings from './components/LadderStandings'
import ChallengesList from './components/ChallengesList'
import MatchCalendar from './components/MatchCalendar'
import { getUserByClerkId, isUserAdmin } from './utils/user'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

async function getScheduledMatches() {
  const challenges = await prisma.challenge.findMany({
    where: {
      status: 'ACCEPTED',
      matchDate: {
        not: null
      }
    },
    include: {
      challenger: true,
      challenged: true
    }
  })

  return challenges.map(challenge => ({
    id: challenge.id,
    title: `${challenge.challenger.name} vs ${challenge.challenged.name}`,
    start: challenge.matchDate!,
    end: new Date(challenge.matchDate!.getTime() + 60 * 60 * 1000) // Assuming 1 hour duration
  }))
}

export default async function Home() {
  const { userId } = await auth()
  const user = userId ? await getUserByClerkId(userId) : null
  const players = await getPlayers()
  const challenges = await getChallenges()
  const scheduledMatches = await getScheduledMatches()
  const isAdmin = userId ? await isUserAdmin(userId) : false

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Billiards Ladder</h1>
        {userId ? (
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.name}!</span>
            <SignOutButton>
              <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        ) : (
          <SignInButton mode="modal">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <LadderStandings 
              players={players} 
              isHomepage={true}
              isAdmin={false}
              userHasActiveChallenge={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <ChallengesList challenges={challenges} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Scheduled Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchCalendar initialMatches={scheduledMatches} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

