import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TableOfContentsProps {
	sections: {
		id: string;
		title: string;
	}[];
	activeSection: string;
	onSectionClick: (id: string) => void;
	className?: string;
}

export function TableOfContents({
	sections,
	activeSection,
	onSectionClick,
	className,
}: TableOfContentsProps) {
	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.3 }}
			className={cn(
				'sticky top-24 h-fit p-4 rounded-lg bg-card border shadow-sm',
				className
			)}
		>
			<h2 className="text-lg font-semibold mb-4">Contents</h2>
			<nav className="space-y-2">
				{sections.map((section) => (
					<button
						key={section.id}
						onClick={() => onSectionClick(section.id)}
						className={cn(
							'block w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
							activeSection === section.id
								? 'bg-primary text-primary-foreground'
								: 'hover:bg-muted'
						)}
					>
						{section.title}
					</button>
				))}
			</nav>
		</motion.div>
	);
}
