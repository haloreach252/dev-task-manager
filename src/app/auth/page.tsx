// src/app/auth/page.tsx
import AuthForm from './AuthForm';

export default async function AuthPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const redirectPath = resolvedSearchParams.redirect || '/'; // Default redirect

    return <AuthForm redirectPath={redirectPath} />;
}
