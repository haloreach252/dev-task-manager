import { createClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function InviteLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ token: string }>;
}>) {
	const { token } = await params;
	const supabase = await createClient();

	const { data, error } = await supabase.auth.getUser();

	if (error || !data?.user) {
		// Capture the invite token from the URL and pass it as a dedirect params
		const currentPath = `/invite/${token}`;
		redirect(`/auth?redirect=${encodeURIComponent(currentPath)}`);
	}

	return <>{children}</>;
}
