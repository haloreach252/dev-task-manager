'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Plus, LayoutGrid, ListChecks, RefreshCcw } from 'lucide-react';

type Project = {
  id: string;
  name: string;
  description: string;
  team: { name: string };
  updatedAt: string;
  totalBoards: number;
  totalTasks: number;
};

type Team = {
  id: string;
  name: string;
};

export default function ProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    teamId: '',
  });

  // Fetch projects using React Query
  const {
    data: projects,
    isLoading,
    error,
    refetch,
  } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await axios.get('/api/projects');
      return res.data.projects;
    },
  });

  // Fetch teams for the user
  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await axios.get('/api/teams');
      return res.data.teams;
    },
  });

  // Mutation for creating new project
  const createProject = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/projects', newProject);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDialogOpen(false);
      toast({
        title: 'Project Created',
        description: 'The project was successfully created',
      });
      setNewProject({ name: '', description: '', teamId: '' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create project.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <Card className="p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Projects {projects ? `(${projects.length})` : ''}
        </h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Create New Project
        </Button>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-red-500">Failed to load projects.</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCcw className="w-5 h-5 mr-2" />
            Retry
          </Button>
        </div>
      ) : projects?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className="hover:shadow-lg cursor-pointer transition-transform transform hover:scale-[1.02]"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {project.description || 'No description provided'}
                  </p>
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                    <span>Team: {project.team.name}</span>
                    <span>
                      Updated {formatDistanceToNow(new Date(project.updatedAt))} ago
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-indigo-600" />
                      <span>{project.totalBoards !== 1 ? project.totalBoards + " Boards" : project.totalBoards + " Board"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-green-600" />
                      <span>{project.totalTasks !== 1 ? project.totalTasks + " Tasks" : project.totalTasks + " Task"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-300">
          <p>No projects found. Start by creating one!</p>
        </div>
      )}

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
  );
}
