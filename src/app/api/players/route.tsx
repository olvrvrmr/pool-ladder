import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { isUserAdmin } from '../../utils/user'
import { auth, clerkClient } from '@clerk/nextjs/server'

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

  const { firstName, lastName, email, username, password, addToClerk } = await request.json()

  if (!firstName || !lastName) {
    return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 })
  }

  if (addToClerk && (!email || !username || !password)) {
    return NextResponse.json({ error: 'Email, username, and password are required when adding to Clerk' }, { status: 400 })
  }

  try {
    let clerkUser

    if (addToClerk) {
      const clerk = await clerkClient()
      const existingClerkUsers = await clerk.users.getUserList({
        emailAddress: [email],
      })

      if (existingClerkUsers.data.length > 0) {
        clerkUser = existingClerkUsers.data[0]
      } else {
        try {
          clerkUser = await clerk.users.createUser({
            emailAddress: [email],
            password,
            username,
            firstName,
            lastName,
            publicMetadata: {
              isPlayer: true,
            },
          })

          console.log(`User created in Clerk: ${username} (${email})`)
        } catch (clerkError: any) {
          console.error('Clerk user creation error:', clerkError)
          return NextResponse.json({ 
            error: 'Failed to create Clerk user', 
            details: clerkError.errors || clerkError.message 
          }, { status: 422 })
        }
      }
    }

    try {
      const newPlayer = await prisma.user.create({
        data: {
          clerkId: clerkUser?.id ?? null,
          name: `${firstName} ${lastName}`.trim(),
          email: email || null,
          rank: await prisma.user.count() + 1,
        },
      })
      return NextResponse.json(newPlayer)
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        error: 'Failed to create player in database', 
        details: dbError.message 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Failed to create player:', error)
    return NextResponse.json({ error: 'Failed to create player', details: error }, { status: 500 })
  }
}

