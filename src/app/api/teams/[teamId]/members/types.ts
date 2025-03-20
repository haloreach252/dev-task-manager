import { z } from 'zod';

export const UpdateMemberSchema = z.object({
	memberId: z.string().min(1, 'Member ID is required'),
	teamRoleId: z.string().min(1, 'Role ID is required'),
});

export const DeleteMemberSchema = z.object({
	memberId: z.string().min(1, 'Member ID is required'),
});

export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
export type DeleteMemberInput = z.infer<typeof DeleteMemberSchema>;

export type TeamMember = {
	id: string;
	userId: string;
	teamId: string;
	teamRoleId: string;
	createdAt: Date;
	user: {
		id: string;
		email: string;
		name: string | null;
	};
	teamRole: {
		id: string;
		name: string;
		permissions: string;
	};
};

export type MembersResponse = {
	members: TeamMember[];
};

export type UpdateMemberResponse = {
	updatedMember: TeamMember;
};

export type DeleteMemberResponse = {
	message: string;
};

export const validateUpdateMember = (data: unknown) => {
	try {
		UpdateMemberSchema.parse(data);
		return null;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				code: 'VALIDATION_ERROR',
				message: error.errors[0].message,
			};
		}
		return {
			code: 'UNKNOWN_ERROR',
			message: 'An unknown error occurred',
		};
	}
};

export const validateDeleteMember = (data: unknown) => {
	try {
		DeleteMemberSchema.parse(data);
		return null;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				code: 'VALIDATION_ERROR',
				message: error.errors[0].message,
			};
		}
		return {
			code: 'UNKNOWN_ERROR',
			message: 'An unknown error occurred',
		};
	}
};
