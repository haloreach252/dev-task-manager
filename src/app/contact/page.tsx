import { Metadata } from 'next';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
	title: 'Contact | Miniverse Project Manager',
	description: 'Get in touch with the Miniverse Project Manager team.',
};

export default function ContactPage() {
	return <ContactContent />;
}
