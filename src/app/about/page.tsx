'use client';

import { useEffect, useState } from 'react';
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
	DiamondPlusIcon,
	ArrowUp,
	Github,
	Twitter,
	Linkedin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sections = [
	{ id: 'mission', title: 'Our Mission' },
	{ id: 'audience', title: 'Who is it For?' },
	{ id: 'unique', title: 'What Makes it Unique?' },
	{ id: 'efficiency', title: 'Built for Efficiency' },
	{ id: 'team', title: "Who's Behind It?" },
	{ id: 'contact', title: 'Get in Touch' },
];

export default function AboutPage() {
	const [activeSection, setActiveSection] = useState('mission');
	const [showBackToTop, setShowBackToTop] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				});
			},
			{ threshold: 0.5 }
		);

		sections.forEach((section) => {
			const element = document.getElementById(section.id);
			if (element) observer.observe(element);
		});

		const handleScroll = () => {
			setShowBackToTop(window.scrollY > 500);
		};

		window.addEventListener('scroll', handleScroll);
		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	};

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Left sidebar with table of contents */}
				<div className="lg:col-span-1">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3 }}
						className="sticky top-24 h-fit p-4 rounded-lg bg-card border shadow-sm"
					>
						<h2 className="text-lg font-semibold mb-4">Contents</h2>
						<nav className="space-y-2">
							{sections.map((section) => (
								<button
									key={section.id}
									onClick={() => scrollToSection(section.id)}
									className={cn(
										'block w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
										activeSection === section.id
											? 'bg-primary text-primary-foreground'
											: 'hover:bg-muted'
									)}
								>
									{section.title}
								</button>
							))}
						</nav>
					</motion.div>
				</div>

				{/* Main content */}
				<div className="lg:col-span-3">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<Card className="shadow-lg">
							<CardHeader>
								<CardTitle className="text-3xl">
									About Miniverse Task Manager
								</CardTitle>
								<p className="text-sm text-muted-foreground">
									Empowering developers and teams with a
									powerful task management solution
								</p>
							</CardHeader>
							<CardContent className="space-y-8 text-muted-foreground">
								{/* Mission Section */}
								<section id="mission" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground flex items-center">
										<Rocket className="w-6 h-6 mr-2 text-blue-400" />
										Our Mission
									</h2>
									<p>
										At Miniverse Task Manager, our goal is
										simple:{' '}
										<strong>
											Empower developers and teams
										</strong>{' '}
										with an all-in-one project management
										tool that eliminates the need to juggle
										multiple apps.
									</p>
									<p>
										Unlike many existing task management
										tools that focus on a single workflow,
										Miniverse Task Manager is built to bring
										everything together—from team
										collaboration and task tracking to
										custom workflows—all in one streamlined,
										developer-friendly platform.
									</p>
								</section>

								<Separator />

								{/* Audience Section */}
								<section id="audience" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground flex items-center">
										<Users className="w-6 h-6 mr-2 text-green-400" />
										Who is Miniverse Task Manager For?
									</h2>
									<ul className="space-y-3">
										<li className="flex items-center gap-2">
											<Check className="text-blue-400 w-5 h-5" />
											<span>
												<strong>
													Solo Developers:
												</strong>{' '}
												Organize tasks, track progress,
												and manage projects efficiently.
											</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="text-blue-400 w-5 h-5" />
											<span>
												<strong>
													Indie & Small Teams:
												</strong>{' '}
												Improve collaboration with
												customizable workflows and team
												roles.
											</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="text-blue-400 w-5 h-5" />
											<span>
												<strong>
													General Project Managers:
												</strong>{' '}
												Keep tasks, deadlines, and teams
												in sync with a centralized
												system.
											</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="text-blue-400 w-5 h-5" />
											<span>
												<strong>
													Enterprise Teams:
												</strong>{' '}
												Scale project management with
												robust team structures and
												automation.
											</span>
										</li>
									</ul>
								</section>

								<Separator />

								{/* Unique Features Section */}
								<section id="unique" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground flex items-center">
										<Lightbulb className="w-6 h-6 mr-2 text-yellow-400" />
										What Makes Miniverse Task Manager
										Unique?
									</h2>
									<p>
										Many task management tools force users
										to switch between different apps to
										handle various aspects of project
										management.{' '}
										<strong>
											We solve this by consolidating
											everything into one powerful,
											interconnected system.
										</strong>
									</p>
									<ul className="space-y-3">
										<li className="flex items-center gap-2">
											<Check className="text-blue-400 w-5 h-5" />
											<span>
												<strong>
													A Robust Team System:
												</strong>{' '}
												Advanced role-based access
												control for seamless
												collaboration.
											</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="text-blue-400 w-5 h-5" />
											<span>
												<strong>
													In-Depth Project Management:
												</strong>{' '}
												Manage multiple projects,
												boards, and tasks effortlessly.
											</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="text-blue-400 w-5 h-5" />
											<span>
												<strong>
													Custom Workflows:
												</strong>{' '}
												Adapt the system to fit your
												project needs, rather than
												adapting your workflow to fit
												the tool.
											</span>
										</li>
									</ul>
									<p>
										With real-time collaboration, deep
										customization, and an intuitive
										interface, Miniverse Task Manager is
										designed to fit your workflow, not the
										other way around.
									</p>
								</section>

								<Separator />

								{/* Efficiency Section */}
								<section id="efficiency" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground flex items-center">
										<Wrench className="w-6 h-6 mr-2 text-purple-400" />
										Built for Efficiency & Flexibility
									</h2>
									<ul className="space-y-3">
										<li className="flex items-center gap-2">
											<DiamondPlusIcon className="text-blue-400 w-5 h-5" />
											<span>
												<strong>
													Kanban Board System:
												</strong>{' '}
												A highly flexible drag-and-drop
												task management system.
											</span>
										</li>
										<li className="flex items-center gap-2">
											<DiamondPlusIcon className="text-blue-400 w-5 h-5" />
											<span>
												<strong>
													Secure & Scalable:
												</strong>{' '}
												Built with Supabase for
												authentication, real-time
												updates, and data storage.
											</span>
										</li>
										<li className="flex items-center gap-2">
											<DiamondPlusIcon className="text-blue-400 w-5 h-5" />
											<span>
												<strong>Future-Ready:</strong>{' '}
												Planned integrations with
												GitHub, Discord, Google Docs,
												and automation tools.
											</span>
										</li>
									</ul>
								</section>

								<Separator />

								{/* Team Section */}
								<section id="team" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground flex items-center">
										<User className="w-6 h-6 mr-2 text-orange-400" />
										Who&apos;s Behind Miniverse Task
										Manager?
									</h2>
									<p>
										Miniverse Task Manager is a solo
										development project created by{' '}
										<strong>Miniverse Studios LLC.</strong>{' '}
										This is an independent effort to build a
										better, more efficient project
										management system that grows with your
										team.
									</p>
								</section>

								<Separator />

								{/* Contact Section */}
								<section id="contact" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground flex items-center">
										<Mail className="w-6 h-6 mr-2 text-red-400" />
										Get in Touch
									</h2>
									<p>
										We value user feedback and are always
										looking for ways to improve. If you have
										feature requests, questions, or need
										support, feel free to reach out:
									</p>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<h3 className="font-medium">
												Contact Options
											</h3>
											<ul className="space-y-2">
												<li>
													<a
														href="/contact"
														className="flex items-center text-primary hover:underline"
													>
														<Globe className="w-5 h-5 mr-2" />
														Contact Form
													</a>
												</li>
												<li>
													<a
														href="mailto:support@miniversestudios.com"
														className="flex items-center text-primary hover:underline"
													>
														<Mail className="w-5 h-5 mr-2" />
														support@miniversestudios.com
													</a>
												</li>
											</ul>
										</div>
										<div className="space-y-2">
											<h3 className="font-medium">
												Follow Us
											</h3>
											<ul className="space-y-2">
												<li>
													<a
														href="https://github.com/miniverse"
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center text-primary hover:underline"
													>
														<Github className="w-5 h-5 mr-2" />
														GitHub
													</a>
												</li>
												<li>
													<a
														href="https://twitter.com/miniverse"
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center text-primary hover:underline"
													>
														<Twitter className="w-5 h-5 mr-2" />
														Twitter
													</a>
												</li>
												<li>
													<a
														href="https://linkedin.com/company/miniverse"
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center text-primary hover:underline"
													>
														<Linkedin className="w-5 h-5 mr-2" />
														LinkedIn
													</a>
												</li>
											</ul>
										</div>
									</div>
								</section>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</div>

			{/* Back to Top Button */}
			<AnimatePresence>
				{showBackToTop && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className="fixed bottom-8 right-8"
					>
						<Button
							onClick={scrollToTop}
							size="icon"
							className="rounded-full shadow-lg"
						>
							<ArrowUp className="w-5 h-5" />
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
