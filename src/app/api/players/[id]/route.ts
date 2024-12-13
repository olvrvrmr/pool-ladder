import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { isUserAdmin } from '../../../utils/user'

const prisma = new PrismaClient()

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  const { userId } = session
  const token = await session.getToken()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isUserAdmin(userId)

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user from Clerk
    const clerk = await clerkClient()
    await clerk.users.deleteUser(user.clerkId)

    // Delete user from our database
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}

