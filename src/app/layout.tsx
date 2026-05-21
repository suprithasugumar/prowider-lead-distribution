import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Prowider Lead System',
  description: 'Lead Distribution System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen text-slate-100 antialiased`}>
        <nav className="bg-slate-950/70 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-8">
                <div className="flex-shrink-0 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500 font-extrabold text-2xl tracking-tight">
                  Prowider
                </div>
                <div className="hidden sm:flex sm:space-x-6 h-full">
                  <Link href="/request-service" className="border-transparent text-slate-400 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 hover:border-blue-500/50 text-sm font-semibold transition-all duration-200">
                    Submit Lead
                  </Link>
                  <Link href="/dashboard" className="border-transparent text-slate-400 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 hover:border-violet-500/50 text-sm font-semibold transition-all duration-200">
                    Dashboard
                  </Link>
                  <Link href="/test-tools" className="border-transparent text-slate-400 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 hover:border-emerald-500/50 text-sm font-semibold transition-all duration-200">
                    Test Tools
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
