// src/app/projects/[projectId]/page.tsx

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
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
import { Plus, Eye, Users, Lock, RefreshCcw, ListChecks } from 'lucide-react';

type Board = {
  id: string;
  name: string;
  visibility: 'PUBLIC' | 'TEAM' | 'PRIVATE';
  totalTasks: number;
};

export default function ProjectBoardsPage() {
  const router = useRouter();
  const { projectId } = useParams(); // ✅ useParams hook
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'TEAM' | 'PRIVATE'>(
    'PRIVATE'
  );

  // Fetch Boards using React Query
  const {
    data: boards,
    isLoading,
    error,
    refetch,
  } = useQuery<Board[]>({
    queryKey: ['boards', projectId],
    queryFn: async () => {
      const res = await axios.get(`/api/projects/${projectId}/boards`);
      return res.data;
    },
  });

  // Mutation for creating a board
  const createBoard = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`/api/projects/${projectId}/boards`, {
        name: newBoardName,
        visibility,
      });
      return res.data;
    },
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ['boards', projectId] });
      setIsDialogOpen(false);
      setNewBoardName('');
      toast({
        title: 'Board Created',
        description: 'The board was successfully created.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create board.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <Card className="p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Project Boards {boards ? `(${boards.length})` : ''}
        </h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Create New Board
        </Button>
      </Card>

      {/* Boards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-red-500">Failed to load boards.</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCcw className="w-5 h-5 mr-2" />
            Retry
          </Button>
        </div>
      ) : boards?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className="hover:shadow-lg cursor-pointer transition-transform transform hover:scale-[1.02]"
                onClick={() => router.push(`/boards/${board.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {board.name}
                    {board.visibility === 'PUBLIC' ? (
                      <Eye className="w-5 h-5 text-green-500" />
                    ) : board.visibility === 'TEAM' ? (
                      <Users className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Lock className="w-5 h-5 text-red-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-indigo-600" />
                      <span>{board.totalTasks} Tasks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-300">
          <p>No boards found. Start by creating one!</p>
        </div>
      )}

      {/* Create Board Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Board Name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
          />

          <DialogFooter>
            <Button onClick={() => createBoard.mutate()} disabled={!newBoardName}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
