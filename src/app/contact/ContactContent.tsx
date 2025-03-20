'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Github, Twitter } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FormData {
	name: string;
	email: string;
	message: string;
}

export default function ContactContent() {
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();
	const [formData, setFormData] = useState<FormData>({
		name: '',
		email: '',
		message: '',
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// TODO: Implement form submission
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call

			toast({
				title: 'Success',
				description:
					'Your message has been sent. We&apos;ll get back to you soon!',
			});

			setFormData({ name: '', email: '', message: '' });
		} catch {
			toast({
				title: 'Error',
				description: 'Failed to send message. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-4xl font-bold mb-8">Contact Us</h1>
				<p className="text-muted-foreground mb-8">
					Have questions or feedback? We&apos;d love to hear from you.
				</p>

				<div className="grid md:grid-cols-2 gap-8">
					{/* Contact Form */}
					<Card>
						<CardHeader>
							<CardTitle>Send us a message</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<label
										htmlFor="name"
										className="text-sm font-medium"
									>
										Name
									</label>
									<Input
										id="name"
										name="name"
										placeholder="Your name"
										value={formData.name}
										onChange={handleChange}
										required
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="email"
										className="text-sm font-medium"
									>
										Email
									</label>
									<Input
										id="email"
										name="email"
										type="email"
										placeholder="you@example.com"
										value={formData.email}
										onChange={handleChange}
										required
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="message"
										className="text-sm font-medium"
									>
										Message
									</label>
									<Textarea
										id="message"
										name="message"
										placeholder="Your message..."
										className="min-h-[150px]"
										value={formData.message}
										onChange={handleChange}
										required
									/>
								</div>
								<Button
									type="submit"
									className="w-full"
									disabled={loading}
								>
									{loading ? 'Sending...' : 'Send Message'}
								</Button>
							</form>
						</CardContent>
					</Card>

					{/* Contact Information */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Get in touch</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-start gap-3">
									<Mail className="w-5 h-5 mt-1 text-primary" />
									<div>
										<h3 className="font-medium">Email</h3>
										<p className="text-sm text-muted-foreground">
											support@miniverse.dev
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<MessageSquare className="w-5 h-5 mt-1 text-primary" />
									<div>
										<h3 className="font-medium">Discord</h3>
										<p className="text-sm text-muted-foreground">
											Join our community
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Follow us</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center gap-4">
									<a
										href="https://github.com/miniverse"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
									>
										<Github className="w-5 h-5" />
										<span>GitHub</span>
									</a>
									<a
										href="https://twitter.com/miniverse"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
									>
										<Twitter className="w-5 h-5" />
										<span>Twitter</span>
									</a>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
