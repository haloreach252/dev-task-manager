// src/app/projects/[projectId]/page.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
  } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Plus, Eye, Users, Lock, RefreshCcw, ListChecks, SortAsc, SortDesc } from 'lucide-react';

const sortingOptions = [
  { label: 'Most Tasks', value: 'mostTasks' },
  { label: 'Alphabetical', value: 'alphabetical' },
  { label: 'Recently Updated', value: 'recentlyUpdated' },
];

type Board = {
  id: string;
  name: string;
  visibility: 'PUBLIC' | 'TEAM' | 'PRIVATE';
  totalTasks: number;
  updatedAt: string;
};

export default function ProjectBoardsPage() {
  const router = useRouter();
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sorting, setSorting] = useState('mostTasks');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'TEAM' | 'PRIVATE'>(
    'PRIVATE'
  );

  const { data: boards, isLoading, error, refetch } = useQuery<Board[]>({
    queryKey: ['boards', projectId],
    queryFn: async () => {
      const res = await axios.get(`/api/projects/${projectId}/boards`);
      return res.data.boards;
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

  const updateBoardName = useMutation({
    mutationFn: async ({ boardId, name }: { boardId: string; name: string }) => {
      await axios.put(`/api/projects/${projectId}/boards/${boardId}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', projectId] });
      setEditingBoardId(null);
      toast({ title: 'Board Updated', description: 'Board name updated successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update board name.', variant: 'destructive' });
    },
  });

  const handleEdit = (board: Board) => {
    setEditingBoardId(board.id);
    setEditingName(board.name);
  };

  const handleSave = (boardId: string) => {
    if (editingName.trim() && editingName !== boards?.find(b => b.id === boardId)?.name) {
      updateBoardName.mutate({ boardId, name: editingName });
    } else {
      setEditingBoardId(null);
    }
  };

  const sortedBoards = boards?.slice().sort((a, b) => {
    if (sorting === 'mostTasks') return b.totalTasks - a.totalTasks;
    if (sorting === 'alphabetical') return a.name.localeCompare(b.name);
    if (sorting === 'recentlyUpdated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    return 0;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Project Boards</h1>
        <div className="flex gap-4">
          <select
            className="p-2 border rounded"
            value={sorting}
            onChange={(e) => setSorting(e.target.value)}
          >
            {sortingOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" /> Create New Board
          </Button>
        </div>
      </div>

      {/* Boards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      ) : error ? (
        <div className="text-center text-red-500">Failed to load boards.</div>
      ) : sortedBoards?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBoards.map((board) => (
            <motion.div key={board.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}>
              <Card className="hover:shadow-lg cursor-pointer transition-transform hover:scale-105">
                <CardHeader>
                  {editingBoardId === board.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(board.id);
                        if (e.key === 'Escape') setEditingBoardId(null);
                      }}
                      autoFocus
                      onBlur={() => handleSave(board.id)}
                    />
                  ) : (
                    <CardTitle className="flex justify-between items-center" onClick={() => handleEdit(board)}>
                      {board.name}
                      {board.visibility === 'PUBLIC' ? (
                        <Eye className="w-5 h-5 text-green-500" />
                      ) : board.visibility === 'TEAM' ? (
                        <Users className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Lock className="w-5 h-5 text-red-500" />
                      )}
                    </CardTitle>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-gray-700">
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
        <div className="text-center text-gray-600">No boards found. Start by creating one!</div>
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
