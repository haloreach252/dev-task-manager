// src/components/LogoutButton.tsx

'use client';

import { logout } from './actions';

export default function LogoutButton() {
	const handleLogout = async () => {
		await logout();
		window.location.reload();
	};

	return (
		<button onClick={handleLogout} className="hover:underline">
			Logout
		</button>
	);
}
