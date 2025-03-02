'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
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
							Privacy Policy
						</CardTitle>
						<p className="text-sm text-gray-600 dark:text-gray-500">
							Last Updated: 03/02/2025
						</p>
					</CardHeader>
					<CardContent className="space-y-6 text-gray-800 dark:text-gray-400">
						<p>
							Welcome to Miniverse Task Manager ("we," "our," or
							"us"), a task management tool developed and operated
							by Miniverse Studios LLC. Your privacy is important
							to us, and we are committed to protecting your data
							while providing a seamless task management
							experience.
						</p>

						<Separator />

						<section>
							<h2 className="text-xl font-semibold mb-2">
								1. Information We Collect
							</h2>
							<ul className="list-disc pl-5 space-y-1">
								<li>
									📧 <strong>Account Information:</strong>{' '}
									Email address (via email/password or OAuth
									with Discord/GitHub).
								</li>
								<li>
									📌 <strong>Task & Project Data:</strong>{' '}
									Data related to tasks, columns, boards,
									projects, and teams.
								</li>
								<li>
									📂 <strong>Uploaded Files:</strong> Profile
									pictures and other files stored in Supabase
									Storage.
								</li>
								<li>
									🍪{' '}
									<strong>Cookies & Authentication:</strong>{' '}
									Used only for session management and
									authentication.
								</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-2">
								2. How We Use Your Information
							</h2>
							<ul className="list-disc pl-5 space-y-1">
								<li>
									🔑 Authentication and user account
									management.
								</li>
								<li>
									📋 Storing and managing tasks, projects, and
									teams.
								</li>
								<li>
									🔄 Enabling real-time updates and
									collaboration.
								</li>
								<li>
									📊 Improving the service based on analytics
									(future feature).
								</li>
							</ul>
							<p className="mt-3">
								🚫{' '}
								<strong>
									We do not sell or share user data for
									advertising purposes.
								</strong>
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-2">
								3. Data Sharing & Third-Party Services
							</h2>
							<p>
								We do not sell or share your personal data,
								except as needed to provide our services:
							</p>
							<ul className="list-disc pl-5 space-y-1">
								<li>
									📦 <strong>Supabase:</strong> Database,
									authentication, real-time collaboration, and
									file storage.
								</li>
								<li>
									💳{' '}
									<strong>Future payment processors:</strong>{' '}
									Not yet implemented.
								</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-2">
								4. User Rights & Data Control
							</h2>
							<ul className="list-disc pl-5 space-y-1">
								<li>
									✏️ <strong>Access & Update:</strong> Modify
									your account details at any time.
								</li>
								<li>
									🗑️ <strong>Delete Account & Data:</strong>{' '}
									Permanent deletions of tasks, projects, and
									uploaded files.
								</li>
								<li>
									📄 <strong>Data Portability:</strong>{' '}
									Request a copy of your data.
								</li>
							</ul>
							<p className="mt-3">
								📧 Contact us at{' '}
								<a
									href="mailto:support@miniversestudios.com"
									className="text-blue-400"
								>
									support@miniversestudios.com
								</a>{' '}
								or use our{' '}
								<a href="/contact" className="text-blue-400">
									contact form
								</a>
								.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-2">
								5. Security & Data Protection
							</h2>
							<ul className="list-disc pl-5 space-y-1">
								<li>
									🔒{' '}
									<strong>Row-Level Security (RLS):</strong>{' '}
									Ensures users only access their own data.
								</li>
								<li>
									🔐 <strong>Encryption:</strong> All data
									transmitted securely over HTTPS.
								</li>
								<li>
									📂 <strong>Secure Storage:</strong> User
									data stored securely within Supabase.
								</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-2">
								6. Cookies & Tracking
							</h2>
							<p>
								🍪 Miniverse Task Manager does not use tracking
								cookies. We only use essential cookies for
								session management and authentication.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-2">
								7. Compliance with Privacy Laws
							</h2>
							<p>
								We aim to comply with GDPR (for EU users) and
								CCPA (for California users) where applicable.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-2">
								8. Future Third-Party Integrations
							</h2>
							<p>
								We plan to introduce third-party integrations
								(e.g., webhooks for automation). Users will have
								control over enabling or disabling these
								features.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-2">
								9. Changes to This Privacy Policy
							</h2>
							<p>
								We may update this Privacy Policy from time to
								time. Significant changes will be communicated
								through the app or via email.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-2">
								10. Contact Us
							</h2>
							<p>
								For any privacy-related questions or concerns,
								reach us via:
							</p>
							<ul className="list-none pl-5 space-y-2">
								<li>
									<a
										href="mailto:support@miniversestudios.com"
										className="flex items-center text-blue-400"
									>
										<Mail className="w-5 h-5 mr-2" />{' '}
										support@miniversestudios.com
									</a>
								</li>
								<li>
									<a
										href="/contact"
										className="flex items-center text-blue-400"
									>
										<Globe className="w-5 h-5 mr-2" />{' '}
										Website Contact Form
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
