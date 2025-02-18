"use client"
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function AuthPage() {
    const [email, setEmail] = useState("");

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) alert(error.message);
        else alert("Check your email for a login link!");
    };

    return (
        <div className='flex flex-col items-center justify-center min-h-screen'>
            <input
                type="email"
                placeholder="Enter your email"
                className="border p-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button className="mt-2 p-2 bg-blue-500 text-white rounded" onClick={handleLogin}>
                Send Magic Link
            </button>
        </div>
    )
}