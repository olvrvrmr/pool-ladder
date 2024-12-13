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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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

async function submitChallengeScore(challengeId: string, challengerScore: number, challengedScore: number) {
  'use server'
  try {
    const session = await auth()
    const token = await session.getToken()

    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/challenges/${challengeId}/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ challengerScore, challengedScore }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to submit challenge score')
    }

    revalidatePath('/admin')
  } catch (error) {
    console.error('Error submitting challenge score:', error)
    throw error
  }
}

async function updateRankDifference(formData: FormData) {
  'use server'
  try {
    const newDifference = parseInt(formData.get('rankDifference') as string)
    await prisma.config.upsert({
      where: { id: 1 },
      create: { maxRankDifference: newDifference },
      update: { maxRankDifference: newDifference }
    })
    revalidatePath('/admin')
  } catch (error) {
    console.error('Failed to update rank difference:', error)
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
  const config = await prisma.config.findFirst()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <Tabs defaultValue="players" className="space-y-4">
        <TabsList>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
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
                <ChallengeManagement 
                  challenges={challenges} 
                  onUpdateStatus={updateChallengeStatus}
                  onSubmitScore={submitChallengeScore}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Configure Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateRankDifference} className="space-y-4">
                <div>
                  <label htmlFor="rankDifference" className="block text-sm font-medium text-gray-700">
                    Maximum Rank Difference for Challenges
                  </label>
                  <Input
                    type="number"
                    id="rankDifference"
                    name="rankDifference"
                    defaultValue={config?.maxRankDifference || 5}
                    min="1"
                    required
                  />
                </div>
                <Button type="submit">Update Rule</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

