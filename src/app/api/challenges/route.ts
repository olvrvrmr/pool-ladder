import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'
import { isUserAdmin } from '../../utils/user'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isUserAdmin(userId)

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { challengerId, challengedId } = await request.json()

  try {
    // Check if the challenger already has an active challenge
    const challenger = await prisma.user.findUnique({
      where: { id: challengerId },
      include: { activeChallenge: true },
    })

    if (challenger?.activeChallenge) {
      return NextResponse.json({ error: 'Challenger already has an active challenge' }, { status: 400 })
    }

    // Get the challenged player
    const challenged = await prisma.user.findUnique({
      where: { id: challengedId },
    })

    if (!challenger || !challenged) {
      return NextResponse.json({ error: 'Invalid challenger or challenged player' }, { status: 400 })
    }

    // Get the max rank difference from config
    const config = await prisma.config.findFirst()
    const maxRankDifference = config?.maxRankDifference || 5

    // Check if the rank difference is within the allowed range
    if (Math.abs(challenger.rank - challenged.rank) > maxRankDifference) {
      return NextResponse.json({ error: 'Rank difference exceeds the allowed limit' }, { status: 400 })
    }

    // Create the challenge and update the challenger's active challenge
    const challenge = await prisma.$transaction(async (prisma) => {
      const newChallenge = await prisma.challenge.create({
        data: {
          challengerId,
          challengedId,
          status: 'PENDING',
        },
      })

      await prisma.user.update({
        where: { id: challengerId },
        data: { activeChallenge: { connect: { id: newChallenge.id } } },
      })

      return newChallenge
    })

    return NextResponse.json(challenge)
  } catch (error) {
    console.error('Failed to create challenge:', error)
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        OR: [
          { challengerId: user.id },
          { challengedId: user.id },
        ],
        status: 'PENDING',
      },
      include: {
        challenger: true,
        challenged: true,
      },
    })

    return NextResponse.json(challenges)
  } catch (error) {
    console.error('Failed to fetch challenges:', error)
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
  }
}

