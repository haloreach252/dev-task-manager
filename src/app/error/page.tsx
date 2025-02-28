// src/app/error/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ErrorPage() {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6">
			<Alert variant="destructive" className="max-w-md text-center">
				<AlertTitle>Something Went Wrong</AlertTitle>
				<AlertDescription>
					An unexpected error occurred. Please try again later.
				</AlertDescription>
			</Alert>

			<div className="mt-6 flex gap-4">
				<Button variant="secondary" onClick={() => router.back()}>
					Try Again
				</Button>
				<Button onClick={() => router.push('/')}>Go Home</Button>
			</div>
		</div>
	);
}
