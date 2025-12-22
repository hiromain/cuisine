import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { RecipeProvider } from '@/context/recipe-context';
import { PlanningProvider } from '@/context/planning-context';
import { SettingsProvider } from '@/context/settings-context';
import './globals.css';

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
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SettingsProvider>
          <RecipeProvider>
            <PlanningProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </PlanningProvider>
          </RecipeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
