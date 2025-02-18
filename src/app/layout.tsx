"use client"
import "./globals.css";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";
import { Session } from "@supabase/supabase-js";
import { useEffect } from "react";


export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
 const [session, setSession] = useState<Session | null>(null);
 const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 );

 useEffect(() => {
  supabase.auth.getSession().then(({ data }) => setSession(data.session));

  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return () => {
    authListener.subscription.unsubscribe();
  };
 }, []);
 
  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
