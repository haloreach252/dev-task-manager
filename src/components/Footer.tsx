import Link from 'next/link';
import { Separator } from './ui/separator';
import { FaGithub, FaDiscord } from 'react-icons/fa';
import { MessageCircle, FileText, Shield, Info, List } from 'lucide-react';

export default function Footer() {
	return (
		<footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-8 mt-12">
			<div className="container mx-auto px-6 md:px-12">
				{/* Footer Content */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
					{/* Navigation Links */}
					<div>
						<h4 className="font-semibold text-lg mb-3">
							Navigation
						</h4>
						<ul className="space-y-2">
							<FooterLink
								href="/about"
								icon={<Info className="w-4 h-4" />}
							>
								About
							</FooterLink>
							<FooterLink
								href="/features"
								icon={<List className="w-4 h-4" />}
							>
								Features
							</FooterLink>
							<FooterLink
								href="/docs"
								icon={<FileText className="w-4 h-4" />}
							>
								Docs
							</FooterLink>
							<FooterLink
								href="/contact"
								icon={<MessageCircle className="w-4 h-4" />}
							>
								Contact
							</FooterLink>
							<FooterLink
								href="/privacy-policy"
								icon={<Shield className="w-4 h-4" />}
							>
								Privacy Policy
							</FooterLink>
						</ul>
					</div>

					{/* Social Links */}
					<div>
						<h4 className="font-semibold text-lg mb-3">
							Follow Us
						</h4>
						<ul className="space-y-2">
							<FooterLink
								href="https://github.com/haloreach252/dev-task-manager"
								icon={<FaGithub className="w-4 h-4" />}
							>
								GitHub
							</FooterLink>
							<FooterLink
								href="https://discord.com"
								icon={<FaDiscord className="w-4 h-4" />}
							>
								Discord
							</FooterLink>
						</ul>
					</div>

					{/* Changelog / Updates */}
					<div>
						<h4 className="font-semibold text-lg mb-3">
							Latest Updates
						</h4>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Stay updated with the latest features & fixes.
						</p>
						<Link
							href="/changelog"
							className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
						>
							View Changelog →
						</Link>
					</div>

					<Separator className="my-6" />

					{/* Footer Bottom */}
					<div className="text-center text-sm text-gray-500 dark:text-gray-400">
						© {new Date().getFullYear()} Miniverse Studios. All
						rights reserved.
					</div>
				</div>
			</div>
		</footer>
	);
}

// Reusable footer link component
function FooterLink({
	href,
	children,
	icon,
}: {
	href: string;
	children: React.ReactNode;
	icon: React.ReactNode;
}) {
	return (
		<li>
			<Link
				href={href}
				className="flex items-center space-x-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
			>
				{icon}
				<span>{children}</span>
			</Link>
		</li>
	);
}
