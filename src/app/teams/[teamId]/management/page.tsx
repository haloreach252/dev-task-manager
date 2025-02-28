// src/app/teams/[teamId]/management/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import InviteDialog from './InviteDialog';
import { type TeamMember } from '@/lib/types';

type TeamRole = {
	id: string;
	name: string;
};

type Team = {
	id: string;
	name: string;
};

export default function TeamManagement() {
	const params = useParams();
	const teamId = params.teamId as string;
	const [members, setMembers] = useState<TeamMember[]>([]);
	const [roles, setRoles] = useState<TeamRole[]>([]);
	const [team, setTeam] = useState<Team>();
	const { toast } = useToast();

	useEffect(() => {
		axios
			.get(`/api/teams/${teamId}`)
			.then((res) => setTeam(res.data.team))
			.catch((err) => console.error('Failed to fetch team: ', err));

		axios
			.get(`/api/teams/${teamId}/members`)
			.then((res) => setMembers(res.data.members))
			.catch((err) => console.error('Failed to fetch members:', err));

		axios
			.get(`/api/teams/${teamId}/roles`)
			.then((res) => setRoles(res.data.roles))
			.catch((err) => console.error('Failed to fetch team roles: ', err));
	}, [teamId]);

	const handleRoleChange = async (memberId: string, newRoleId: string) => {
		try {
			await axios.patch(`/api/teams/${teamId}/members`, {
				memberId,
				roleId: newRoleId,
			});

			toast({
				title: 'Role Updated',
				description: 'Member role has been updated',
			});

			// Refresh members list
			const res = await axios.get(`/api/teams/${teamId}/members`);
			setMembers(res.data.members);
		} catch (error) {
			console.error(error);
			toast({
				title: 'Error',
				description: 'Failed to update role.',
				variant: 'destructive',
			});
		}
	};

	const handleRemoveMember = async (memberId: string) => {
		try {
			await axios.delete(`/api/teams/${teamId}/members`, {
				data: { memberId },
			});

			toast({
				title: 'Member Removed',
				description: 'The member has been removed from the team.',
			});

			setMembers(members.filter((member) => member.id !== memberId));
		} catch (error) {
			console.error(error);
			toast({
				title: 'Error',
				description: 'Failed to remove member.',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="p-8">
			<h1 className="text-3xl font-bold mb-6">
				{team?.name} - Team Management
			</h1>

			{/* Members List */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{members.map((member) => (
					<Card key={member.id}>
						<CardHeader>
							<CardTitle>
								{member.user.name || member.user.email}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-600">
								Email: {member.user.email}
							</p>

							{/* Role Selector */}
							<Select
								value={member.teamRole.id}
								onValueChange={(newRoleId) =>
									handleRoleChange(member.id, newRoleId)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select Role" />
								</SelectTrigger>
								<SelectContent>
									{roles.map((role) => (
										<SelectItem
											key={role.id}
											value={role.id}
										>
											{role.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{/* Remove Member Button */}
							<Button
								variant="destructive"
								className="mt-4"
								onClick={() => handleRemoveMember(member.id)}
							>
								Remove Member
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Invite Dialog */}
			<InviteDialog teamId={teamId} setMembers={setMembers} />
		</div>
	);
}
