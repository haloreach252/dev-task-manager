"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
//import { supabase } from "@/lib/supabaseClient"

type Project = {
    id: string;
    name: string;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    /*
    useEffect(() => {
        const fetchSessionAndProjects = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                router.push("/auth");
                return;
            }

            // Replace the following dummy data with a call to your projects API or Supabase query.
            setProjects([
                { id: "1", name: "Project Alpha" },
                { id: "2", name: "Project Beta" },
            ]);
            setLoading(false);
        };

        fetchSessionAndProjects();
    }, [router]);*/

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Your Projects</h1>
            <ul className="mt-4 space-y-2">
                {projects.map((project) => (
                    <li key={project.id} className="p-4 bg-white shadow rounded">
                        {project.name}
                    </li>
                ))}
            </ul>
        </div>
    )
}