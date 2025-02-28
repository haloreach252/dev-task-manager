'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Users, PlusCircle, Loader } from 'lucide-react';

type Team = {
  id: string;
  name: string;
  totalMembers: number;
};

export default function TeamsDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newTeamName, setNewTeamName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch Teams using react-query
  const {
    data: teams,
    isLoading,
    error,
  } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await axios.get('/api/teams');
      return res.data.teams.sort((a: Team, b: Team) => a.name.localeCompare(b.name));
    },
  });

  // Mutation to create a team
  const createTeam = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/teams', { name: newTeamName });
      return res.data;
    },
    onSuccess: (newTeam) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsDialogOpen(false);
      setNewTeamName('');
      toast({
        title: 'Team Created',
        description: `Team "${newTeamName}" was successfully created.`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create team.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold">Your Teams</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="w-5 h-5 mr-2" /> Create New Team
        </Button>
      </motion.div>

      {/* Teams Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      ) : error ? (
        <div className="text-center text-red-500">Failed to load teams.</div>
      ) : teams?.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {teams.map((team) => (
            <motion.div key={team.id} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="hover:shadow-lg transition-transform cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {team.name}
                    <div className="flex items-center text-gray-500 text-sm">
                      <Users className="w-4 h-4 mr-1" />
                      {team.totalMembers}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/teams/${team.id}`}>
                    <Button className="w-full">View Team</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center text-gray-600">
          <p className="text-lg">You are not part of any teams.</p>
          <p>Create one to get started!</p>
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Team Name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
          />

          <DialogFooter>
            <Button onClick={() => createTeam.mutate()} disabled={!newTeamName}>
              {createTeam.isPending ? <Loader className="animate-spin w-5 h-5" /> : 'Create Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
