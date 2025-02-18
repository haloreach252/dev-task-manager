"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function NavBar() {
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        // Fetch initial session
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
        };

        getSession();

        // Listen for auth changes
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    const handleLogout  = async () => {
        await supabase.auth.signOut();
    };

    return (
        <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
            <div className="flex gap-4">
                <Link href="/">Home</Link>
                {session && <Link href="/projects">Projects</Link>}
            </div>
            <div>
                {!session ? (
                <Link href="/auth">Login or Signup</Link>
                ) : (
                <button onClick={handleLogout} className="hover:underline">
                    Logout
                </button>
                )}
            </div>
        </nav>
    )
}