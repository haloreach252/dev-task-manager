import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';

const RATE_LIMIT = 5 * 60 * 1000; // 5 minutes
const rateLimitMap = new Map(); // Temporary rate-limiting storage

export async function POST(req: Request) {
	try {
		const { name, email, message } = await req.json();
		const ip = req.headers.get('x-forwarded-for') || 'unknown-ip'; // Get user IP

		// Basic input validation
		if (!name || !email || !message) {
			return NextResponse.json(
				{ error: 'All fields are required.' },
				{ status: 400 }
			);
		}

		// Rate limiting check
		const lastSubmission = rateLimitMap.get(ip);
		const now = Date.now();

		if (lastSubmission && now - lastSubmission < RATE_LIMIT) {
			return NextResponse.json(
				{ error: 'You can only submit once every 5 minutes.' },
				{ status: 429 }
			);
		}

		// Save to database
		const { error: insertError } = await supabase
			.from('contact_submissions')
			.insert({
				name,
				email,
				message,
				created_at: new Date().toISOString(),
			});

		if (insertError) {
			console.error('Error inserting contact submission:', insertError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

		// Update rate limit tracking
		rateLimitMap.set(ip, now);

		return NextResponse.json({
			success: true,
			message: 'Message sent successfully!',
		});
	} catch (error) {
		console.error('Error submitting contact form:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
