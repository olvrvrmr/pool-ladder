import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getUserByClerkId(clerkId: string) {
  const user = await prisma.user.findFirst({
    where: { 
      OR: [
        { clerkId },
        { clerkId: undefined, email: clerkId } // Use undefined instead of null
      ]
    },
  })
  console.log('User fetched by Clerk ID or email:', user);
  return user
}

export async function isUserAdmin(clerkId: string) {
  const user = await prisma.user.findFirst({
    where: { 
      OR: [
        { clerkId },
        { clerkId: undefined, email: clerkId }
      ]
    },
    select: { isAdmin: true, name: true }
  })
  console.log(`Checking admin status for user: ${user?.name}, isAdmin: ${user?.isAdmin}`);
  return user?.isAdmin ?? false
}

