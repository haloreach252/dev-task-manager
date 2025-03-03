/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import LogoutButton from './LogoutButton';
import { ModeToggle } from './ThemeToggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
	Menu,
	Home,
	LayoutGrid,
	Users,
	LogIn,
	Settings,
	User,
	LogOut,
	Shield,
} from 'lucide-react';
import prisma from '@/lib/prisma';

type GeneratedLink = {
	href: string;
	name: string;
	icon: React.ReactNode;
};

const userLinks: GeneratedLink[] = [
	{
		href: '/projects',
		name: 'Projects',
		icon: <LayoutGrid className="w-5 h-5" />,
	},
	{ href: '/teams', name: 'Teams', icon: <Users className="w-5 h-5" /> },
];

export default async function NavBar() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser();

	let userProfile = null;
	if (data?.user) {
		userProfile = await prisma.user.findUnique({
			where: { id: data.user.id },
		});
	}

	return (
		<nav className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white shadow-md">
			{/* Left Side - Logo */}
			<div className="flex items-center gap-4">
				<Link
					href="/"
					className="flex items-center space-x-2 text-lg font-semibold"
				>
					<Home className="w-5 h-5" />
					<span className="hidden md:inline">
						Miniverse Project Manager
					</span>
				</Link>
			</div>

			{/* Desktop Menu */}
			<div className="hidden md:flex items-center space-x-6">
				{data?.user &&
					userLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="flex items-center space-x-2 hover:text-indigo-400"
						>
							{link.icon}
							<span>{link.name}</span>
						</Link>
					))}
				{userProfile?.isAdmin && (
					<Link
						key={'/admin'}
						href={'/admin'}
						className="flex items-center space-x-2 hover:text-indigo-400"
					>
						<Shield />
						<span>Admin</span>
					</Link>
				)}
			</div>

			{/* Right Side - Theme Toggle & User Actions */}
			<div className="flex items-center space-x-4">
				<ModeToggle />
				{data?.user ? (
					<UserDropdown userProfile={userProfile} />
				) : (
					<Link href="/auth" className="flex items-center space-x-2">
						<LogIn className="w-5 h-5" />
						<span className="hidden md:inline">Login / Signup</span>
					</Link>
				)}
			</div>

			{/* Mobile Menu Button */}
			<div className="md:hidden">
				<MobileMenu
					userLinks={userLinks}
					isAuthenticated={!!data?.user}
				/>
			</div>
		</nav>
	);
}

// User Profile Dropdown Menu
function UserDropdown({ userProfile }: { userProfile: any }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="secondary"
					size="icon"
					className="bg-gray-800 hover:bg-gray-700"
				>
					<Avatar className="mx-auto">
						<AvatarImage
							src={userProfile?.profilePicture || ''}
							alt={userProfile?.name || 'User'}
						/>
						<AvatarFallback>
							{userProfile?.name?.charAt(0) || 'U'}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="bg-gray-900 text-white w-48"
			>
				<DropdownMenuItem asChild>
					<Link
						href="/profile"
						className="flex items-center space-x-2"
					>
						<User className="w-4 h-4" />
						<span>Profile</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link
						href="/settings"
						className="flex items-center space-x-2"
					>
						<Settings className="w-4 h-4" />
						<span>Settings</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<LogoutButton />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// Mobile Menu Drawer
function MobileMenu({
	userLinks,
	isAuthenticated,
}: {
	userLinks: GeneratedLink[];
	isAuthenticated: boolean;
}) {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon">
					<Menu className="w-6 h-6" />
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="bg-gray-900 text-white w-64">
				<div className="flex flex-col space-y-6 mt-6">
					<Link
						href="/"
						className="text-lg font-semibold flex items-center space-x-2"
					>
						<Home className="w-5 h-5" />
						<span>Home</span>
					</Link>
					{isAuthenticated &&
						userLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="flex items-center space-x-2 hover:text-indigo-400"
							>
								{link.icon}
								<span>{link.name}</span>
							</Link>
						))}
					{!isAuthenticated && (
						<Link
							href="/auth"
							className="flex items-center space-x-2 hover:text-indigo-400"
						>
							<LogIn className="w-5 h-5" />
							<span>Login / Signup</span>
						</Link>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
