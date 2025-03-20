'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Globe, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sections = [
	{ id: 'introduction', title: 'Introduction' },
	{ id: 'information', title: 'Information We Collect' },
	{ id: 'usage', title: 'How We Use Your Information' },
	{ id: 'sharing', title: 'Data Sharing & Third-Party Services' },
	{ id: 'rights', title: 'User Rights & Data Control' },
	{ id: 'security', title: 'Security & Data Protection' },
	{ id: 'cookies', title: 'Cookies & Tracking' },
	{ id: 'compliance', title: 'Compliance with Privacy Laws' },
	{ id: 'integrations', title: 'Future Third-Party Integrations' },
	{ id: 'changes', title: 'Changes to This Privacy Policy' },
	{ id: 'contact', title: 'Contact Us' },
];

export default function PrivacyPolicyPage() {
	const [activeSection, setActiveSection] = useState('introduction');
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
									Privacy Policy
								</CardTitle>
								<p className="text-sm text-muted-foreground">
									Last Updated:{' '}
									{new Date().toLocaleDateString()}
								</p>
							</CardHeader>
							<CardContent className="space-y-8 text-muted-foreground">
								{/* Introduction */}
								<section
									id="introduction"
									className="space-y-4"
								>
									<h2 className="text-2xl font-semibold text-foreground">
										Introduction
									</h2>
									<p>
										Welcome to Miniverse Task Manager
										(&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
										&ldquo;us&rdquo;), a task management
										tool developed and operated by Miniverse
										Studios LLC. Your privacy is important
										to us, and we are committed to
										protecting your data while providing a
										seamless task management experience.
									</p>
								</section>

								<Separator />

								{/* Information We Collect */}
								<section id="information" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground">
										Information We Collect
									</h2>
									<ul className="list-disc pl-5 space-y-2">
										<li>
											<strong>
												Account Information:
											</strong>{' '}
											Email address (via email/password or
											OAuth with Discord/GitHub).
										</li>
										<li>
											<strong>
												Task & Project Data:
											</strong>{' '}
											Data related to tasks, columns,
											boards, projects, and teams.
										</li>
										<li>
											<strong>Uploaded Files:</strong>{' '}
											Profile pictures and other files
											stored in Supabase Storage.
										</li>
										<li>
											<strong>
												Cookies & Authentication:
											</strong>{' '}
											Used only for session management and
											authentication.
										</li>
									</ul>
								</section>

								<Separator />

								{/* How We Use Your Information */}
								<section id="usage" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground">
										How We Use Your Information
									</h2>
									<ul className="list-disc pl-5 space-y-2">
										<li>
											Authentication and user account
											management.
										</li>
										<li>
											Storing and managing tasks,
											projects, and teams.
										</li>
										<li>
											Enabling real-time updates and
											collaboration.
										</li>
										<li>
											Improving the service based on
											analytics (future feature).
										</li>
									</ul>
									<p className="mt-4">
										<strong>
											We do not sell or share user data
											for advertising purposes.
										</strong>
									</p>
								</section>

								<Separator />

								{/* Data Sharing & Third-Party Services */}
								<section id="sharing" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground">
										Data Sharing & Third-Party Services
									</h2>
									<p>
										We do not sell or share your personal
										data, except as needed to provide our
										services:
									</p>
									<ul className="list-disc pl-5 space-y-2">
										<li>
											<strong>Supabase:</strong> Database,
											authentication, real-time
											collaboration, and file storage.
										</li>
										<li>
											<strong>
												Future payment processors:
											</strong>{' '}
											Not yet implemented.
										</li>
									</ul>
								</section>

								<Separator />

								{/* User Rights & Data Control */}
								<section id="rights" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground">
										User Rights & Data Control
									</h2>
									<ul className="list-disc pl-5 space-y-2">
										<li>
											<strong>Access & Update:</strong>{' '}
											Modify your account details at any
											time.
										</li>
										<li>
											<strong>
												Delete Account & Data:
											</strong>{' '}
											Permanent deletions of tasks,
											projects, and uploaded files.
										</li>
										<li>
											<strong>Data Portability:</strong>{' '}
											Request a copy of your data.
										</li>
									</ul>
									<p className="mt-4">
										Contact us at{' '}
										<a
											href="mailto:support@miniversestudios.com"
											className="text-primary hover:underline"
										>
											support@miniversestudios.com
										</a>{' '}
										or use our{' '}
										<a
											href="/contact"
											className="text-primary hover:underline"
										>
											contact form
										</a>
										.
									</p>
								</section>

								<Separator />

								{/* Security & Data Protection */}
								<section id="security" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground">
										Security & Data Protection
									</h2>
									<ul className="list-disc pl-5 space-y-2">
										<li>
											<strong>
												Row-Level Security (RLS):
											</strong>{' '}
											Ensures users only access their own
											data.
										</li>
										<li>
											<strong>Encryption:</strong> All
											data transmitted securely over
											HTTPS.
										</li>
										<li>
											<strong>Secure Storage:</strong>{' '}
											User data stored securely within
											Supabase.
										</li>
									</ul>
								</section>

								<Separator />

								{/* Cookies & Tracking */}
								<section id="cookies" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground">
										Cookies & Tracking
									</h2>
									<p>
										Miniverse Task Manager does not use
										tracking cookies. We only use essential
										cookies for session management and
										authentication.
									</p>
								</section>

								<Separator />

								{/* Compliance with Privacy Laws */}
								<section id="compliance" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground">
										Compliance with Privacy Laws
									</h2>
									<p>
										We aim to comply with GDPR (for EU
										users) and CCPA (for California users)
										where applicable.
									</p>
								</section>

								<Separator />

								{/* Future Third-Party Integrations */}
								<section
									id="integrations"
									className="space-y-4"
								>
									<h2 className="text-2xl font-semibold text-foreground">
										Future Third-Party Integrations
									</h2>
									<p>
										We plan to introduce third-party
										integrations (e.g., webhooks for
										automation). Users will have control
										over enabling or disabling these
										features.
									</p>
								</section>

								<Separator />

								{/* Changes to This Privacy Policy */}
								<section id="changes" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground">
										Changes to This Privacy Policy
									</h2>
									<p>
										We may update this Privacy Policy from
										time to time. Significant changes will
										be communicated through the app or via
										email.
									</p>
								</section>

								<Separator />

								{/* Contact Us */}
								<section id="contact" className="space-y-4">
									<h2 className="text-2xl font-semibold text-foreground">
										Contact Us
									</h2>
									<p>
										For any privacy-related questions or
										concerns, reach us via:
									</p>
									<ul className="list-none space-y-2">
										<li>
											<a
												href="mailto:support@miniversestudios.com"
												className="flex items-center text-primary hover:underline"
											>
												<Mail className="w-5 h-5 mr-2" />
												support@miniversestudios.com
											</a>
										</li>
										<li>
											<a
												href="/contact"
												className="flex items-center text-primary hover:underline"
											>
												<Globe className="w-5 h-5 mr-2" />
												Website Contact Form
											</a>
										</li>
									</ul>
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
