// src/lib/supabaseClient.ts
// client-side supabase client. Not really used for much at the moment

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	);
}
