'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { Checkbox } from '@/components/ui/checkbox';
import {
	availablePermissions,
	permissionLabels,
	permissionCategories,
} from '@/lib/permissions';
import { SquareChevronDownIcon, SquareChevronUpIcon } from 'lucide-react';

type TeamRole = {
	id: string;
	name: string;
	permissions: Record<string, boolean>;
};

export default function TeamRolesPage() {
	const params = useParams();
	const teamId = params.teamId as string;
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const { hasPermission } = usePermissions(teamId);
	const [newRoleName, setNewRoleName] = useState('');
	const [selectedPermissions, setSelectedPermissions] = useState<
		Record<string, boolean>
	>({});
	const [editingRole, setEditingRole] = useState<TeamRole | null>(null);
	const [expandedCategories, setExpandedCategories] = useState<
		Record<string, boolean>
	>({});

	// Fetch roles
	const {
		data: roles,
		isLoading,
		error,
	} = useQuery<TeamRole[]>({
		queryKey: ['teamRoles', teamId],
		queryFn: async () => {
			const res = await axios.get(`/api/teams/${teamId}/roles`);
			return res.data.roles;
		},
	});

	// Create role mutation
	const createRole = useMutation({
		mutationFn: async () => {
			await axios.post(`/api/teams/${teamId}/roles`, {
				name: newRoleName,
				permissions: JSON.stringify(selectedPermissions),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['teamRoles', teamId] });
			setNewRoleName('');
			setSelectedPermissions({});
			toast({
				title: 'Role Created',
				description: 'New role has been added.',
			});
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to create role.',
				variant: 'destructive',
			});
		},
	});

	// Edit role mutation
	const editRole = useMutation({
		mutationFn: async () => {
			if (!editingRole) return;
			await axios.patch(`/api/teams/${teamId}/roles/${editingRole.id}`, {
				name: editingRole.name,
				permissions: JSON.stringify(selectedPermissions),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['teamRoles', teamId] });
			setEditingRole(null);
			setSelectedPermissions({});
			toast({
				title: 'Role Updated',
				description: 'Role changes have been saved',
			});
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to update role.',
				variant: 'destructive',
			});
		},
	});

	const handleEditRole = (role: TeamRole) => {
		setEditingRole(role);
		setSelectedPermissions(role.permissions);
	};

	// Handle permission toggle
	const togglePermission = (key: string) => {
		setSelectedPermissions((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	// Toggle category visiblity
	const toggleCategory = (category: string) => {
		setExpandedCategories((prev) => ({
			...prev,
			[category]: !prev[category],
		}));
	};

	const groupedPermissions: Record<string, typeof availablePermissions> = {};
	availablePermissions.forEach((perm) => {
		if (!groupedPermissions[perm.category]) {
			groupedPermissions[perm.category] = [];
		}

		groupedPermissions[perm.category].push(perm);
	});

	if (isLoading) return <p>Loading roles...</p>;
	if (error) return <p className="text-red-500">Failed to load roles.</p>;

	return (
		<div className="p-8">
			<h1 className="text-3xl font-bold mb-6">Team Roles</h1>

			{/* Role List */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{roles?.map((role) => (
					<Card key={role.id} onClick={() => handleEditRole(role)}>
						<CardHeader>
							<CardTitle>{role.name}</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="text-sm">
								{Object.keys(role.permissions).map((perm) => (
									<li key={perm} className="text-gray-600">
										{permissionLabels[perm] || perm}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				))}
				<Card
					onClick={() => {
						setEditingRole(null);
						setSelectedPermissions({});
						setNewRoleName('');
					}}
				>
					<CardHeader>
						<CardTitle>New Role</CardTitle>
					</CardHeader>
					<CardContent>Click to add a new role</CardContent>
				</Card>
			</div>

			{/* Create / Edit Role Form */}
			{hasPermission(teamId, 'manageRoles') && (
				<div className="mt-8 p-4 border rounded-lg">
					<h2 className="text-xl font-semibold mb-4">
						Create New Role
					</h2>
					<Input
						placeholder="Role Name"
						value={
							editingRole !== null
								? editingRole.name
								: newRoleName
						}
						onChange={
							editingRole !== null
								? (e) =>
										setEditingRole({
											...editingRole,
											name: e.target.value,
										})
								: (e) => setNewRoleName(e.target.value)
						}
						className="mb-4"
					/>

					{/* Permission Categories */}
					<div className="grid grid-cols-3 gap-4 auto-rows-min">
						{Object.keys(groupedPermissions).map((category) => (
							<div
								key={category}
								className="border p-4 rounded-lg flex flex-col self-start"
							>
								<button
									type="button"
									className="w-full text-left font-semibold flex justify-between items-center"
									onClick={() => toggleCategory(category)}
								>
									{category}{' '}
									<span>
										{expandedCategories[category] ? (
											<SquareChevronUpIcon className="w-5 h-5" />
										) : (
											<SquareChevronDownIcon className="w-5 h-5" />
										)}
									</span>
								</button>
								{expandedCategories[category] && (
									<div className="mt-2 grid grid-cols-2 gap-2">
										{groupedPermissions[category].map(
											(perm) => (
												<Button
													key={perm.key}
													className={`text-sm ${
														selectedPermissions[
															perm.key
														]
															? 'bg-blue-500 text-white'
															: 'bg-gray-400 text-black'
													}`}
													onClick={(e) => {
														e.preventDefault();
														togglePermission(
															perm.key
														);
													}}
												>
													{perm.label}
												</Button>
											)
										)}
									</div>
								)}
							</div>
						))}
					</div>

					<Button
						className="mt-4"
						onClick={
							editingRole !== null
								? () => editRole.mutate()
								: () => createRole.mutate()
						}
						disabled={
							editingRole !== null
								? !editingRole.name || editRole.isPending
								: !newRoleName || createRole.isPending
						}
					>
						{editingRole !== null
							? editRole.isPending
								? 'Saving...'
								: 'Save Role'
							: createRole.isPending
							? 'Creating...'
							: 'Create Role'}
						{/*createRole.isPending || editRole.isPending
							? 'Creating...'
							: 'Create Role'*/}
					</Button>
				</div>
			)}
		</div>
	);
}
