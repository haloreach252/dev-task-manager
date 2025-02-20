"use client"

import { useState } from "react"
import axios from "axios"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Project = {
    id: string;
    name: string;
    description: string;
    team: { name: string };
    updatedAt: string;
}

type Team = {
    id: string;
    name: string;
}

export default function ProjectsPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: "", description: "", teamId: ""});

    // Fetch projects using react query
    const { data: projects, isLoading, error } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: async () => { const res = await axios.get('/api/projects'); return res.data.projects; }
    });

    // Fetch teams for the user
    const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
        queryKey: ['teams'],
        queryFn: async () => { const res = await axios.get('/api/teams'); return res.data.teams}
    })

    // Mutation for creating new project
    const createProject = useMutation({
        mutationFn: async () => {
            const res = await axios.post('/api/projects', newProject);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects']});
            setIsDialogOpen(false);
            toast({
                title: "Project Created",
                description: "The project was successfully created"
            });
            setNewProject({ name: "", description: "", teamId: "" });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to create project.",
                variant: 'destructive'
            })
        }
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Projects</h1>
                <Button onClick={() => setIsDialogOpen(true)}>Create New Project</Button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <p>Loading projects...</p>
                ) : error ? (
                    <p>Error loading projects.</p>
                ) : projects?.length ? (
                    projects.map((project) => (
                        <Card key={project.id} className="hover:shadow-lg cursor-pointer">
                            <CardHeader>
                                <CardTitle>{project.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">{project.description || "No description provided"}</p>
                                <p className="text-xs text-gray-500 mt-2">Team: {project.team.name}</p>
                                <p className="text-xs text-gray-400">Updated: {new Date(project.updatedAt).toLocaleDateString()}</p>
                            </CardContent>
                        </Card>
                    ))
                ): (
                    <p>No projects found. Start by creating one!</p>
                )}
            </div>

            {/* Create Project Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>

                    <Input
                        placeholder="Project Name"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    />

                    <Textarea
                        placeholder="Project Description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    />

                    <Select
                        value={newProject.teamId}
                        onValueChange={(value) => setNewProject({ ...newProject, teamId: value })}
                        disabled={teamsLoading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a Team" />
                        </SelectTrigger>
                        <SelectContent>
                            {teams?.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                    {team.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <DialogFooter>
                        <Button onClick={() => createProject.mutate()} disabled={!newProject.name || !newProject.teamId}>
                            Create Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}