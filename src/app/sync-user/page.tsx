"use server";

import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

const SyncUser = async () => {
    const { userId } = await auth();

    if (!userId) {
        return notFound();
    }

    // Fetch user details from Clerk
    const user = await clerkClient.users.getUser(userId);

    if (!user || !user.emailAddresses[0]?.emailAddress) {
        return notFound();
    }

    // Upsert user into the database
    await db.user.upsert({
        where: {
            email: user.emailAddresses[0].emailAddress
        },
        update: {
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        },
        create: {
            id: user.id,
            email: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        }
    });

    return redirect("/dashboard");
};

export default SyncUser;