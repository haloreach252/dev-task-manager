'use server';

import { createClient } from '@/lib/supabase';

export async function logout() {
	(await createClient()).auth.signOut();
}
