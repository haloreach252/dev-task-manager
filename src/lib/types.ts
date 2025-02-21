export type TeamMember = {
    id: string;
    user: { 
        id: string;
        email: string;
        name?: string;
    };
    teamRole: { 
        id: string;
        name: string;
    }
}