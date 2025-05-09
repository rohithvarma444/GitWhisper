
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { db } from '@/server/db'

// Remove this incorrect import
// import { PageProps } from 'next/types';

// Update your component definition
export default async function JoinHandler({ 
  params 
}: { 
  params: { projectId: string } 
}) {
  const { projectId } = params;
  const { userId } = await auth();

  if (!userId) {
    return redirect('/sign-in');
  }

  const dbUser = await db.user.findFirst({
    where: { id: userId },
  });

  if (!dbUser) {
    return redirect('/sign-up');
  }

  const existingRelation = await db.userToProject.findFirst({
    where: {
      userId,
      projectId,
    },
  });

  if (!existingRelation) {
    await db.userToProject.create({
      data: {
        userId,
        projectId,
      },
    });
  }

  return redirect('/dashboard');
}