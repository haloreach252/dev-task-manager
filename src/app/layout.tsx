import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import NavBar from '@/components/NavBar';
import Providers from '@/components/Providers';
import { ThemeProvider } from '@/components/ThemeProvider';
import Footer from '@/components/Footer';

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
						<Footer />
					</Providers>
				</ThemeProvider>
			</body>
		</html>
	);
}
