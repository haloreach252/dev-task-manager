"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

type Team = { id: string; name: string };

export default function TeamsDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");

  useEffect(() => {
    axios
      .get("/api/teams")
      .then((res) => setTeams(res.data.teams))
      .catch((err) => console.error(err));
  }, []);

  const handleCreateTeam = async () => {
    if (!newTeamName) return;
    try {
      const res = await axios.post("/api/teams", { name: newTeamName });
      setTeams([...teams, res.data]);
      setNewTeamName("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Teams</h1>
      <ul className="mb-4">
        {teams.map((team) => (
          <li key={team.id}>
            <Link href={`/teams/${team.id}`}>{team.name}</Link>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <input
          type="text"
          placeholder="New Team Name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          className="border p-2 mr-2"
        />
        <button onClick={handleCreateTeam} className="bg-blue-500 text-white p-2">
          Create Team
        </button>
      </div>
    </div>
  );
}