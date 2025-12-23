
import type { Metadata } from 'next';
import { Inter, Alegreya } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { RecipeProvider } from '@/context/recipe-context';
import { PlanningProvider } from '@/context/planning-context';
import { SettingsProvider } from '@/context/settings-context';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'A table ! - Votre livre de recettes',
  description: 'Gérez et découvrez de nouvelles recettes de cuisine.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${alegreya.variable} antialiased`} suppressHydrationWarning>
      <body className="font-sans min-h-screen bg-background text-foreground flex flex-col">
        <FirebaseClientProvider>
          <SettingsProvider>
            <RecipeProvider>
              <PlanningProvider>
                <div className="relative flex flex-col flex-1">
                  <Header />
                  <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                  </main>
                </div>
                <Toaster />
              </PlanningProvider>
            </RecipeProvider>
          </SettingsProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
