"use client"

import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export default function AuthPage() {
    const [email, setEmail] = useState("");

    const handleEmailLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
        console.error("Email login error:", error);
    } else {
        alert("Check your email for the login link.");
    }
    };

    const handleOAuthLogin = async (provider: "github" | "discord") => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
        console.error(`OAuth login error with ${provider}:`, error);
    }
    };

    return (
    <main className="p-8">
        <h1 className="text-2xl font-bold">Login / Signup</h1>
        <div className="mt-4">
        <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 mr-2"
        />
        <button onClick={handleEmailLogin} className="p-2 bg-blue-500 text-white">
            Send Magic Link
        </button>
        </div>
        <div className="mt-4">
        <button
            onClick={() => handleOAuthLogin("github")}
            className="p-2 bg-gray-800 text-white mr-2"
        >
            Continue with GitHub
        </button>
        <button
            onClick={() => handleOAuthLogin("discord")}
            className="p-2 bg-indigo-600 text-white"
        >
            Continue with Discord
        </button>
        </div>
    </main>
    );
}