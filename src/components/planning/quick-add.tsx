'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, Star } from 'lucide-react';
import { usePlanning } from '@/context/planning-context';
import { useRecipes } from '@/context/recipe-context';
import type { MealSlot, MealType } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface QuickAddRecipeDialogProps {
    date: Date;
    mealSlot: MealSlot;
    onClose: () => void;
}

export function QuickAddRecipeDialog({ date, mealSlot, onClose }: QuickAddRecipeDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { recipes } = useRecipes();
    const { addRecipeToPlan } = usePlanning();

    const mealTypeMap: Record<MealSlot, MealType> = {
        breakfast: 'petit-dejeuner',
        lunch: 'dejeuner',
        dinner: 'diner',
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddRecipe = (recipeId: string) => {
        const mealType = mealTypeMap[mealSlot];
        addRecipeToPlan(date, mealSlot, recipeId, mealType);
        onClose();
    };

    const mealLabel = {
        breakfast: 'Petit-déjeuner',
        lunch: 'Déjeuner',
        dinner: 'Dîner',
    }[mealSlot];

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">
                        {mealLabel} du {format(date, 'd MMMM', { locale: fr })}
                    </DialogTitle>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une recette..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl h-12 border-none bg-muted/50"
                        autoFocus
                    />
                </div>

                <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="space-y-2 py-2">
                        {filteredRecipes.length > 0 ? (
                            filteredRecipes.map((recipe) => (
                                <button
                                    key={recipe.id}
                                    onClick={() => handleAddRecipe(recipe.id)}
                                    className="w-full text-left p-4 rounded-xl hover:bg-accent/50 transition-colors group border-2 border-transparent hover:border-primary/20"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-1">
                                            <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                                {recipe.title}
                                            </h4>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="secondary" className="text-xs">
                                                    {recipe.category}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{recipe.prepTime + recipe.cookTime} min</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-4xl opacity-50 group-hover:opacity-100 transition-opacity">
                                            🍽️
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="text-lg">Aucune recette trouvée</p>
                                <p className="text-sm mt-2">Essaie une autre recherche ou crée une nouvelle recette</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
                        Annuler
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
