"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

type Project = { id: string; name: string };

export default function TeamProjects() {
  const params = useParams();
  const teamId = params.teamId as string;
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    axios
      .get(`/api/teams/${teamId}/projects`)
      .then((res) => setProjects(res.data.projects))
      .catch((err) => console.error(err));
  }, [teamId]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Team Projects</h1>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={`/projects/${project.id}`}>{project.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
