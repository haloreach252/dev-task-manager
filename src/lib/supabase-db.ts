import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types based on your schema
export type Database = {
	public: {
		Tables: {
			users: {
				Row: {
					id: string;
					email: string;
					name: string | null;
					profile_picture: string | null;
					is_admin: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					email: string;
					name?: string | null;
					profile_picture?: string | null;
					is_admin?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					email?: string;
					name?: string | null;
					profile_picture?: string | null;
					is_admin?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			teams: {
				Row: {
					id: string;
					name: string;
					description: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					description?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					description?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			team_members: {
				Row: {
					id: string;
					user_id: string;
					team_id: string;
					team_role_id: string;
					custom_permissions: string | null;
					joined_at: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					team_id: string;
					team_role_id: string;
					custom_permissions?: string | null;
					joined_at?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					team_id?: string;
					team_role_id?: string;
					custom_permissions?: string | null;
					joined_at?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			team_roles: {
				Row: {
					id: string;
					name: string;
					permissions: string;
					team_id: string;
					can_delete: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					permissions: string;
					team_id: string;
					can_delete?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					permissions?: string;
					team_id?: string;
					can_delete?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			projects: {
				Row: {
					id: string;
					name: string;
					description: string | null;
					team_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					description?: string | null;
					team_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					description?: string | null;
					team_id?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			boards: {
				Row: {
					id: string;
					name: string;
					visibility: 'PUBLIC' | 'TEAM' | 'PRIVATE';
					background_color: string | null;
					text_color: string | null;
					gradient: string | null;
					project_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					visibility: 'PUBLIC' | 'TEAM' | 'PRIVATE';
					background_color?: string | null;
					text_color?: string | null;
					gradient?: string | null;
					project_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					visibility?: 'PUBLIC' | 'TEAM' | 'PRIVATE';
					background_color?: string | null;
					text_color?: string | null;
					gradient?: string | null;
					project_id?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			columns: {
				Row: {
					id: string;
					title: string;
					order: number;
					background_color: string | null;
					background_gradient: string | null;
					background_image: string | null;
					board_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					title: string;
					order: number;
					background_color?: string | null;
					background_gradient?: string | null;
					background_image?: string | null;
					board_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					title?: string;
					order?: number;
					background_color?: string | null;
					background_gradient?: string | null;
					background_image?: string | null;
					board_id?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			tasks: {
				Row: {
					id: string;
					title: string;
					description: string | null;
					due_date: string | null;
					order: number;
					cover_color: string | null;
					cover_gradient: string | null;
					cover_image: string | null;
					column_id: string;
					priority_id: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					title: string;
					description?: string | null;
					due_date?: string | null;
					order: number;
					cover_color?: string | null;
					cover_gradient?: string | null;
					cover_image?: string | null;
					column_id: string;
					priority_id?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					title?: string;
					description?: string | null;
					due_date?: string | null;
					order?: number;
					cover_color?: string | null;
					cover_gradient?: string | null;
					cover_image?: string | null;
					column_id?: string;
					priority_id?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			board_task_priorities: {
				Row: {
					id: string;
					name: string;
					order: number;
					board_id: string;
				};
				Insert: {
					id?: string;
					name: string;
					order: number;
					board_id: string;
				};
				Update: {
					id?: string;
					name?: string;
					order?: number;
					board_id?: string;
				};
			};
			labels: {
				Row: {
					id: string;
					name: string;
					background_color: string | null;
					board_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					background_color?: string | null;
					board_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					background_color?: string | null;
					board_id?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			task_labels: {
				Row: {
					task_id: string;
					label_id: string;
				};
				Insert: {
					task_id: string;
					label_id: string;
				};
				Update: {
					task_id?: string;
					label_id?: string;
				};
			};
			task_dependencies: {
				Row: {
					id: string;
					task_id: string;
					depends_on_id: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					task_id: string;
					depends_on_id: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					task_id?: string;
					depends_on_id?: string;
					created_at?: string;
				};
			};
			comments: {
				Row: {
					id: string;
					content: string;
					task_id: string;
					author_id: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					content: string;
					task_id: string;
					author_id: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					content?: string;
					task_id?: string;
					author_id?: string;
					created_at?: string;
				};
			};
			task_histories: {
				Row: {
					id: string;
					change: string;
					task_id: string;
					board_id: string;
					author_id: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					change: string;
					task_id: string;
					board_id: string;
					author_id?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					change?: string;
					task_id?: string;
					board_id?: string;
					author_id?: string | null;
					created_at?: string;
				};
			};
			file_attachments: {
				Row: {
					id: string;
					file_url: string;
					file_name: string;
					file_type: string | null;
					file_size: number | null;
					task_id: string;
					uploaded_by_id: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					file_url: string;
					file_name: string;
					file_type?: string | null;
					file_size?: number | null;
					task_id: string;
					uploaded_by_id?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					file_url?: string;
					file_name?: string;
					file_type?: string | null;
					file_size?: number | null;
					task_id?: string;
					uploaded_by_id?: string | null;
					created_at?: string;
				};
			};
			checklists: {
				Row: {
					id: string;
					name: string;
					task_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					task_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					task_id?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			checklist_items: {
				Row: {
					id: string;
					text: string;
					completed: boolean;
					checklist_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					text: string;
					completed?: boolean;
					checklist_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					text?: string;
					completed?: boolean;
					checklist_id?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			security_logs: {
				Row: {
					id: string;
					user_id: string;
					team_id: string;
					action_attempted: string;
					timestamp: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					team_id: string;
					action_attempted: string;
					timestamp?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					team_id?: string;
					action_attempted?: string;
					timestamp?: string;
				};
			};
			invites: {
				Row: {
					id: string;
					email: string;
					token: string;
					role: string;
					status: string;
					team_id: string;
					created_at: string;
					expires_at: string | null;
				};
				Insert: {
					id?: string;
					email: string;
					token: string;
					role: string;
					status: string;
					team_id: string;
					created_at?: string;
					expires_at?: string | null;
				};
				Update: {
					id?: string;
					email?: string;
					token?: string;
					role?: string;
					status?: string;
					team_id?: string;
					created_at?: string;
					expires_at?: string | null;
				};
			};
			integrations: {
				Row: {
					id: string;
					provider: string;
					config: string;
					team_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					provider: string;
					config: string;
					team_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					provider?: string;
					config?: string;
					team_id?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			contact_submissions: {
				Row: {
					id: string;
					name: string;
					email: string;
					message: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					email: string;
					message: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					email?: string;
					message?: string;
					created_at?: string;
				};
			};
			changelog: {
				Row: {
					id: string;
					version: string;
					date: string;
					features: string;
					fixes: string;
					improvements: string;
				};
				Insert: {
					id?: string;
					version: string;
					date?: string;
					features: string;
					fixes: string;
					improvements: string;
				};
				Update: {
					id?: string;
					version?: string;
					date?: string;
					features?: string;
					fixes?: string;
					improvements?: string;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			board_visibility: 'PUBLIC' | 'TEAM' | 'PRIVATE';
		};
	};
};
