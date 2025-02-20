import { login, signup, loginWithOtp } from './actions';
import OAuthButtons from './OAuthButtons';

export default function AuthPage() {
    return (
        <div className='p-8 flex justify-center items-center flex-col'>
            <h1 className='text-2xl font-bold mb-4'>Login / Signup</h1>
            <div className='flex flex-col gap-4'>
                <form className='flex flex-col gap-4'>
                    <label htmlFor='email'>Email:</label>
                    <input id='email' name='email' type='email' required/>
                    <label htmlFor='password'>Password:</label>
                    <input id='password' name='password' type='password'/>
                    <button formAction={login}>Login</button>
                    <button formAction={signup}>Sign Up</button>
                    <button formAction={loginWithOtp}>Login with OTP</button>
                </form>
                <OAuthButtons />
            </div>
        </div>
    )
}