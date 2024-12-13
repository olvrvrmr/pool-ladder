import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'
import { isUserAdmin } from '../../../../utils/user'

const prisma = new PrismaClient()

export async function PUT(
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

  const { rank } = await request.json()

  try {
    const updatedPlayer = await prisma.user.update({
      where: { id: params.id },
      data: { rank },
    })

    return NextResponse.json(updatedPlayer)
  } catch (error) {
    console.error('Failed to update player rank:', error)
    return NextResponse.json({ error: 'Failed to update player rank' }, { status: 500 })
  }
}

