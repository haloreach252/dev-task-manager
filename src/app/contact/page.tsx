'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Send, MessageCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import axios from 'axios';

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		message: '',
	});
	const [loading, setLoading] = useState(false);
	const [responseMessage, setResponseMessage] = useState('');

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setResponseMessage('');

		try {
			const response = await axios.post('/api/contact', formData);
			setResponseMessage(response.data.message);
			setFormData({ name: '', email: '', message: '' }); // Reset form on success
		} catch (error) {
			setResponseMessage(
				err.response?.data?.error || 'An error occurred.'
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Card className="shadow-lg hover:shadow-xl transition">
					<CardHeader>
						<CardTitle className="text-2xl">Contact Us</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6 text-gray-300 dark:text-gray-400">
						<p>
							Have a question, feature request, or need support?
							Fill out the form below or reach out via email.
						</p>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-400"
								>
									Name
								</label>
								<Input
									id="name"
									name="name"
									type="text"
									placeholder="Enter your name"
									value={formData.name}
									onChange={handleChange}
									required
								/>
							</div>

							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-400"
								>
									Email
								</label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="Enter your email"
									value={formData.email}
									onChange={handleChange}
									required
								/>
							</div>

							<div>
								<label
									htmlFor="message"
									className="block text-sm font-medium text-gray-400"
								>
									Message
								</label>
								<Textarea
									id="message"
									name="message"
									rows={4}
									placeholder="Type your message here..."
									value={formData.message}
									onChange={handleChange}
									required
								/>
							</div>

							<Button
								type="submit"
								className="w-full flex items-center gap-2"
								disabled={loading}
							>
								<Send className="w-5 h-5" /> Send Message
							</Button>

							{responseMessage && <p>{responseMessage}</p>}
						</form>

						<div className="space-y-4">
							<h2 className="text-lg font-semibold">
								Other Ways to Reach Us
							</h2>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<Mail className="text-blue-400 w-6 h-6" />
									<a
										href="mailto:support@miniversestudios.com"
										className="text-blue-400 hover:underline"
									>
										support@miniversestudios.com
									</a>
								</li>
								<li className="flex items-center gap-2">
									<MessageCircle className="text-blue-400 w-6 h-6" />
									<a
										href="/contact"
										className="text-blue-400 hover:underline"
									>
										Contact Form
									</a>
								</li>
								{/*
								<li className="flex items-center gap-2">
									<Phone className="text-blue-400 w-6 h-6" />
									<span>(+1) 123-456-7890</span>
								</li>*/}
							</ul>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
