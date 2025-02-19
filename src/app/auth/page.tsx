"use client";

import { login, signup, loginWithOAuth, loginWithOtp } from './actions';

export default function AuthPage() {
    return (
        <div className='p-8'>
            <h1 className='text-2xl font-bold'>Login / Signup</h1>
            <form className='flex flex-col gap-4'>
                <label htmlFor='email'>Email:</label>
                <input id='email' name='email' type='email' required/>
                <label htmlFor='password'>Password:</label>
                <input id='password' name='password' type='password' required/>
                <button formAction={login}>Login</button>
                <button formAction={signup}>Sign Up</button>
                <button formAction={loginWithOtp}>Login with OTP</button>
                <button onClick={() => loginWithOAuth('github')}>GitHub Login</button>
                <button onClick={() => loginWithOAuth('discord')}>Discord Login</button>
            </form>
        </div>
    )
}