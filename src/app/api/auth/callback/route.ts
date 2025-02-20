import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
    }

    // Exchange the OAuth code for a supabase session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("OAuth callback error: ", error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}`);
}