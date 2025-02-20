import Link from "next/link"
import { createClient } from "@/lib/supabase"
import LogoutButton from "./LogoutButton";

type GeneratedLink = {
    href: string;
    name: string;
}

const userLinks: GeneratedLink[] = [
    { href: "/projects", name: "Projects" },
    { href: "/teams", name: "Teams" }
]

export default async function NavBar() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();

    if (error) {
        //console.log("Supabase NavBar error: ", error);
    }

    return (
        <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
            <div className="flex gap-4">
                <Link href="/">Home</Link>
                {data?.user && (
                    userLinks.map((link) => (
                        <Link key={link.href} href={link.href}>{link.name}</Link>
                    ))
                )}
            </div>
            <div>
                {!data?.user ? (
                <Link href="/auth">Login or Signup</Link>
                ) : (
                    <LogoutButton />
                )}
            </div>
        </nav>
    )
}