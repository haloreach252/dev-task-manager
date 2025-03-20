'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
	Card,
	CardHeader,
	CardContent,
	CardTitle,
	CardDescription,
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
import { motion } from 'framer-motion';
import { User, Calendar, Settings, Camera, Loader2 } from 'lucide-react';

export default function ProfilePage() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	// Fetch user profile
	const {
		data: user,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['userProfile'],
		queryFn: async () => {
			try {
				console.log('Fetching user profile...');
				const { data: response } = await axios.get<{
					success: boolean;
					data: UserProfile;
				}>('/api/user/profile');
				console.log('User profile data:', response);
				return response.data;
			} catch (error) {
				console.error('Error fetching user profile:', error);
				throw error;
			}
		},
		retry: false, // Don't retry on error
	});

	// State for editing profile
	const [editOpen, setEditOpen] = useState(false);
	const [editName, setEditName] = useState('');
	const [uploading, setUploading] = useState(false);
	const [showUploadDialog, setShowUploadDialog] = useState(false);

	// Mutation for updating profile name
	const updateProfileMutation = useMutation({
		mutationFn: async (name: string) => {
			try {
				console.log('Updating profile name to:', name);
				const { data } = await axios.put('/api/user/profile', { name });
				console.log('Updated profile data:', data);
				return data;
			} catch (error) {
				console.error('Error updating profile:', error);
				throw error;
			}
		},
		onSuccess: (updatedUser) => {
			queryClient.setQueryData(['userProfile'], updatedUser);
			setEditOpen(false);
			toast({ title: 'Profile updated successfully' });
		},
		onError: (error) => {
			console.error('Profile update error:', error);
			toast({
				title: 'Failed to update profile',
				description:
					error instanceof Error
						? error.message
						: 'Unknown error occurred',
				variant: 'destructive',
			});
		},
	});

	// Mutation for uploading profile picture
	const uploadProfilePictureMutation = useMutation({
		mutationFn: async (file: File) => {
			try {
				console.log('Uploading profile picture...');
				const formData = new FormData();
				formData.append('file', file);

				const { data } = await axios.post(
					'/api/user/upload-profile-picture',
					formData,
					{
						headers: { 'Content-Type': 'multipart/form-data' },
					}
				);
				console.log('Upload response:', data);
				return data.profilePicture;
			} catch (error) {
				console.error('Error uploading profile picture:', error);
				throw error;
			}
		},
		onSuccess: (profilePicture) => {
			queryClient.setQueryData(
				['userProfile'],
				(oldData: UserProfile | undefined) => {
					return oldData ? { ...oldData, profilePicture } : oldData;
				}
			);
			toast({ title: 'Profile picture updated' });
			setShowUploadDialog(false);
		},
		onError: (error) => {
			console.error('Profile picture upload error:', error);
			toast({
				title: 'Failed to upload picture',
				description:
					error instanceof Error
						? error.message
						: 'Unknown error occurred',
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
			<div className="container mx-auto px-4 py-8">
				<Card className="max-w-2xl mx-auto">
					<CardHeader>
						<div className="flex items-center gap-4">
							<Skeleton className="w-20 h-20 rounded-full" />
							<div className="space-y-2">
								<Skeleton className="h-6 w-48" />
								<Skeleton className="h-4 w-32" />
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-32" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-32" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-32" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Card className="max-w-2xl mx-auto">
					<CardContent className="py-8">
						<div className="text-center space-y-4">
							<p className="text-red-500">
								Failed to load profile
							</p>
							{error instanceof Error && (
								<p className="text-sm text-muted-foreground">
									{error.message}
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Card className="max-w-2xl mx-auto">
					<CardContent className="py-8">
						<div className="text-center space-y-4">
							<p>No profile found.</p>
							<p className="text-sm text-muted-foreground">
								Please make sure you are logged in.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Card className="max-w-2xl mx-auto">
					<CardHeader>
						<div className="flex items-center gap-4">
							<div className="relative group">
								<Avatar className="w-20 h-20">
									<AvatarImage
										src={user?.profilePicture || ''}
										alt={
											user?.name || 'User profile picture'
										}
									/>
									<AvatarFallback>
										{user?.name?.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<Button
									variant="outline"
									size="icon"
									className="absolute bottom-0 right-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
									onClick={() => setShowUploadDialog(true)}
								>
									<Camera className="w-4 h-4" />
								</Button>
							</div>
							<div>
								<CardTitle className="text-2xl">
									{user?.name}
								</CardTitle>
								<CardDescription>{user?.email}</CardDescription>
							</div>
						</div>
					</CardHeader>

					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<h3 className="font-medium flex items-center gap-2">
									<User className="w-4 h-4" />
									Account Information
								</h3>
								<div className="space-y-2">
									<Label>User ID</Label>
									<p className="text-sm text-muted-foreground">
										{user?.id}
									</p>
								</div>
								<div className="space-y-2">
									<Label>Email</Label>
									<p className="text-sm text-muted-foreground">
										{user?.email}
									</p>
								</div>
							</div>

							<div className="space-y-4">
								<h3 className="font-medium flex items-center gap-2">
									<Calendar className="w-4 h-4" />
									Account Details
								</h3>
								<div className="space-y-2">
									<Label>Member Since</Label>
									<p className="text-sm text-muted-foreground">
										{new Date(
											user?.createdAt || ''
										).toLocaleDateString()}
									</p>
								</div>
								<div className="space-y-2">
									<Label>Last Updated</Label>
									<p className="text-sm text-muted-foreground">
										{new Date(
											user?.updatedAt || ''
										).toLocaleDateString()}
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="font-medium flex items-center gap-2">
								<Settings className="w-4 h-4" />
								Account Settings
							</h3>
							<div className="flex gap-4">
								<Button variant="outline" onClick={handleEdit}>
									Edit Profile
								</Button>
								<Button
									variant="outline"
									onClick={() => setShowUploadDialog(true)}
								>
									Change Picture
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Edit Profile Modal */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Profile</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								placeholder="Enter your name"
							/>
						</div>
					</div>
					<DialogFooter className="mt-4">
						<Button
							variant="outline"
							onClick={() => setEditOpen(false)}
							disabled={updateProfileMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							disabled={updateProfileMutation.isPending}
						>
							{updateProfileMutation.isPending ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Saving...
								</>
							) : (
								'Save Changes'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Upload Profile Picture Modal */}
			<Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Upload Profile Picture</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="picture">Profile Picture</Label>
							<Input
								id="picture"
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								disabled={uploading}
							/>
						</div>
						<p className="text-sm text-muted-foreground">
							Recommended: Square image, at least 400x400px
						</p>
					</div>
					<DialogFooter className="mt-4">
						<Button
							variant="outline"
							onClick={() => setShowUploadDialog(false)}
							disabled={uploading}
						>
							Cancel
						</Button>
						{uploading && (
							<Button disabled>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Uploading...
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
