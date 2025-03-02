import { createClient } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export default async function AdminLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.getUser();

	if (error || !data?.user) {
		redirect('/auth');
	}

	const user = await prisma.user.findUnique({
		where: { id: data.user.id },
	});

	if (!user || !user.isAdmin) {
		notFound();
		redirect('/error');
	}

	return <>{children}</>;
}
