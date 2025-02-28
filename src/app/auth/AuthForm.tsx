// src/app/auth/AuthForm.tsx
'use client';

import { login, signup, loginWithOtp } from './actions';
import OAuthButtons from './OAuthButtons';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Lock, UserPlus, LogIn } from 'lucide-react';

export default function AuthForm({ redirectPath }: { redirectPath: string }) {
    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-800 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <Card className="w-full max-w-md shadow-lg border dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
                            <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            Secure Access
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid grid-cols-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
                                <TabsTrigger value="login">
                                    <LogIn className="w-4 h-4" />
                                    <span className="ml-2">Login</span>
                                </TabsTrigger>
                                <TabsTrigger value="signup">
                                    <UserPlus className="w-4 h-4" />
                                    <span className="ml-2">Sign Up</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <motion.form
                                    className="space-y-4"
                                    action={login}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <input
                                        type="hidden"
                                        name="redirect"
                                        value={redirectPath}
                                        readOnly
                                    />
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="remember-me" />
                                            <Label htmlFor="remember-me">
                                                Remember Me
                                            </Label>
                                        </div>
                                        <Link
                                            href="/auth/reset-password"
                                            className="text-indigo-600 hover:underline text-sm"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Login
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        className="w-full"
                                        formAction={loginWithOtp}
                                    >
                                        Login with OTP
                                    </Button>
                                </motion.form>
                            </TabsContent>

                            <TabsContent value="signup">
                                <motion.form
                                    className="space-y-4"
                                    action={signup}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <input
                                        type="hidden"
                                        name="redirect"
                                        value={redirectPath}
                                        readOnly
                                    />
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">
                                            Email
                                        </Label>
                                        <Input
                                            id="signup-email"
                                            name="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">
                                            Password
                                        </Label>
                                        <Input
                                            id="signup-password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Sign Up
                                    </Button>
                                </motion.form>
                            </TabsContent>
                        </Tabs>

                        <div className="flex items-center my-6">
                            <Separator className="flex-1" />
                            <span className="px-4 text-gray-500 dark:text-gray-400">
                                or
                            </span>
                            <Separator className="flex-1" />
                        </div>

                        <OAuthButtons redirectPath={redirectPath} />

                        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            Join{' '}
                            <span className="font-semibold text-indigo-600">
                                1,000+ developers
                            </span>{' '}
                            using Dev Task Manager.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
