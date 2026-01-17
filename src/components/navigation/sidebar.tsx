'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ChefHat,
    Calendar,
    BarChart3,
    Sparkles,
    Settings,
    Home,
    ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Mes Recettes', href: '/recettes', icon: ChefHat },
    { name: 'Ma Semaine', href: '/planning/semaine', icon: Calendar },
    { name: 'Planning', href: '/planning', icon: Calendar },
    { name: 'Liste Courses', href: '/liste-courses', icon: ShoppingCart },
    { name: 'Statistiques', href: '/statistiques', icon: BarChart3 },
    { name: 'Générateur IA', href: '/generateur', icon: Sparkles },
    { name: 'Paramètres', href: '/parametres', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 border-r border-border/40 backdrop-blur-xl bg-background/80">
            {/* Logo */}
            <div className="flex items-center gap-3 h-16 px-6 border-b border-border/40">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ChefHat className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-xl font-serif font-bold">À table !</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                                'hover:bg-accent/50 hover:scale-[1.02] group',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <item.icon className={cn(
                                'w-5 h-5 transition-transform group-hover:scale-110',
                                isActive && 'scale-110'
                            )} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border/40">
                <div className="px-4 py-3 rounded-xl bg-accent/30 backdrop-blur">
                    <p className="text-xs text-muted-foreground">
                        Ton grimoire de cuisine 🍲
                    </p>
                </div>
            </div>
        </div>
    );
}
