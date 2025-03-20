import { Metadata } from 'next';
import ErrorContent from './ErrorContent';

export const metadata: Metadata = {
	title: 'Error | Miniverse Project Manager',
	description: 'Something went wrong. Please try again or contact support.',
};

export default function ErrorPage() {
	return <ErrorContent />;
}
