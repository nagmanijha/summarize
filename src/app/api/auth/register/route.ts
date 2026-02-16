
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as z from "zod";

// Basic validation schema
const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = userSchema.parse(body);

        // Check if user exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingUser) {
            return NextResponse.json(
                { user: null, message: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 10);

        // Create user
        const [newUser] = await db
            .insert(users)
            .values({
                email,
                name,
                password: hashedPassword,
                emailVerified: new Date(), // Auto-verify for simplicity in this demo
            })
            .returning();

        const { password: newUserPassword, ...rest } = newUser;

        return NextResponse.json(
            { user: rest, message: "User created successfully" },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { user: null, message: error.errors[0].message },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { user: null, message: "Something went wrong" },
            { status: 500 }
        );
    }
}
