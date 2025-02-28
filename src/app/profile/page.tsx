'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
	Card,
	CardHeader,
	CardContent,
	CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
import { type User as UserProfile } from '@prisma/client';

export default function ProfilePage() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	// Fetch user profile
	const {
		data: user,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['userProfile'],
		queryFn: async () => {
			const { data } = await axios.get<UserProfile>('/api/user/profile');
			return data;
		},
	});

	// State for editing profile
	const [editOpen, setEditOpen] = useState(false);
	const [editName, setEditName] = useState('');
	const [uploading, setUploading] = useState(false);

	// Mutation for updating profile name
	const updateProfileMutation = useMutation({
		mutationFn: async (name: string) => {
			const { data } = await axios.put('/api/user/profile', { name });
			return data;
		},
		onSuccess: (updatedUser) => {
			queryClient.setQueryData(['userProfile'], updatedUser);
			setEditOpen(false);
			toast({ title: 'Profile updated successfully' });
		},
		onError: () => {
			toast({
				title: 'Failed to update profile',
				variant: 'destructive',
			});
		},
	});

	// Mutation for uploading profile picture
	const uploadProfilePictureMutation = useMutation({
		mutationFn: async (file: File) => {
			const formData = new FormData();
			formData.append('file', file);

			const { data } = await axios.post(
				'/api/user/upload-profile-picture',
				formData,
				{
					headers: { 'Content-Type': 'multipart/form-data' },
				}
			);
			return data.profilePicture;
		},
		onSuccess: (profilePicture) => {
			queryClient.setQueryData(
				['userProfile'],
				(oldData: UserProfile | undefined) => {
					return oldData ? { ...oldData, profilePicture } : oldData;
				}
			);
			toast({ title: 'Profile picture updated' });
		},
		onError: () => {
			toast({
				title: 'Failed to upload picture',
				variant: 'destructive',
			});
		},
		onSettled: () => {
			setUploading(false);
		},
	});

	// Handle profile picture upload
	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploading(true);
		uploadProfilePictureMutation.mutate(file);
	};

	// Handle profile edit
	const handleEdit = () => {
		setEditName(user?.name || '');
		setEditOpen(true);
	};

	// Handle profile save
	const handleSave = () => {
		if (!editName.trim()) return;
		updateProfileMutation.mutate(editName);
	};

	if (isLoading) {
		return (
			<Card className="max-w-lg mx-auto p-6">
				<CardHeader>
					<Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
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

	if (isError) {
		return (
			<p className="text-center mt-10 text-red-500">
				Failed to load profile
			</p>
		);
	}

	if (!user) {
		return <p className="text-center mt-10">No profile found.</p>;
	}

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
					{/* Upload Profile Picture */}
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
						<Button
							onClick={handleSave}
							disabled={updateProfileMutation.isPending}
						>
							{updateProfileMutation.isPending
								? 'Saving...'
								: 'Save Changes'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
