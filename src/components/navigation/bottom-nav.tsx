'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ChefHat,
    Calendar,
    Sparkles,
    Home,
    ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Recettes', href: '/recettes', icon: ChefHat },
    { name: 'Ma Semaine', href: '/planning/semaine', icon: Calendar },
    { name: 'Générateur', href: '/generateur', icon: Sparkles },
    { name: 'Courses', href: '/liste-courses', icon: ShoppingCart },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border/40 backdrop-blur-xl bg-background/95 safe-area-inset-bottom">
            <nav className="flex items-center justify-around px-2 py-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]',
                                'hover:bg-accent/50 active:scale-95',
                                isActive && 'bg-primary/10'
                            )}
                        >
                            <item.icon className={cn(
                                'w-5 h-5 transition-all',
                                isActive
                                    ? 'text-primary scale-110'
                                    : 'text-muted-foreground'
                            )} />
                            <span className={cn(
                                'text-[10px] font-medium',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
