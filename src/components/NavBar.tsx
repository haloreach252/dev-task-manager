import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import LogoutButton from './LogoutButton';
import { ModeToggle } from './ThemeToggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';

type GeneratedLink = {
	href: string;
	name: string;
};

const userLinks: GeneratedLink[] = [
	{ href: '/projects', name: 'Projects' },
	{ href: '/teams', name: 'Teams' },
];

export default async function NavBar() {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.getUser();

	if (error) {
		//console.log("Supabase NavBar error: ", error);
	}

	let userProfile = null;

	if (data?.user) {
		userProfile = await prisma.user.findUnique({
			where: { id: data.user.id },
		});
	}

	return (
		<nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
			<div className="flex gap-4">
				<Link href="/">Home</Link>
				{data?.user &&
					userLinks.map((link) => (
						<Link key={link.href} href={link.href}>
							{link.name}
						</Link>
					))}
			</div>

			<div className="flex gap-4">
				<ModeToggle />
				{!data?.user ? (
					<Link href="/auth">Login or Signup</Link>
				) : (
					<>
						<Link href="/profile">
							<Button
								variant="secondary"
								size="icon"
								className="bg-gray-800 hover:bg-gray-800"
							>
								<Avatar className="mx-auto">
									<AvatarImage
										src={userProfile?.profilePicture || ''}
										alt={
											userProfile?.name ||
											'User profile picture'
										}
									/>
									<AvatarFallback>
										{userProfile?.name?.charAt(0) || 'U'}
									</AvatarFallback>
								</Avatar>
							</Button>
						</Link>

						<LogoutButton />
					</>
				)}
			</div>
		</nav>
	);
}
