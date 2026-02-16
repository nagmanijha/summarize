
import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"
import * as schema from "./db/schema"
import Credentials from "next-auth/providers/credentials"
import { eq } from "drizzle-orm"
import { compare } from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: DrizzleAdapter(db, {
        usersTable: schema.users,
        accountsTable: schema.accounts,
        sessionsTable: schema.sessions,
        verificationTokensTable: schema.verificationTokens,
    }),
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Check if user exists
                const user = await db.query.users.findFirst({
                    where: eq(schema.users.email, credentials.email as string)
                });

                if (!user || !user.password) {
                    return null; // User not found or no password set (e.g. OAuth user)
                }

                // Verify password
                const passwordMatch = await compare(
                    credentials.password as string,
                    user.password
                );

                if (passwordMatch) {
                    return user;
                }

                return null;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
})
