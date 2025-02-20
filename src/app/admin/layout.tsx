import { createClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
        redirect('/auth');
    }

    return (
        <>
            {children}
        </>
    )
}