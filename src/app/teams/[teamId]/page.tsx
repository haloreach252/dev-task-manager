"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

type Team = { id: string; name: string; description?: string };

export default function TeamOverview() {
  const params = useParams();
  const teamId = params.teamId as string;
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    axios
      .get(`/api/teams/${teamId}`)
      .then((res) => setTeam(res.data.team))
      .catch((err) => console.error(err));
  }, [teamId]);

  if (!team) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{team.name} Overview</h1>
      <p>{team.description || "No description available."}</p>
      <div className="mt-4 space-x-4">
        <Link href={`/teams/${teamId}/projects`} className="text-blue-500">
          Team Projects
        </Link>
        <Link href={`/teams/${teamId}/management`} className="text-blue-500">
          Team Management
        </Link>
      </div>
    </div>
  );
}
