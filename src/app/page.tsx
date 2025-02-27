/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Rocket, Layers, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
	return (
		<main className="p-8 space-y-12">
			{/* Hero Section */}
			<motion.section
				className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-10 shadow-lg text-center"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
			>
				<h1 className="text-4xl font-bold">
					Game Dev Task Management, Done Right.
				</h1>
				<p className="mt-2 text-lg">
					Organize projects, track progress, and collaborate in
					real-time.
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
				<h2 className="text-2xl font-bold">
					Why Choose Miniverse Dev Task Manager?
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<FeatureCard
						title="Customizable Workflows"
						description="Adapt your board to any game dev pipeline with flexible statuses and task properties."
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
				</div>
			</section>

			<Separator />

			{/* Quick Stats */}
			<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard title="Total Teams" value="4" />
				<StatCard title="Total Projects" value="12" />
				<StatCard title="Active Tasks" value="34" />
				<StatCard title="Completed Tasks" value="87" />
			</section>

			{/* Call to Action */}
			<motion.section
				className="text-center space-y-6"
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5, ease: 'easeOut' }}
			>
				<h2 className="text-2xl font-bold">
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
						<Link href="/projects">
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

// Feature Card Component with animation
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

// Stats Card Component with animation
function StatCard({ title, value }: { title: string; value: string }) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			whileInView={{ opacity: 1, scale: 1 }}
			viewport={{ once: true }}
			transition={{ duration: 0.4, ease: 'easeOut' }}
		>
			<Card className="p-4 text-center shadow-md">
				<CardHeader>
					<CardTitle>{title}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-bold">{value}</p>
				</CardContent>
			</Card>
		</motion.div>
	);
}
