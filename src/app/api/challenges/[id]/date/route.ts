import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs'
import { isUserAdmin } from '../../../../utils/user'

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

  const { matchDate } = await request.json()

  try {
    const updatedChallenge = await prisma.challenge.update({
      where: { id: params.id },
      data: { matchDate: matchDate ? new Date(matchDate) : null },
    })

    return NextResponse.json(updatedChallenge)
  } catch (error) {
    console.error('Failed to update challenge date:', error)
    return NextResponse.json({ error: 'Failed to update challenge date' }, { status: 500 })
  }
}

