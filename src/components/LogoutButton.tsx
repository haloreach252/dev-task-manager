// src/components/LogoutButton.tsx

'use client';

import { createClient } from '@/lib/supabaseClient';

export default function LogoutButton() {
	const handleLogout = async () => {
		const supabase = createClient();
		await supabase.auth.signOut();
		window.location.reload();
	};

	return (
		<button onClick={handleLogout} className="hover:underline">
			Logout
		</button>
	);
}
