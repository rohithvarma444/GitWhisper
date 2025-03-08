import { auth } from "@clerk/nextjs/server"; 
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { redirect } from "next/navigation";

export default async function SyncUser() {
    const { userId } =await  auth(); // Correct way to get userId in App Router

    if (!userId) {
        return <p>Not authenticated</p>;
    }

    try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);

        if (!clerkUser) {
            throw new Error("User not found in Clerk");
        }

        console.log("Syncing user:", clerkUser);

        const existingUser = await db.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            // Create new user in Prisma (Neon DB)
            await db.user.create({
                data: {
                    id: userId,
                    firstName: clerkUser.firstName ?? "",
                    lastName: clerkUser.lastName ?? "",
                    email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
                    imageUrl: clerkUser.imageUrl,
                },
            });
            console.log("New user added to the database:", userId);
        }

    } catch (error) {
        console.error("Error syncing user:", error);
    }

    return redirect("/dashboard"); 
}