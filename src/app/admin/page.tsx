import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AddPlayerForm from '../components/AddPlayerForm'
import LadderStandings from '../components/LadderStandings'
import ChallengeForm from '../components/ChallengeForm'
import ChallengeManagement from '../components/ChallengeManagement'
import { PrismaClient } from '@prisma/client'
import { isUserAdmin } from '../utils/user'
import { revalidatePath } from 'next/cache'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

async function deletePlayer(playerId: string) {
  'use server'
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/players/${playerId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete player')
    }

    revalidatePath('/admin')
  } catch (error) {
    console.error('Error deleting player:', error)
  }
}

async function createChallenge(challengerId: string, challengedId: string) {
  'use server'
  try {
    const session = await auth()
    const token = await session.getToken()

    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ challengerId, challengedId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create challenge')
    }

    revalidatePath('/admin')
  } catch (error) {
    console.error('Error creating challenge:', error)
    throw error
  }
}

async function updateChallengeStatus(challengeId: string, newStatus: string) {
  'use server'
  try {
    const session = await auth()
    const token = await session.getToken()

    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/challenges/${challengeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update challenge status')
    }

    revalidatePath('/admin')
  } catch (error) {
    console.error('Error updating challenge status:', error)
    throw error
  }
}

export default async function AdminPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const isAdmin = await isUserAdmin(userId)

  if (!isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    )
  }

  const players = await getPlayers()
  const challenges = await getChallenges()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <Tabs defaultValue="players" className="space-y-4">
        <TabsList>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>
        <TabsContent value="players">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add New Player</CardTitle>
              </CardHeader>
              <CardContent>
                <AddPlayerForm />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Current Standings</CardTitle>
              </CardHeader>
              <CardContent>
                <LadderStandings 
                  players={players} 
                  isAdmin={true}
                  userHasActiveChallenge={false}
                  onDeletePlayer={deletePlayer}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="challenges">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Challenge</CardTitle>
              </CardHeader>
              <CardContent>
                <ChallengeForm players={players} onChallenge={createChallenge} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Manage Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <ChallengeManagement challenges={challenges} onUpdateStatus={updateChallengeStatus} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

