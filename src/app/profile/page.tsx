/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import {
	Card,
	CardHeader,
	CardContent,
	CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { type User as UserProfile } from '@prisma/client';

export default function ProfilePage() {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [editOpen, setEditOpen] = useState(false);
	const [editName, setEditName] = useState('');
	const [uploading, setUploading] = useState(false);

	const { toast } = useToast();

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const { data } = await axios.get<UserProfile>(
					'/api/user/profile'
				);
				setUser(data);
			} catch (err: any) {
				console.error('Error fetching profile: ', err);
				setError('Failed to load profile');
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, []);

	const handleEdit = () => {
		setEditName(user?.name || '');
		setEditOpen(true);
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('file', file);

		setUploading(true);
		try {
			const { data } = await axios.post(
				'/api/user/upload-profile-picture',
				formData,
				{
					headers: { 'Content-Type': 'multipart/form-data' },
				}
			);

			setUser((prev) =>
				prev ? { ...prev, profilePicture: data.profilePicture } : null
			);
			toast({ title: 'Profile picture updated' });
		} catch (err) {
			toast({
				title: 'Failed to upload picture',
				variant: 'destructive',
			});
		} finally {
			setUploading(false);
		}
	};

	const handleSave = async () => {
		try {
			const { data } = await axios.put('/api/user/profile', {
				name: editName,
			});

			setUser(data);
			setEditOpen(false);
			toast({ title: 'Profile updated successfully' });
		} catch (err) {
			console.error('Error updating profile: ', err);
			toast({
				title: 'Failed to update profile',
				variant: 'destructive',
			});
		}
	};

	if (loading) {
		return (
			<Card className="max-w-lg mx-auto p-6">
				<CardHeader>
					<Skeleton className="w-24 h-24 rounded-full mx-auth mb-4" />
					<Skeleton className="h-6 w-1/2 mx-auto" />
				</CardHeader>
				<CardContent className="space-y-2">
					<Skeleton className="h-4 w-3/4 mx-auto" />
					<Skeleton className="h-4 w-2/4 mx-auto" />
					<Skeleton className="h-4 w-1/4 mx-auto" />
				</CardContent>
			</Card>
		);
	}

	if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
	if (!user) return <p className="text-center mt-10">No profile found.</p>;

	return (
		<>
			<Card className="max-w-lg mx-auto p-6">
				<CardHeader className="text-center">
					<Avatar className="w-24 h-24 mx-auto mb-4">
						<AvatarImage
							src={user?.profilePicture || ''}
							alt={user?.name || 'User profile picture'}
						/>
						<AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
					</Avatar>
					<h1 className="text-2xl font-bold">{user?.name}</h1>
					<Badge variant="secondary" className="mt-2 capitalize">
						Temp area
					</Badge>
				</CardHeader>

				<CardContent className="space-y-4">
					<div>
						<p className="text-sm font-medium text-gray-500">
							Email
						</p>
						<p>{user?.email}</p>
					</div>
					<div>
						<p className="text-sm font-medium text-gray-500">
							User ID
						</p>
						<p>{user?.id}</p>
					</div>
				</CardContent>

				<CardFooter className="flex justify-between">
					<Input
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						disabled={uploading}
					/>
					<Button variant="outline" onClick={handleEdit}>
						Edit Profile
					</Button>
				</CardFooter>
			</Card>

			{/* Edit Profile Modal */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Name</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={editName}
							onChange={(e) => setEditName(e.target.value)}
						/>
					</div>
					<DialogFooter className="mt-4">
						<Button
							variant="outline"
							onClick={() => setEditOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleSave}>Save Changes</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
