'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
	Lock,
	ShieldCheck,
	Users,
	LayoutGrid,
	KanbanSquare,
	Check,
	Timer,
	Link,
	Calendar,
	Rocket,
	Globe,
	Mail,
	MessageCircle,
	FileText,
	Code,
	Database,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeaturesPage() {
	return (
		<div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Card className="shadow-lg hover:shadow-xl transition">
					<CardHeader>
						<CardTitle className="text-2xl">Features</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6 text-gray-300 dark:text-gray-400">
						<section className="space-y-3">
							<h2 className="flex items-center text-xl font-semibold">
								<KanbanSquare className="w-6 h-6 mr-2 text-blue-400" />{' '}
								All-in-One Project Management
							</h2>
							<p>
								Miniverse Task Manager combines the best aspects
								of task tracking, team collaboration, and
								project organization into a single powerful
								tool. Designed for developers, teams, and
								project managers, our platform streamlines
								workflows so you can focus on getting things
								done—without switching between multiple apps.
							</p>
						</section>

						<Separator />

						<section className="space-y-3">
							<h2 className="flex items-center text-xl font-semibold">
								<Lock className="w-6 h-6 mr-2 text-green-400" />{' '}
								Authentication & Access Control
							</h2>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />{' '}
									Secure Authentication – Supabase Auth with
									email/password login and OAuth (Discord,
									GitHub).
								</li>
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />{' '}
									Role-Based Team Management – Assign Admins,
									Editors, and Viewers for controlled access.
								</li>
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />{' '}
									Flexible Board Visibility – Set boards as
									Public, Team-Only, or Private.
								</li>
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />{' '}
									Magic Link & Email Invites – Quick
									onboarding for new team members.
								</li>
							</ul>
						</section>

						<Separator />

						<section className="space-y-3">
							<h2 className="flex items-center text-xl font-semibold">
								<LayoutGrid className="w-6 h-6 mr-2 text-yellow-400" />{' '}
								Powerful Project & Board Management
							</h2>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />{' '}
									Multiple Boards per Project – Organize large
									projects into separate boards.
								</li>
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />{' '}
									Kanban-Style Workflow – Drag-and-drop tasks
									between columns.
								</li>
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />{' '}
									Real-Time Updates – Changes sync instantly
									across all team members.
								</li>
							</ul>
						</section>

						<Separator />

						<section className="space-y-3">
							<h2 className="flex items-center text-xl font-semibold">
								<Users className="w-6 h-6 mr-2 text-purple-400" />{' '}
								Real-Time Collaboration & Team Features
							</h2>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />{' '}
									Live Presence Indicators – See who’s online
									and actively working.
								</li>
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />{' '}
									Task Comments & Mentions – Collaborate with
									@username mentions in real time.
								</li>
							</ul>
						</section>

						<Separator />

						<section className="space-y-3">
							<h2 className="flex items-center text-xl font-semibold">
								<Link className="w-6 h-6 mr-2 text-orange-400" />{' '}
								External Integrations & Automations (Coming
								Soon)
							</h2>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />{' '}
									GitHub Integration – Link GitHub issues to
									tasks.
								</li>
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />{' '}
									Google Docs Integration – Attach and
									collaborate on documents.
								</li>
							</ul>
						</section>

						<Separator />

						<section className="space-y-3">
							<h2 className="flex items-center text-xl font-semibold">
								<Rocket className="w-6 h-6 mr-2 text-red-400" />{' '}
								Performance & Security
							</h2>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />{' '}
									Built with Supabase – A secure and scalable
									backend-as-a-service.
								</li>
							</ul>
						</section>

						<Separator />

						<section className="space-y-3">
							<h2 className="flex items-center text-xl font-semibold">
								<Globe className="w-6 h-6 mr-2 text-teal-400" />{' '}
								Get in Touch
							</h2>
							<ul className="list-none pl-5 space-y-2">
								<li>
									<a
										href="/contact"
										className="flex items-center text-blue-400"
									>
										<MessageCircle className="w-5 h-5 mr-2" />{' '}
										Contact Form
									</a>
								</li>
								<li>
									<a
										href="mailto:support@miniversestudios.com"
										className="flex items-center text-blue-400"
									>
										<Mail className="w-5 h-5 mr-2" />{' '}
										support@miniversestudios.com
									</a>
								</li>
							</ul>
						</section>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
