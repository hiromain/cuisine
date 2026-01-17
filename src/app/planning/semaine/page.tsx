'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus, ShoppingCart, Sparkles } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePlanning } from '@/context/planning-context';
import { useRecipes } from '@/context/recipe-context';
import Link from 'next/link';
import type { MealSlot, MealType } from '@/lib/types';
import { QuickAddRecipeDialog } from '@/components/planning/quick-add';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MEAL_SLOTS: { slot: MealSlot; label: string; icon: string }[] = [
    { slot: 'lunch', label: 'Déjeuner', icon: '🍽️' },
    { slot: 'dinner', label: 'Dîner', icon: '🌙' },
];

export default function WeekPlanningPage() {
    const [currentWeekStart, setCurrentWeekStart] = useState(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );
    const [selectedSlot, setSelectedSlot] = useState<{ date: Date; slot: MealSlot } | null>(null);

    const { getPlanForDate, removeRecipeFromPlan } = usePlanning();
    const { recipes } = useRecipes();

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    }, [currentWeekStart]);

    const goToPreviousWeek = () => setCurrentWeekStart(prev => addWeeks(prev, -1));
    const goToNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));
    const goToCurrentWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

    const isCurrentWeek = isSameDay(currentWeekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));

    // Compter les recettes planifiées
    const totalMeals = weekDays.reduce((count, day) => {
        MEAL_SLOTS.forEach(({ slot }) => {
            const plans = getPlanForDate(day);
            const mealPlan = plans.find(p => p.meal === slot);
            if (mealPlan && mealPlan.recipes.length > 0) count++;
        });
        return count;
    }, 0);

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl sm:text-5xl font-serif font-bold">
                    Ma <span className="text-primary">Semaine</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Planifie tes repas de la semaine en quelques clics et génère ta liste de courses automatiquement.
                </p>
            </div>

            {/* Navigation semaine */}
            <div className="flex items-center justify-between gap-4 bg-card/50 rounded-2xl p-4 backdrop-blur-sm border border-border/50">
                <Button variant="outline" size="icon" onClick={goToPreviousWeek} className="rounded-xl">
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex-1 text-center space-y-1">
                    <h2 className="text-2xl font-serif font-bold">
                        {format(weekDays[0], 'd MMM', { locale: fr })} - {format(weekDays[6], 'd MMM yyyy', { locale: fr })}
                    </h2>
                    {!isCurrentWeek && (
                        <Button variant="ghost" size="sm" onClick={goToCurrentWeek} className="text-primary">
                            Revenir à cette semaine
                        </Button>
                    )}
                </div>

                <Button variant="outline" size="icon" onClick={goToNextWeek} className="rounded-xl">
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            {/* Stats rapides */}
            <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <span className="font-bold text-primary text-lg">{totalMeals}</span>
                    <span className="text-sm text-muted-foreground">repas planifiés</span>
                </div>
                <Button asChild variant="outline" className="rounded-full">
                    <Link href="/liste-courses">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Générer liste de courses
                    </Link>
                </Button>
            </div>

            {/* Grille semaine */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {weekDays.map((day, dayIndex) => {
                    const isToday = isSameDay(day, new Date());

                    return (
                        <Card
                            key={dayIndex}
                            className={`border-2 rounded-2xl overflow-hidden ${isToday ? 'border-primary shadow-lg' : 'border-border/50'
                                }`}
                        >
                            <CardHeader className={`pb-3 ${isToday ? 'bg-primary/5' : 'bg-muted/30'}`}>
                                <CardTitle className="text-center">
                                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                        {DAYS[dayIndex]}
                                    </div>
                                    <div className={`text-2xl font-serif font-bold ${isToday ? 'text-primary' : ''}`}>
                                        {format(day, 'd')}
                                    </div>
                                    {isToday && (
                                        <div className="text-xs text-primary font-bold mt-1">Aujourd'hui</div>
                                    )}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-3 space-y-2">
                                {MEAL_SLOTS.map(({ slot, label, icon }) => {
                                    const plans = getPlanForDate(day);
                                    const mealPlan = plans.find(p => p.meal === slot);
                                    const recipeIds = mealPlan?.recipes || [];

                                    return (
                                        <div key={slot} className="space-y-1">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                                <span>{icon}</span>
                                                <span>{label}</span>
                                            </div>

                                            {recipeIds.length > 0 ? (
                                                <div className="space-y-1">
                                                    {recipeIds.map((recipeInfo, idx) => {
                                                        const recipe = recipes.find(r => r.id === recipeInfo.recipeId);
                                                        if (!recipe) return null;

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="group relative bg-primary/5 hover:bg-primary/10 rounded-lg p-2 text-sm cursor-pointer transition-colors"
                                                            >
                                                                <div className="font-medium line-clamp-2 pr-6">{recipe.title}</div>
                                                                <button
                                                                    onClick={() => removeRecipeFromPlan(day, slot, recipe.id, recipeInfo.mealType)}
                                                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded p-1 transition-opacity"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedSlot({ date: day, slot })}
                                                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg h-auto py-3 border-2 border-dashed border-border/50"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Ajouter
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Dialog ajout rapide */}
            {selectedSlot && (
                <QuickAddRecipeDialog
                    date={selectedSlot.date}
                    mealSlot={selectedSlot.slot}
                    onClose={() => setSelectedSlot(null)}
                />
            )}
        </div>
    );
}
