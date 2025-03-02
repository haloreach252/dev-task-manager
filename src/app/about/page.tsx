'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
	Rocket,
	Users,
	Lightbulb,
	Wrench,
	User,
	Mail,
	Globe,
	Check,
	Dot,
	DiamondPlus,
	DiamondPlusIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
	return (
		<div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Card className="shadow-lg hover:shadow-xl transition">
					<CardHeader>
						<CardTitle className="text-2xl">
							About Miniverse Task Manager
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6 text-gray-300 dark:text-gray-400">
						<section className="space-y-3">
							<h2 className="flex items-center text-xl font-semibold">
								<Rocket className="w-6 h-6 mr-2 text-blue-400" />{' '}
								Our Mission
							</h2>
							<p>
								At Miniverse Task Manager, our goal is simple:
								<strong>
									{' '}
									Empower developers and teams
								</strong>{' '}
								with an all-in-one project management tool that
								eliminates the need to juggle multiple apps.
							</p>
							<p>
								Unlike many existing task management tools that
								focus on a single workflow, Miniverse Task
								Manager is built to bring everything
								together—from team collaboration and task
								tracking to custom workflows—all in one
								streamlined, developer-friendly platform.
							</p>
						</section>

						<Separator />

						<section className="space-y-3">
							<h2 className="flex items-center text-xl font-semibold">
								<Users className="w-6 h-6 mr-2 text-green-400" />{' '}
								Who is Miniverse Task Manager For?
							</h2>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />
									<span>
										<strong>Solo Developers:</strong>{' '}
										Organize tasks, track progress, and
										manage projects efficiently.
									</span>
								</li>
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />
									<span>
										<strong>Indie & Small Teams:</strong>{' '}
										Improve collaboration with customizable
										workflows and team roles.
									</span>
								</li>
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />
									<span>
										<strong>
											General Project Managers:
										</strong>{' '}
										Keep tasks, deadlines, and teams in sync
										with a centralized system.
									</span>
								</li>
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />
									<span>
										<strong>Enterprise Teams:</strong> Scale
										project management with robust team
										structures and automation.
									</span>
								</li>
							</ul>
						</section>

						<Separator />

						<section className="space-y-3">
							<h2 className="flex items-center text-xl font-semibold">
								<Lightbulb className="w-6 h-6 mr-2 text-yellow-400" />{' '}
								What Makes Miniverse Task Manager Unique?
							</h2>
							<p>
								Many task management tools force users to switch
								between different apps to handle various aspects
								of project management.
								<strong>
									{' '}
									We solve this by consolidating everything
									into one powerful, interconnected system.
								</strong>
							</p>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />
									<span>
										<strong>A Robust Team System:</strong>{' '}
										Advanced role-based access control for
										seamless collaboration.
									</span>
								</li>
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />
									<span>
										<strong>
											In-Depth Project Management:
										</strong>{' '}
										Manage multiple projects, boards, and
										tasks effortlessly.
									</span>
								</li>
								<li className="flex items-center gap-2">
									<Check className="text-blue-400 w-5 h-5" />
									<span>
										<strong>Custom Workflows:</strong> Adapt
										the system to fit your project needs,
										rather than adapting your workflow to
										fit the tool.
									</span>
								</li>
							</ul>
							<p>
								With real-time collaboration, deep
								customization, and an intuitive interface,
								Miniverse Task Manager is designed to fit your
								workflow, not the other way around.
							</p>
						</section>

						<Separator />

						<section className="space-y-3">
							<h2 className="flex items-center text-xl font-semibold">
								<Wrench className="w-6 h-6 mr-2 text-purple-400" />{' '}
								Built for Efficiency & Flexibility
							</h2>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<DiamondPlusIcon className="text-blue-400 w-5 h-5" />{' '}
									<span>
										<strong>Kanban Board System:</strong> A
										highly flexible drag-and-drop task
										management system.
									</span>
								</li>
								<li className="flex items-center gap-2">
									<DiamondPlusIcon className="text-blue-400 w-5 h-5" />{' '}
									<span>
										<strong>Secure & Scalable:</strong>{' '}
										Built with Supabase for authentication,
										real-time updates, and data storage.
									</span>
								</li>
								<li className="flex items-center gap-2">
									<DiamondPlusIcon className="text-blue-400 w-5 h-5" />{' '}
									<span>
										<strong>Future-Ready:</strong> Planned
										integrations with GitHub, Discord,
										Google Docs, and automation tools.
									</span>
								</li>
							</ul>
						</section>

						<Separator />

						<section className="space-y-3">
							<h2 className="flex items-center text-xl font-semibold">
								<User className="w-6 h-6 mr-2 text-orange-400" />{' '}
								Who’s Behind Miniverse Task Manager?
							</h2>
							<p>
								Miniverse Task Manager is a solo development
								project created by{' '}
								<strong>Miniverse Studios LLC.</strong>
								This is an independent effort to build a better,
								more efficient project management system that
								grows with your team.
							</p>
						</section>

						<Separator />

						<section className="space-y-3">
							<h2 className="flex items-center text-xl font-semibold">
								<Mail className="w-6 h-6 mr-2 text-red-400" />{' '}
								Get in Touch
							</h2>
							<p>
								We value user feedback and are always looking
								for ways to improve. If you have feature
								requests, questions, or need support, feel free
								to reach out:
							</p>
							<ul className="list-none pl-5 space-y-2">
								<li>
									<a
										href="/contact"
										className="flex items-center text-blue-400"
									>
										<Globe className="w-5 h-5 mr-2" />{' '}
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
