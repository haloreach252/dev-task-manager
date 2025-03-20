'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ErrorContent() {
	return (
		<div className="container mx-auto py-8 px-4">
			<div className="max-w-2xl mx-auto">
				<Card className="border-destructive">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-destructive">
							<AlertCircle className="w-6 h-6" />
							Oops! Something went wrong
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<p className="text-muted-foreground">
							We apologize for the inconvenience. An error
							occurred while processing your request.
						</p>

						<div className="flex flex-col sm:flex-row gap-4">
							<Button asChild>
								<Link href="/">
									<Home className="w-4 h-4 mr-2" />
									Back to Home
								</Link>
							</Button>
							<Button
								variant="outline"
								onClick={() => window.location.reload()}
							>
								<RefreshCw className="w-4 h-4 mr-2" />
								Try Again
							</Button>
						</div>

						<div className="pt-4 border-t">
							<p className="text-sm text-muted-foreground">
								If the problem persists, please{' '}
								<Link
									href="/contact"
									className="text-primary hover:underline"
								>
									contact our support team
								</Link>
								.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
