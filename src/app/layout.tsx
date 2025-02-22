import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import NavBar from '@/components/NavBar';
import Providers from '@/components/Providers';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Providers>
						<NavBar />
						<main>{children}</main>
						<Toaster />
					</Providers>
				</ThemeProvider>
			</body>
		</html>
	);
}
