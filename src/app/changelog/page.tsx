import { Metadata } from 'next';
import ChangelogContent from './ChangelogContent';

export const metadata: Metadata = {
	title: 'Changelog | Miniverse Project Manager',
	description:
		'Track the latest updates and improvements to Miniverse Project Manager.',
};

export default function ChangelogPage() {
	return <ChangelogContent />;
}
