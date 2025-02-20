"use client"

import { loginWithOAuth } from "./actions"

type OAuthProvider = "github" | "discord";

export default function OAuthButtons() {
    const handleOAuthLogin = async (provider: OAuthProvider) => {
        const url = await loginWithOAuth(provider);

        if (url) {
            window.location.href = url; // Redirect to oauth provider
        } else {
            console.error("OAuth login failed.");
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <button type='button' onClick={() => handleOAuthLogin('github')}>
                GitHub Login
            </button>
            <button type='button' onClick={() => handleOAuthLogin('discord')}>
                Discord Login
            </button>
        </div>
    )
}