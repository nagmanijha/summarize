
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "login" | "register";

export default function LoginPage() {
    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            if (mode === "login") {
                const result = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                });

                if (result?.error) {
                    setError("Invalid credentials. Please try again.");
                    setIsLoading(false);
                } else {
                    // Hardcards redirect to dashboard to ensure client-side navigation works
                    window.location.href = "/dashboard";
                }
            } else {
                // Registration
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, name }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Registration failed");
                }

                setSuccess("Account created successfully! Logging you in...");

                // Auto-login after registration
                await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                });

                window.location.href = "/dashboard";
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === "login" ? "register" : "login");
        setError("");
        setSuccess("");
    }

    return (
        <div className="flex min-h-screen bg-slate-900 font-sans">
            <div className="m-auto w-full max-w-md p-8">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 animate-fade-in-up">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-500/20">
                                <span className="material-icons text-2xl">auto_fix_high</span>
                            </div>
                        </Link>
                        <h1 className="text-2xl font-bold text-white mb-2 font-display">
                            {mode === "login" ? "Welcome Back" : "Create Account"}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {mode === "login" ? "Sign in to your dashboard" : "Get started with ScribeAI"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm flex items-center gap-2 animate-shake">
                                <span className="material-icons text-sm">error</span>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 bg-emerald-900/30 border border-emerald-800 rounded-lg text-emerald-200 text-sm flex items-center gap-2">
                                <span className="material-icons text-sm">check_circle</span>
                                {success}
                            </div>
                        )}

                        {mode === "register" && (
                            <div className="animate-fade-in">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="material-icons animate-spin text-sm">refresh</span>
                                    {mode === "login" ? "Signing in..." : "Creating account..."}
                                </>
                            ) : (
                                mode === "login" ? "Sign In" : "Sign Up"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-700 text-center">
                        <p className="text-slate-500 text-sm">
                            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={toggleMode}
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors focus:outline-none"
                            >
                                {mode === "login" ? "Sign up" : "Log in"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
