import { login, signup, loginWithOtp } from './actions';
import OAuthButtons from './OAuthButtons';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthPage() {
    return (
        <div className='min-h-screen flex justify-center items-center bg-gray-100 p-4'>
            <Card className='w-full max-w-md shadow-lg'>
                <CardHeader>
                    <CardTitle className='text-center text-2xl'>Welcome Back</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='login' className='w-full'>
                        <TabsList className='grid grid-cols-2'>
                            <TabsTrigger value='login'>Login</TabsTrigger>
                            <TabsTrigger value='signup'>Sign Up</TabsTrigger>
                        </TabsList>

                        {/* Login Tab */}
                        <TabsContent value='login'>
                            <form className='space-y-4' action={login}>
                                <Input
                                    id='email'
                                    name='email'
                                    type='email'
                                    placeholder='Email'
                                    required
                                />
                                <Input
                                    id='password'
                                    name='password'
                                    type='password'
                                    placeholder='Password'
                                    required
                                />
                                <Button type='submit' className='w-full'>Login</Button>
                                <Button
                                    type='submit'
                                    variant='outline'
                                    className='w-full'
                                    formAction={loginWithOtp}
                                >
                                    Login with OTP
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Sign Up Tab */}
                        <TabsContent value='signup'>
                            <form className='space-y-4' action={signup}>
                                <Input
                                    id='signup-email'
                                    name='email'
                                    type='email'
                                    placeholder='Email'
                                    required
                                />
                                <Input
                                    id='signup-password'
                                    name='password'
                                    type='password'
                                    placeholder='Password'
                                    required
                                />
                                <Button type='submit' className='w-full'>Sign Up</Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {/* OAuth Buttons */}
                    <div className="mt-6">
                        <OAuthButtons />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}