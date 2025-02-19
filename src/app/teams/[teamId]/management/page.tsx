"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

type TeamMember = {
  id: string;
  user: { id: string; email: string; name?: string };
  teamRole: { id: string; name: string };
};

export default function TeamManagement() {
  const params = useParams();
  const teamId = params.teamId as string;
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    axios
      .get(`/api/teams/${teamId}/members`)
      .then((res) => setMembers(res.data.members))
      .catch((err) => console.error(err));
  }, [teamId]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      await axios.post(`/api/teams/${teamId}/invite`, { email: inviteEmail });
      setInviteEmail("");
      // Refresh members list after inviting
      const res = await axios.get(`/api/teams/${teamId}/members`);
      setMembers(res.data.members);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Team Management</h1>
      <h2 className="text-xl font-semibold mb-2">Team Members</h2>
      <ul className="mb-4">
        {members.map((member) => (
          <li key={member.id}>
            {member.user.email} — {member.teamRole.name}
          </li>
        ))}
      </ul>
      <div>
        <h2 className="text-xl font-semibold mb-2">Invite New Member</h2>
        <input
          type="email"
          placeholder="User email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          className="border p-2 mr-2"
        />
        <button onClick={handleInvite} className="bg-blue-500 text-white p-2">
          Send Invite
        </button>
      </div>
    </div>
  );
}
