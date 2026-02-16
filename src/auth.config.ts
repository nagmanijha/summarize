
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { db } from "@/db"
import * as schema from "@/db/schema"
import { eq } from "drizzle-orm"

// Note: In a real Edge environment, we can't use 'bcryptjs' or 'drizzle-orm' with 'postgres' driver directly if they use Node APIs.
// However, 'bcryptjs' is JS-only so it might work. 'postgres' definitely won't work in Edge.
// BUT for middleware we primarily need to authorize via session token.
// The credentials provider logic currently lives in authorize(), which might be called.
// For middleware `auth`, we usually just need `session` callback or similar.
// If authorize() uses DB, it breaks Edge.
//
// STRATEGY: 
// 1. Move providers to auth.ts (Node only).
// 2. Keep shared config in auth.config.ts.
// 3. Middleare uses auth.config.ts.

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && nextUrl.pathname.startsWith('/login')) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
