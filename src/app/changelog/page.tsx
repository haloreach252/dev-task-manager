'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
	ChevronDown,
	ChevronUp,
	PlusCircle,
	Bug,
	Wrench,
	ArrowLeft,
	ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface ChangelogEntry {
	id: string;
	version: string;
	date: string;
	features: string[];
	fixes: string[];
	improvements: string[];
}

export default function ChangelogPage() {
	const [currentPage, setCurrentPage] = useState(1);
	const [expanded, setExpanded] = useState<string | null>(null);

	// Fetch changelog entries using TanStack Query
	const { data, isLoading, error } = useQuery({
		queryKey: ['changelog', currentPage],
		queryFn: async () => {
			const response = await axios.get(
				`/api/changelog?page=${currentPage}`
			);
			return response.data;
		},
	});

	if (isLoading)
		return (
			<p className="text-center text-gray-400">Loading changelog...</p>
		);
	if (error)
		return (
			<p className="text-center text-red-400">
				Failed to load changelog.
			</p>
		);

	return (
		<div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Card className="shadow-lg hover:shadow-xl transition">
					<CardHeader>
						<CardTitle className="text-2xl">Changelog</CardTitle>
						<p className="text-gray-400 text-sm">
							Stay updated with the latest changes and
							improvements.
						</p>
					</CardHeader>
					<CardContent className="space-y-6">
						{data.changelog.map((entry: ChangelogEntry) => (
							<div
								key={entry.id}
								className="border-b border-gray-700 pb-4"
							>
								<button
									className="w-full text-left flex items-center justify-between py-2"
									onClick={() =>
										setExpanded(
											expanded === entry.id
												? null
												: entry.id
										)
									}
								>
									<h3 className="text-lg font-semibold">
										v{entry.version} –{' '}
										{new Date(
											entry.date
										).toLocaleDateString()}
									</h3>
									{expanded === entry.id ? (
										<ChevronUp className="w-5 h-5 text-gray-400" />
									) : (
										<ChevronDown className="w-5 h-5 text-gray-400" />
									)}
								</button>

								{expanded === entry.id && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										transition={{ duration: 0.3 }}
										className="mt-2 space-y-3"
									>
										<Separator />

										{/* New Features */}
										{entry.features.length > 0 && (
											<div>
												<h4 className="flex items-center text-blue-400 text-md font-semibold">
													<PlusCircle className="w-5 h-5 mr-2" />{' '}
													New Features
												</h4>
												<ul className="space-y-1 pl-6">
													{entry.features.map(
														(feature, index) => (
															<li
																key={index}
																className="list-disc"
															>
																<ReactMarkdown>
																	{feature}
																</ReactMarkdown>
															</li>
														)
													)}
												</ul>
											</div>
										)}

										{/* Improvements */}
										{entry.improvements.length > 0 && (
											<div>
												<h4 className="flex items-center text-yellow-400 text-md font-semibold">
													<Wrench className="w-5 h-5 mr-2" />{' '}
													Improvements
												</h4>
												<ul className="space-y-1 pl-6">
													{entry.improvements.map(
														(
															improvement,
															index
														) => (
															<li
																key={index}
																className="list-disc"
															>
																<ReactMarkdown>
																	{
																		improvement
																	}
																</ReactMarkdown>
															</li>
														)
													)}
												</ul>
											</div>
										)}

										{/* Bug Fixes */}
										{entry.fixes.length > 0 && (
											<div>
												<h4 className="flex items-center text-red-400 text-md font-semibold">
													<Bug className="w-5 h-5 mr-2" />{' '}
													Bug Fixes
												</h4>
												<ul className="space-y-1 pl-6">
													{entry.fixes.map(
														(fix, index) => (
															<li
																key={index}
																className="list-disc"
															>
																<ReactMarkdown>
																	{fix}
																</ReactMarkdown>
															</li>
														)
													)}
												</ul>
											</div>
										)}
									</motion.div>
								)}
							</div>
						))}
					</CardContent>
				</Card>
			</motion.div>

			{/* Pagination */}
			<div className="flex justify-between items-center mt-6">
				<button
					className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
					disabled={currentPage === 1}
					onClick={() => setCurrentPage(currentPage - 1)}
				>
					<ArrowLeft className="w-5 h-5" /> Previous
				</button>

				<span className="text-gray-400">
					Page {currentPage} of {data.totalPages}
				</span>

				<button
					className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
					disabled={currentPage === data.totalPages}
					onClick={() => setCurrentPage(currentPage + 1)}
				>
					Next <ArrowRight className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
}
