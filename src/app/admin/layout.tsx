import { createClient } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase-db';

export default async function AdminLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const supabaseAuth = await createClient();

	const { data, error } = await supabaseAuth.auth.getUser();

	if (error || !data?.user) {
		redirect('/auth');
	}

	const { data: user, error: userError } = await supabase
		.from('users')
		.select('is_admin')
		.eq('id', data.user.id)
		.single();

	if (userError || !user || !user.is_admin) {
		notFound();
		redirect('/error');
	}

	return <>{children}</>;
}
