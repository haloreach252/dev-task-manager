'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Shield, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { availablePermissions, type Permission } from '@/lib/permissions';

interface TeamRole {
	id: string;
	name: string;
	canDelete: boolean;
	permissions: Record<string, boolean>;
}

interface ErrorResponse {
	code: string;
	message: string;
}

interface ApiResponse<T> {
	success: boolean;
	data: T;
	error?: ErrorResponse;
}

interface RolesResponse {
	roles: TeamRole[];
}

interface CreateRoleResponse {
	role: TeamRole;
}

interface UpdateRoleResponse {
	role: TeamRole;
}

interface DeleteRoleResponse {
	success: boolean;
}

interface RoleFormData {
	name: string;
	permissions: Record<string, boolean>;
}

// Group permissions by category
const PERMISSION_CATEGORIES = Object.entries(
	availablePermissions.reduce<Record<string, Permission[]>>(
		(acc, permission) => {
			if (!acc[permission.category]) {
				acc[permission.category] = [];
			}
			acc[permission.category].push(permission);
			return acc;
		},
		{}
	)
).map(([category, permissions]) => ({
	name: category,
	permissions,
}));

export default function RolesManagement() {
	const params = useParams();
	const teamId = params.teamId as string;
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [roleToEdit, setRoleToEdit] = useState<TeamRole | null>(null);
	const [roleToDelete, setRoleToDelete] = useState<TeamRole | null>(null);
	const [formData, setFormData] = useState<RoleFormData>({
		name: '',
		permissions: {},
	});
	const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>(
		{}
	);
	const [expandedCategories, setExpandedCategories] = useState<
		Record<string, boolean>
	>({});

	// Fetch roles
	const {
		data: roles,
		isLoading,
		isError,
		error: rolesError,
	} = useQuery({
		queryKey: ['teamRoles', teamId],
		queryFn: async () => {
			try {
				const res = await axios.get<ApiResponse<RolesResponse>>(
					`/api/teams/${teamId}/roles`
				);
				if (!res.data.success) {
					throw new Error(
						res.data.error?.message || 'Failed to fetch team roles'
					);
				}
				return res.data.data.roles;
			} catch (err) {
				const error = err as AxiosError<ApiResponse<RolesResponse>>;
				throw new Error(
					error.response?.data?.error?.message ||
						error.message ||
						'Failed to fetch team roles'
				);
			}
		},
	});

	// Create role mutation
	const createMutation = useMutation({
		mutationFn: async (data: RoleFormData) => {
			const res = await axios.post<ApiResponse<CreateRoleResponse>>(
				`/api/teams/${teamId}/roles`,
				data
			);
			if (!res.data.success) {
				throw new Error(
					res.data.error?.message || 'Failed to create role'
				);
			}
			return res.data.data.role;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['teamRoles', teamId] });
			setIsCreateDialogOpen(false);
			setFormData({ name: '', permissions: {} });
			toast({
				title: 'Role Created',
				description: 'The role has been created successfully.',
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to create role.',
				variant: 'destructive',
			});
		},
	});

	// Update role mutation
	const updateMutation = useMutation({
		mutationFn: async ({
			roleId,
			data,
		}: {
			roleId: string;
			data: RoleFormData;
		}) => {
			const res = await axios.patch<ApiResponse<UpdateRoleResponse>>(
				`/api/teams/${teamId}/roles/${roleId}`,
				data
			);
			if (!res.data.success) {
				throw new Error(
					res.data.error?.message || 'Failed to update role'
				);
			}
			return res.data.data.role;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['teamRoles', teamId] });
			setIsEditDialogOpen(false);
			setRoleToEdit(null);
			toast({
				title: 'Role Updated',
				description: 'The role has been updated successfully.',
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to update role.',
				variant: 'destructive',
			});
		},
	});

	// Delete role mutation
	const deleteMutation = useMutation({
		mutationFn: async (roleId: string) => {
			const res = await axios.delete<ApiResponse<DeleteRoleResponse>>(
				`/api/teams/${teamId}/roles/${roleId}`
			);
			if (!res.data.success) {
				throw new Error(
					res.data.error?.message || 'Failed to delete role'
				);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['teamRoles', teamId] });
			setRoleToDelete(null);
			toast({
				title: 'Role Deleted',
				description: 'The role has been deleted successfully.',
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to delete role.',
				variant: 'destructive',
			});
			setRoleToDelete(null);
		},
	});

	const handleCreateRole = (e: React.FormEvent) => {
		e.preventDefault();
		createMutation.mutate(formData);
	};

	const handleUpdateRole = (e: React.FormEvent) => {
		e.preventDefault();
		if (roleToEdit) {
			updateMutation.mutate({
				roleId: roleToEdit.id,
				data: formData,
			});
		}
	};

	const handleEditClick = (role: TeamRole) => {
		setRoleToEdit(role);
		setFormData({
			name: role.name,
			permissions: role.permissions,
		});
		setIsEditDialogOpen(true);
	};

	const handleRetry = () => {
		queryClient.invalidateQueries({ queryKey: ['teamRoles', teamId] });
	};

	const toggleRoleExpansion = (roleId: string) => {
		setExpandedRoles((prev) => ({
			...prev,
			[roleId]: !prev[roleId],
		}));
	};

	const toggleCategory = (category: string) => {
		setExpandedCategories((prev) => ({
			...prev,
			[category]: !prev[category],
		}));
	};

	if (isLoading) {
		return (
			<div className="p-8 space-y-6">
				<div className="flex items-center space-x-4">
					<Skeleton className="h-8 w-8" />
					<Skeleton className="h-10 w-64" />
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{[...Array(3)].map((_, i) => (
						<Skeleton
							key={i}
							className="h-[250px] w-full rounded-lg"
						/>
					))}
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="p-8 space-y-4">
				<h1 className="text-3xl font-bold">Role Management</h1>
				<div className="bg-red-500/10 border border-red-500 rounded-lg p-4 space-y-2">
					<div className="flex items-center space-x-2">
						<AlertTriangle className="h-5 w-5 text-red-500" />
						<p className="font-semibold text-red-500">
							Error Loading Roles
						</p>
					</div>
					<p className="text-sm text-red-500">
						{(rolesError as Error)?.message ||
							'Failed to load roles. Please try again.'}
					</p>
					<Button variant="outline" onClick={handleRetry}>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Shield className="h-8 w-8" />
					<h1 className="text-3xl font-bold">Role Management</h1>
				</div>
				<Button onClick={() => setIsCreateDialogOpen(true)}>
					Create Role
				</Button>
			</div>

			{/* Roles List */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{roles?.map((role) => (
					<Card key={role.id} className="flex flex-col">
						<CardHeader className="flex-none">
							<div className="flex items-start justify-between">
								<div className="space-y-1">
									<CardTitle>{role.name}</CardTitle>
									<CardDescription>
										{
											Object.values(
												role.permissions
											).filter(Boolean).length
										}{' '}
										permissions
									</CardDescription>
								</div>
								<div className="flex items-center space-x-2">
									<Button
										variant="outline"
										size="icon"
										onClick={() => handleEditClick(role)}
										className="h-8 w-8"
									>
										<Shield className="h-4 w-4" />
									</Button>
									<Button
										variant="destructive"
										size="icon"
										onClick={() => setRoleToDelete(role)}
										className="h-8 w-8"
									>
										<AlertTriangle className="h-4 w-4" />
									</Button>
								</div>
							</div>
							<Button
								variant="ghost"
								className="w-full justify-between mt-2"
								onClick={() => toggleRoleExpansion(role.id)}
							>
								<span className="text-sm font-medium">
									{expandedRoles[role.id] ? 'Hide' : 'Show'}{' '}
									Permissions
								</span>
								{expandedRoles[role.id] ? (
									<ChevronUp className="h-4 w-4" />
								) : (
									<ChevronDown className="h-4 w-4" />
								)}
							</Button>
						</CardHeader>
						{expandedRoles[role.id] && (
							<CardContent className="space-y-4">
								{PERMISSION_CATEGORIES.map((category) => {
									const categoryPermissions =
										category.permissions.filter(
											(permission) =>
												role.permissions[permission.key]
										);

									if (categoryPermissions.length === 0)
										return null;

									return (
										<div
											key={category.name}
											className="space-y-2"
										>
											<h4 className="text-sm font-semibold text-muted-foreground">
												{category.name}
											</h4>
											<div className="space-y-2">
												{categoryPermissions.map(
													(permission) => (
														<div
															key={permission.key}
															className="flex items-start space-x-2 py-1"
														>
															<Shield className="h-4 w-4 mt-0.5 text-gray-400" />
															<div>
																<p className="text-sm font-medium">
																	{
																		permission.label
																	}
																</p>
																<p className="text-xs text-gray-500">
																	Level{' '}
																	{
																		permission.level
																	}
																</p>
															</div>
														</div>
													)
												)}
											</div>
										</div>
									);
								})}
							</CardContent>
						)}
					</Card>
				))}
			</div>

			{/* Create Role Dialog */}
			<Dialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
			>
				<DialogContent>
					<form onSubmit={handleCreateRole}>
						<DialogHeader>
							<DialogTitle>Create New Role</DialogTitle>
							<DialogDescription>
								Create a new role with specific permissions for
								your team members.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="name">Role Name</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
									placeholder="Enter role name"
								/>
							</div>
							<div className="space-y-4">
								<Label>Permissions</Label>
								<div className="border rounded-lg divide-y">
									{PERMISSION_CATEGORIES.map((category) => (
										<div
											key={category.name}
											className="px-4"
										>
											<Button
												type="button"
												variant="ghost"
												className="w-full justify-between py-4"
												onClick={() =>
													toggleCategory(
														category.name
													)
												}
											>
												<span className="text-sm font-medium">
													{category.name}
												</span>
												{expandedCategories[
													category.name
												] ? (
													<ChevronUp className="h-4 w-4" />
												) : (
													<ChevronDown className="h-4 w-4" />
												)}
											</Button>
											{expandedCategories[
												category.name
											] && (
												<div className="pb-4 space-y-4">
													{category.permissions.map(
														(permission) => (
															<div
																key={
																	permission.key
																}
																className="flex items-start space-x-2 py-2"
															>
																<Checkbox
																	id={
																		permission.key
																	}
																	checked={
																		formData
																			.permissions[
																			permission
																				.key
																		] ||
																		false
																	}
																	onCheckedChange={(
																		checked
																	) => {
																		setFormData(
																			{
																				...formData,
																				permissions:
																					{
																						...formData.permissions,
																						[permission.key]:
																							checked ===
																							true,
																					},
																			}
																		);
																	}}
																/>
																<div className="grid gap-1.5 leading-none">
																	<label
																		htmlFor={
																			permission.key
																		}
																		className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
																	>
																		{
																			permission.label
																		}
																	</label>
																	<p className="text-xs text-muted-foreground">
																		Level{' '}
																		{
																			permission.level
																		}
																	</p>
																</div>
															</div>
														)
													)}
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsCreateDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit">Create Role</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Edit Role Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<form onSubmit={handleUpdateRole}>
						<DialogHeader>
							<DialogTitle>Edit Role</DialogTitle>
							<DialogDescription>
								Modify the role&apos;s name and permissions.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="edit-name">Role Name</Label>
								<Input
									id="edit-name"
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
									placeholder="Enter role name"
								/>
							</div>
							<div className="space-y-4">
								<Label>Permissions</Label>
								<div className="border rounded-lg divide-y">
									{PERMISSION_CATEGORIES.map((category) => (
										<div
											key={category.name}
											className="px-4"
										>
											<Button
												type="button"
												variant="ghost"
												className="w-full justify-between py-4"
												onClick={() =>
													toggleCategory(
														category.name
													)
												}
											>
												<span className="text-sm font-medium">
													{category.name}
												</span>
												{expandedCategories[
													category.name
												] ? (
													<ChevronUp className="h-4 w-4" />
												) : (
													<ChevronDown className="h-4 w-4" />
												)}
											</Button>
											{expandedCategories[
												category.name
											] && (
												<div className="pb-4 space-y-4">
													{category.permissions.map(
														(permission) => (
															<div
																key={
																	permission.key
																}
																className="flex items-start space-x-2 py-2"
															>
																<Checkbox
																	id={
																		permission.key
																	}
																	checked={
																		formData
																			.permissions[
																			permission
																				.key
																		] ||
																		false
																	}
																	onCheckedChange={(
																		checked
																	) => {
																		setFormData(
																			{
																				...formData,
																				permissions:
																					{
																						...formData.permissions,
																						[permission.key]:
																							checked ===
																							true,
																					},
																			}
																		);
																	}}
																/>
																<div className="grid gap-1.5 leading-none">
																	<label
																		htmlFor={
																			permission.key
																		}
																		className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
																	>
																		{
																			permission.label
																		}
																	</label>
																	<p className="text-xs text-muted-foreground">
																		Level{' '}
																		{
																			permission.level
																		}
																	</p>
																</div>
															</div>
														)
													)}
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsEditDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit">Update Role</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Role Confirmation Dialog */}
			<AlertDialog
				open={!!roleToDelete}
				onOpenChange={() => setRoleToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Role</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete the role &quot;
							{roleToDelete?.name}&quot;? This action cannot be
							undone. Members with this role will need to be
							reassigned.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								roleToDelete &&
								deleteMutation.mutate(roleToDelete.id)
							}
							className="bg-red-500 hover:bg-red-600"
						>
							Delete Role
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
