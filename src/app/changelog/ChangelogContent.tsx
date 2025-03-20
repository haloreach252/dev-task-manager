'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ChangelogEntry {
	id: string;
	version: string;
	date: string;
	features: string;
	fixes: string;
	improvements: string;
}

interface PaginatedResponse {
	data: ChangelogEntry[];
	totalPages: number;
	currentPage: number;
	totalItems: number;
}

interface ErrorResponse {
	code: string;
	message: string;
}

export default function ChangelogContent() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const { toast } = useToast();

	useEffect(() => {
		const fetchChangelog = async () => {
			try {
				setLoading(true);
				const response = await fetch(
					`/api/changelog?page=${currentPage}`
				);
				const data = await response.json();

				if (!response.ok) {
					const errorData = data as ErrorResponse;
					throw new Error(
						errorData.message || 'Failed to fetch changelog'
					);
				}

				const paginatedData = data as PaginatedResponse;
				// Ensure data is an array
				setChangelog(
					Array.isArray(paginatedData.data) ? paginatedData.data : []
				);
				setTotalPages(paginatedData.totalPages);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: 'Failed to load changelog'
				);
				toast({
					title: 'Error',
					description:
						'Failed to load changelog. Please try again later.',
					variant: 'destructive',
				});
			} finally {
				setLoading(false);
			}
		};

		fetchChangelog();
	}, [currentPage, toast]);

	if (loading) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="max-w-3xl mx-auto">
					<div className="animate-pulse space-y-8">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="border-l-4 border-primary">
								<CardHeader>
									<div className="h-6 bg-muted rounded w-1/4"></div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{[1, 2, 3].map((j) => (
											<div
												key={j}
												className="h-4 bg-muted rounded w-3/4"
											></div>
										))}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="max-w-3xl mx-auto">
					<Card className="border-destructive">
						<CardHeader>
							<CardTitle className="text-destructive">
								Error
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">{error}</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (!changelog || changelog.length === 0) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="max-w-3xl mx-auto">
					<Card>
						<CardHeader>
							<CardTitle>No Changelog Entries</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								No changelog entries have been created yet.
								Check back later for updates!
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-4xl font-bold mb-8">Changelog</h1>
				<p className="text-muted-foreground mb-8">
					Track the latest updates and improvements to Miniverse
					Project Manager.
				</p>

				<div className="space-y-8">
					{changelog.map((entry) => (
						<Card
							key={entry.id}
							className="border-l-4 border-primary"
						>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Version {entry.version}</span>
									<span className="text-sm text-muted-foreground">
										{new Date(
											entry.date
										).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-4">
									{JSON.parse(entry.features).map(
										(feature: string, index: number) => (
											<li
												key={`feature-${index}`}
												className="flex items-start gap-2"
											>
												<span className="text-sm font-medium capitalize text-primary">
													feature:
												</span>
												<span>{feature}</span>
											</li>
										)
									)}
									{JSON.parse(entry.fixes).map(
										(fix: string, index: number) => (
											<li
												key={`fix-${index}`}
												className="flex items-start gap-2"
											>
												<span className="text-sm font-medium capitalize text-primary">
													fix:
												</span>
												<span>{fix}</span>
											</li>
										)
									)}
									{JSON.parse(entry.improvements).map(
										(
											improvement: string,
											index: number
										) => (
											<li
												key={`improvement-${index}`}
												className="flex items-start gap-2"
											>
												<span className="text-sm font-medium capitalize text-primary">
													improvement:
												</span>
												<span>{improvement}</span>
											</li>
										)
									)}
								</ul>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex justify-center gap-4 mt-8">
						<button
							onClick={() =>
								setCurrentPage((p) => Math.max(1, p - 1))
							}
							disabled={currentPage === 1}
							className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
						>
							Previous
						</button>
						<span className="px-4 py-2">
							Page {currentPage} of {totalPages}
						</span>
						<button
							onClick={() =>
								setCurrentPage((p) =>
									Math.min(totalPages, p + 1)
								)
							}
							disabled={currentPage === totalPages}
							className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
						>
							Next
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
