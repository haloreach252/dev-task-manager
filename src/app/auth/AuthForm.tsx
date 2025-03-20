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
import { Lock, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
		.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
		.regex(/[0-9]/, 'Password must contain at least one number')
		.regex(
			/[^A-Za-z0-9]/,
			'Password must contain at least one special character'
		),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function AuthForm({ redirectPath }: { redirectPath: string }) {
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showSignupPassword, setShowSignupPassword] = useState(false);
	const { toast } = useToast();

	const loginForm = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			rememberMe: false,
		},
	});

	const signupForm = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
	});

	const handleLogin = async (data: LoginFormData) => {
		try {
			setIsLoading(true);
			const formData = new FormData();
			formData.append('email', data.email);
			formData.append('password', data.password);
			formData.append('redirect', redirectPath);
			await login(formData);
		} catch (err) {
			toast({
				title: 'Error',
				description: 'Failed to login. Please check your credentials.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleSignup = async (data: SignupFormData) => {
		try {
			setIsLoading(true);
			const formData = new FormData();
			formData.append('email', data.email);
			formData.append('password', data.password);
			formData.append('redirect', redirectPath);
			await signup(formData);
		} catch (err) {
			toast({
				title: 'Error',
				description: 'Failed to sign up. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleOtpLogin = async (data: LoginFormData) => {
		try {
			setIsLoading(true);
			const formData = new FormData();
			formData.append('email', data.email);
			await loginWithOtp(formData);
		} catch (err) {
			toast({
				title: 'Error',
				description: 'Failed to send OTP. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

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
									onSubmit={loginForm.handleSubmit(
										handleLogin
									)}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3 }}
								>
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											{...loginForm.register('email')}
											type="email"
											placeholder="you@example.com"
											aria-invalid={
												loginForm.formState.errors.email
													? 'true'
													: 'false'
											}
											aria-describedby={
												loginForm.formState.errors.email
													? 'email-error'
													: undefined
											}
										/>
										{loginForm.formState.errors.email && (
											<p
												id="email-error"
												className="text-sm text-red-500"
												role="alert"
											>
												{
													loginForm.formState.errors
														.email.message
												}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="password">
											Password
										</Label>
										<div className="relative">
											<Input
												id="password"
												{...loginForm.register(
													'password'
												)}
												type={
													showPassword
														? 'text'
														: 'password'
												}
												placeholder="••••••••"
												aria-invalid={
													loginForm.formState.errors
														.password
														? 'true'
														: 'false'
												}
												aria-describedby={
													loginForm.formState.errors
														.password
														? 'password-error'
														: undefined
												}
											/>
											<button
												type="button"
												onClick={() =>
													setShowPassword(
														!showPassword
													)
												}
												className="absolute right-3 top-1/2 -translate-y-1/2"
												aria-label={
													showPassword
														? 'Hide password'
														: 'Show password'
												}
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
										{loginForm.formState.errors
											.password && (
											<p
												id="password-error"
												className="text-sm text-red-500"
												role="alert"
											>
												{
													loginForm.formState.errors
														.password.message
												}
											</p>
										)}
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-2">
											<Checkbox
												id="remember-me"
												{...loginForm.register(
													'rememberMe'
												)}
											/>
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
									<Button
										type="submit"
										className="w-full"
										disabled={isLoading}
									>
										{isLoading ? 'Logging in...' : 'Login'}
									</Button>
									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={loginForm.handleSubmit(
											handleOtpLogin
										)}
										disabled={isLoading}
									>
										{isLoading
											? 'Sending OTP...'
											: 'Login with OTP'}
									</Button>
								</motion.form>
							</TabsContent>

							<TabsContent value="signup">
								<motion.form
									className="space-y-4"
									onSubmit={signupForm.handleSubmit(
										handleSignup
									)}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3 }}
								>
									<div className="space-y-2">
										<Label htmlFor="signup-email">
											Email
										</Label>
										<Input
											id="signup-email"
											{...signupForm.register('email')}
											type="email"
											placeholder="you@example.com"
											aria-invalid={
												signupForm.formState.errors
													.email
													? 'true'
													: 'false'
											}
											aria-describedby={
												signupForm.formState.errors
													.email
													? 'signup-email-error'
													: undefined
											}
										/>
										{signupForm.formState.errors.email && (
											<p
												id="signup-email-error"
												className="text-sm text-red-500"
												role="alert"
											>
												{
													signupForm.formState.errors
														.email.message
												}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="signup-password">
											Password
										</Label>
										<div className="relative">
											<Input
												id="signup-password"
												{...signupForm.register(
													'password'
												)}
												type={
													showSignupPassword
														? 'text'
														: 'password'
												}
												placeholder="••••••••"
												aria-invalid={
													signupForm.formState.errors
														.password
														? 'true'
														: 'false'
												}
												aria-describedby={
													signupForm.formState.errors
														.password
														? 'signup-password-error'
														: undefined
												}
											/>
											<button
												type="button"
												onClick={() =>
													setShowSignupPassword(
														!showSignupPassword
													)
												}
												className="absolute right-3 top-1/2 -translate-y-1/2"
												aria-label={
													showSignupPassword
														? 'Hide password'
														: 'Show password'
												}
											>
												{showSignupPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
										{signupForm.formState.errors
											.password && (
											<p
												id="signup-password-error"
												className="text-sm text-red-500"
												role="alert"
											>
												{
													signupForm.formState.errors
														.password.message
												}
											</p>
										)}
									</div>
									<Button
										type="submit"
										className="w-full"
										disabled={isLoading}
									>
										{isLoading
											? 'Signing up...'
											: 'Sign Up'}
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
							using Miniverse Project Manager.
						</p>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
