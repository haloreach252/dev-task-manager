import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Providers from "@/components/Providers";


export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          <main>
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
