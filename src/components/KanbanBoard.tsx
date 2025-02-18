"use client";

import { useEffect, useState, useRef } from "react";
import {
  monitorForElements,
  draggable,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

type Task = {
  id: string;
  title: string;
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "task-1", title: "Task 1" },
    { id: "task-2", title: "Task 2" },
    { id: "task-3", title: "Task 3" },
  ]);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tasks.forEach((task) => {
      const element = document.getElementById(task.id);
      if (element) {
        draggable({
          element,
          onDragStart: () => {
            console.log(`Dragging ${task.id}`);
          },
          onDrop({ location }) {
            if (location.current.dropTargets.length > 0) {
              const targetId = location.current.dropTargets[0].element.id;
              reorderTasks(task.id, targetId);
            }
          },
        });
      }
    });

    // Monitor the drop container
    if (listRef.current) {
      dropTargetForElements({
        element: listRef.current,
        getData: () => ({
          type: "TASK_DROP_ZONE",
        }),
      });
    }

    // Cleanup when component unmounts
    return () => {
      monitorForElements({ canMonitor: () => false });
    };
  }, [tasks]);

  const reorderTasks = (draggedId: string, targetId: string) => {
    const draggedIndex = tasks.findIndex((task) => task.id === draggedId);
    const targetIndex = tasks.findIndex((task) => task.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newTasks = [...tasks];
      const [movedTask] = newTasks.splice(draggedIndex, 1);
      newTasks.splice(targetIndex, 0, movedTask);
      setTasks(newTasks);
    }
  };

  return (
    <div className="p-4 space-y-2 w-96 border rounded-md bg-gray-100">
      <h2 className="text-lg font-bold">Kanban Board</h2>
      <div id="task-list" ref={listRef} className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            id={task.id}
            className="p-4 bg-white border rounded-md shadow-md cursor-pointer"
          >
            {task.title}
          </div>
        ))}
      </div>
    </div>
  );
}
