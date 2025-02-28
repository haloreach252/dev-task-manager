'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Layers, Users, Calendar, CheckCircle, Eye, Code } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
	return (
		<main className="p-8 space-y-16">
			{/* Hero Section */}
			<motion.section
				className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-12 shadow-lg text-center"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
			>
				<h1 className="text-5xl font-bold">
					Project Management, Done Right.
				</h1>
				<p className="mt-3 text-lg">
					A Trello-like project management tool for developers and
					teams. Organize tasks, customize workflows, and collaborate
					in real-time.
				</p>
				<div className="mt-6 flex justify-center space-x-4">
					<motion.div whileHover={{ scale: 1.05 }}>
						<Link href="/auth">
							<Button size="lg" variant="secondary">
								Get Started for Free
							</Button>
						</Link>
					</motion.div>
					<motion.div whileHover={{ scale: 1.05 }}>
						<Link href="/demo">
							<Button size="lg" variant="default">
								Try a Demo
							</Button>
						</Link>
					</motion.div>
				</div>
			</motion.section>

			{/* Feature Highlights */}
			<section className="text-center space-y-8">
				<h2 className="text-3xl font-bold">
					Why Choose Miniverse Project Manager?
				</h2>
				<p className="text-gray-500 dark:text-gray-400">
					Powerful tools to streamline development and collaboration.
				</p>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<FeatureCard
						title="Custom Workflows"
						description="Adapt your board to any development process with flexible statuses and task properties."
						icon={<Layers className="w-8 h-8 text-indigo-600" />}
					/>
					<FeatureCard
						title="Real-Time Collaboration"
						description="See live updates, leave comments, and track changes instantly with your team."
						icon={<Users className="w-8 h-8 text-purple-600" />}
					/>
					<FeatureCard
						title="Multiple Views"
						description="Switch between Kanban, Calendar, and Table views to manage tasks your way."
						icon={<Calendar className="w-8 h-8 text-blue-600" />}
					/>
					<FeatureCard
						title="GitHub & Discord Integration"
						description="Sync with GitHub issues and receive project updates in Discord."
						icon={<Code className="w-8 h-8 text-green-600" />}
					/>
					<FeatureCard
						title="Task Automation"
						description="Auto-assign tasks, set triggers, and move statuses with built-in automation."
						icon={
							<CheckCircle className="w-8 h-8 text-yellow-600" />
						}
					/>
					<FeatureCard
						title="Public, Private, & Team Boards"
						description="Control who can view and edit your projects with role-based access."
						icon={<Eye className="w-8 h-8 text-red-600" />}
					/>
				</div>
			</section>

			<Separator />

			{/* Who is This For? */}
			<section className="text-center space-y-8">
				<h2 className="text-3xl font-bold">Who is This For?</h2>
				<p className="text-gray-500 dark:text-gray-400">
					Designed for a variety of development workflows.
				</p>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<UserTypeCard
						title="Game Developers & Studios"
						description="Manage dev tasks, sprints, and releases effortlessly."
					/>
					<UserTypeCard
						title="Indie Devs & Solo Creators"
						description="Organize projects efficiently without clutter."
					/>
					<UserTypeCard
						title="General Teams & Freelancers"
						description="Not just for devs, great for any project management."
					/>
				</div>
			</section>

			{/* Live Demo Placeholder */}
			<motion.section
				className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center shadow-md"
				initial={{ opacity: 0, scale: 0.9 }}
				whileInView={{ opacity: 1, scale: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 0.5 }}
			>
				<h2 className="text-3xl font-bold">See It in Action</h2>
				<p className="mt-3 text-gray-500 dark:text-gray-400">
					Experience Miniverse Project Manager with a live interactive
					demo.
				</p>
				<div className="mt-6">
					<Button size="lg" variant="secondary">
						Try a Demo
					</Button>
				</div>
			</motion.section>

			{/* Testimonials Placeholder */}
			<section className="text-center space-y-8">
				<h2 className="text-3xl font-bold">What Users Are Saying</h2>
				<p className="text-gray-500 dark:text-gray-400">
					Join developers who have streamlined their workflow.
				</p>
				{/* Placeholder for future testimonials */}
			</section>

			{/* Call to Action */}
			<motion.section
				className="text-center space-y-6"
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5, ease: 'easeOut' }}
			>
				<h2 className="text-3xl font-bold">
					Start Managing Your Projects Today
				</h2>
				<p className="text-gray-500 dark:text-gray-400">
					Sign up now and streamline your development workflow.
				</p>
				<div className="flex justify-center space-x-4">
					<motion.div whileHover={{ scale: 1.05 }}>
						<Link href="/auth">
							<Button size="lg">Create Your First Team</Button>
						</Link>
					</motion.div>
					<motion.div whileHover={{ scale: 1.05 }}>
						<Link href="/auth">
							<Button size="lg" variant="outline">
								Browse Projects
							</Button>
						</Link>
					</motion.div>
				</div>
			</motion.section>
		</main>
	);
}

// Reusable Feature Card Component
function FeatureCard({
	title,
	description,
	icon,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5 }}
		>
			<Card className="p-6 text-center shadow-md">
				<div className="flex justify-center">{icon}</div>
				<CardHeader>
					<CardTitle>{title}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-gray-600 dark:text-gray-400">
						{description}
					</p>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// Reusable User Type Card Component
function UserTypeCard({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			whileInView={{ opacity: 1, scale: 1 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5 }}
		>
			<Card className="p-6 text-center shadow-md">
				<CardHeader>
					<CardTitle>{title}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-gray-600 dark:text-gray-400">
						{description}
					</p>
				</CardContent>
			</Card>
		</motion.div>
	);
}
