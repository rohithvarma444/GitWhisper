import { auth } from "@clerk/nextjs/server"; 
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { redirect } from "next/navigation";

export default async function SyncUser() {
    const { userId } = await auth(); // Correct way to get userId in App Router

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

        console.log("Existing user:", existingUser);
        
        if (!existingUser) {
            try {
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
            } catch (dbError) {
                console.error("Error creating user in database:", dbError);
                // If database creation fails, delete the user from Clerk
                try {
                    await client.users.deleteUser(userId);
                    console.log("User deleted from Clerk due to sync failure");
                    return <p>Error creating account. Please try signing up again.</p>;
                } catch (clerkError) {
                    console.error("Error deleting user from Clerk:", clerkError);
                    return <p>Critical error during account creation. Please contact support.</p>;
                }
            }
        }

    } catch (error) {
        console.error("Error syncing user:", error);
        // If general sync error occurs, attempt to delete from Clerk
        try {
            const client = await clerkClient();
            await client.users.deleteUser(userId);
            console.log("User deleted from Clerk due to sync error");
            return <p>Error creating account. Please try signing up again.</p>;
        } catch (clerkError) {
            console.error("Error deleting user from Clerk:", clerkError);
            return <p>Critical error during account creation. Please contact support.</p>;
        }
    }

    return redirect("/dashboard"); 
}