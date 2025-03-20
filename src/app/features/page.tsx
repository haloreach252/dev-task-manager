'use client';

import { useEffect, useState } from 'react';
import { FeatureCard } from '@/components/features/FeatureCard';
import { TableOfContents } from '@/components/features/TableOfContents';
import {
	Lock,
	Users,
	LayoutGrid,
	KanbanSquare,
	Mail,
	MessageCircle,
	Code,
	FileText,
	Zap,
	BarChart,
	Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const sections = [
	{ id: 'overview', title: 'Overview' },
	{ id: 'auth', title: 'Authentication & Access' },
	{ id: 'project', title: 'Project Management' },
	{ id: 'collaboration', title: 'Collaboration' },
	{ id: 'integrations', title: 'Integrations' },
	{ id: 'advanced', title: 'Advanced Features' },
	{ id: 'contact', title: 'Get in Touch' },
];

export default function FeaturesPage() {
	const [activeSection, setActiveSection] = useState('overview');
	const [searchQuery, setSearchQuery] = useState('');

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

		return () => observer.disconnect();
	}, []);

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Left sidebar with table of contents */}
				<div className="lg:col-span-1">
					<TableOfContents
						sections={sections}
						activeSection={activeSection}
						onSectionClick={scrollToSection}
					/>
				</div>

				{/* Main content */}
				<div className="lg:col-span-3 space-y-12">
					{/* Search and filter section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col sm:flex-row gap-4 items-center justify-between"
					>
						<div className="flex-1 w-full max-w-md">
							<Input
								type="search"
								placeholder="Search features..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full"
							/>
						</div>
						<div className="flex gap-2">
							<Badge variant="outline">Available Now</Badge>
							<Badge variant="secondary">Coming Soon</Badge>
							<Badge variant="default">Beta</Badge>
						</div>
					</motion.div>

					{/* Overview Section */}
					<section id="overview" className="space-y-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<h1 className="text-4xl font-bold mb-4">
								Features
							</h1>
							<p className="text-xl text-muted-foreground">
								A powerful task management solution designed for
								developers and teams. Streamline your workflow
								with our comprehensive set of features.
							</p>
						</motion.div>
					</section>

					{/* Authentication & Access Section */}
					<section id="auth" className="space-y-6">
						<h2 className="text-3xl font-semibold mb-6">
							Authentication & Access Control
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FeatureCard
								title="Secure Authentication"
								description="Enterprise-grade security with Supabase Auth"
								icon={Lock}
								iconColor="text-green-400"
								features={[
									'Email/password login',
									'OAuth with Discord & GitHub',
									'Magic link authentication',
									'Session management',
								]}
							/>
							<FeatureCard
								title="Role-Based Access"
								description="Granular control over team permissions"
								icon={Users}
								iconColor="text-blue-400"
								features={[
									'Admin, Editor, and Viewer roles',
									'Team-based access control',
									'Board visibility settings',
									'Invite system',
								]}
							/>
						</div>
					</section>

					{/* Project Management Section */}
					<section id="project" className="space-y-6">
						<h2 className="text-3xl font-semibold mb-6">
							Project & Board Management
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FeatureCard
								title="Kanban Boards"
								description="Visual task organization with drag-and-drop"
								icon={KanbanSquare}
								iconColor="text-purple-400"
								features={[
									'Drag-and-drop interface',
									'Customizable columns',
									'Column limits',
									'Board snapshots',
								]}
							/>
							<FeatureCard
								title="Multiple Views"
								description="Different perspectives for your tasks"
								icon={LayoutGrid}
								iconColor="text-orange-400"
								features={[
									'Kanban view',
									'Calendar view',
									'Table view',
									'Custom layouts',
								]}
							/>
						</div>
					</section>

					{/* Collaboration Section */}
					<section id="collaboration" className="space-y-6">
						<h2 className="text-3xl font-semibold mb-6">
							Real-Time Collaboration
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FeatureCard
								title="Live Updates"
								description="Real-time synchronization across team members"
								icon={MessageCircle}
								iconColor="text-pink-400"
								features={[
									'Live presence indicators',
									'Real-time comments',
									'Task history tracking',
									'Change logs',
								]}
							/>
							<FeatureCard
								title="Team Communication"
								description="Built-in communication tools"
								icon={Users}
								iconColor="text-indigo-400"
								features={[
									'Task mentions',
									'Threaded comments',
									'Team activity feed',
									'Notification system',
								]}
							/>
						</div>
					</section>

					{/* Integrations Section */}
					<section id="integrations" className="space-y-6">
						<h2 className="text-3xl font-semibold mb-6">
							External Integrations
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FeatureCard
								title="GitHub Integration"
								description="Connect with your development workflow"
								icon={Code}
								iconColor="text-gray-400"
								features={[
									'Issue synchronization',
									'PR tracking',
									'Commit linking',
									'Automated updates',
								]}
								status="coming-soon"
							/>
							<FeatureCard
								title="Document Integration"
								description="Seamless document collaboration"
								icon={FileText}
								iconColor="text-yellow-400"
								features={[
									'Google Docs integration',
									'File attachments',
									'Document preview',
									'Version control',
								]}
								status="coming-soon"
							/>
						</div>
					</section>

					{/* Advanced Features Section */}
					<section id="advanced" className="space-y-6">
						<h2 className="text-3xl font-semibold mb-6">
							Advanced Features
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FeatureCard
								title="Task Automation"
								description="Streamline your workflow with automation"
								icon={Zap}
								iconColor="text-red-400"
								features={[
									'Custom automation rules',
									'Task templates',
									'Recurring tasks',
									'Dependency management',
								]}
								status="beta"
							/>
							<FeatureCard
								title="Analytics & Insights"
								description="Data-driven project management"
								icon={BarChart}
								iconColor="text-teal-400"
								features={[
									'Project analytics',
									'Team performance metrics',
									'Burndown charts',
									'Custom reports',
								]}
								status="coming-soon"
							/>
						</div>
					</section>

					{/* Contact Section */}
					<section id="contact" className="space-y-6">
						<h2 className="text-3xl font-semibold mb-6">
							Get in Touch
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FeatureCard
								title="Support"
								description="We're here to help"
								icon={Mail}
								iconColor="text-blue-400"
								features={[
									'Email support',
									'Documentation',
									'Community forum',
									'Feature requests',
								]}
							/>
							<FeatureCard
								title="Resources"
								description="Helpful resources and guides"
								icon={Globe}
								iconColor="text-green-400"
								features={[
									'API documentation',
									'Integration guides',
									'Best practices',
									'Tutorials',
								]}
							/>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
