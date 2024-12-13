import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'
import { isUserAdmin } from '../../../utils/user'

const prisma = new PrismaClient()

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isUserAdmin(userId)

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { status } = await request.json()

  try {
    const updatedChallenge = await prisma.challenge.update({
      where: { id: params.id },
      data: { status },
    })

    // If the challenge is completed, remove it as the active challenge for the challenger
    if (status === 'COMPLETED') {
      await prisma.user.update({
        where: { id: updatedChallenge.challengerId },
        data: { activeChallenge: { disconnect: true } },
      })
    }

    return NextResponse.json(updatedChallenge)
  } catch (error) {
    console.error('Failed to update challenge:', error)
    return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 })
  }
}

