import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
	title: string;
	description: string;
	icon: LucideIcon;
	iconColor: string;
	features: string[];
	status?: 'available' | 'coming-soon' | 'beta';
	className?: string;
}

export function FeatureCard({
	title,
	description,
	icon: Icon,
	iconColor,
	features,
	status = 'available',
	className,
}: FeatureCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className={cn('h-full', className)}
		>
			<Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-xl flex items-center gap-2">
							<Icon className={cn('w-6 h-6', iconColor)} />
							{title}
						</CardTitle>
						{status !== 'available' && (
							<Badge
								variant={
									status === 'coming-soon'
										? 'secondary'
										: 'default'
								}
							>
								{status === 'coming-soon'
									? 'Coming Soon'
									: 'Beta'}
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-gray-300 dark:text-gray-400">
						{description}
					</p>
					<ul className="space-y-2">
						{features.map((feature, index) => (
							<li
								key={index}
								className="flex items-center gap-2 text-sm"
							>
								<span className="text-blue-400">•</span>
								{feature}
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</motion.div>
	);
}
