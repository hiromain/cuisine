
'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePlanning } from '@/context/planning-context';
import { useRecipes } from '@/context/recipe-context';
import { eachDayOfInterval, addDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MEAL_TYPES, type MealSlot, type PlannedMeal, MealType } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { X, PlusCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Label } from '@/components/ui/label';

export default function EventPlanningPage() {
  const params = useParams();
  const router = useRouter();
  const { getEventById, getPlanForDate, getMealsForEvent } = usePlanning();
  const eventId = params.id as string;
  const event = getEventById(eventId);

  const handleGenerateShoppingList = () => {
    const eventMeals = getMealsForEvent(eventId);
    const recipeIds = new Set<string>();
    eventMeals.forEach(meal => {
        meal.recipes.forEach(recipe => {
            recipeIds.add(recipe.recipeId);
        });
    });

    if (recipeIds.size > 0) {
      const ids = Array.from(recipeIds).join(',');
      router.push(`/shopping-list?ids=${ids}`);
    }
  };


  if (!event) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Événement non trouvé.</p>
        <Button onClick={() => router.push('/planning')} className="mt-4">
          Retour au planning
        </Button>
      </div>
    );
  }

  const startDate = parseISO(event.startDate);
  const eventDays = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, event.duration - 1),
  });
  
  const hasPlannedMeals = getMealsForEvent(eventId).length > 0;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-4">
         <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
                 <Button variant="ghost" onClick={() => router.push('/planning')} className="mb-2 -ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Retour aux événements
                </Button>
                <h1 className="text-4xl font-bold font-headline text-primary">
                {event.name}
                </h1>
                <p className="text-muted-foreground">
                Planification du {format(startDate, 'd MMMM', { locale: fr })} au{' '}
                {format(addDays(startDate, event.duration - 1), 'd MMMM yyyy', {
                    locale: fr,
                })}
                </p>
            </div>
             {hasPlannedMeals && (
                 <Button onClick={handleGenerateShoppingList} size="lg" className="shadow-lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Générer la liste de courses
                </Button>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventDays.map((day) => {
            const plans = getPlanForDate(day, eventId);
            const midiPlan = plans.find(p => p.meal === 'Midi');
            const soirPlan = plans.find(p => p.meal === 'Soir');
          return (
            <Card key={day.toString()} className="flex flex-col">
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-xl capitalize">
                  {format(day, 'eeee d', { locale: fr })}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <MealSection date={day} meal="Midi" plan={midiPlan} eventId={eventId} />
                <MealSection date={day} meal="Soir" plan={soirPlan} eventId={eventId} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MealSection({ date, meal, plan, eventId }: { date: Date; meal: MealSlot; plan?: PlannedMeal, eventId: string }) {
  const { getRecipeById } = useRecipes();
  const { removeRecipeFromPlan } = usePlanning();

  const sortedRecipes = plan?.recipes.sort((a, b) => MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType));

  return (
    <div className="bg-background/50 p-4 rounded-lg flex-1">
      <h3 className="font-semibold text-lg mb-3">{meal}</h3>
      <div className="space-y-2">
        {sortedRecipes && sortedRecipes.length > 0 ? (
          sortedRecipes.map(({ recipeId, mealType }) => {
            const recipe = getRecipeById(recipeId);
            if (!recipe) return null;
            return (
              <div key={`${recipeId}-${mealType}`} className="group flex justify-between items-center text-sm p-2 rounded-md bg-card">
                <Link href={`/recipes/${recipeId}`} className="flex-1 truncate">
                  <span className="font-medium">{recipe.title}</span>
                  <span className="text-muted-foreground ml-2">({mealType})</span>
                </Link>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeRecipeFromPlan(date, meal, recipeId, mealType, eventId)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">Aucun plat planifié.</p>
        )}
      </div>
      <AddRecipeDialog date={date} meal={meal} eventId={eventId}>
        <Button variant="ghost" className="w-full mt-2">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </AddRecipeDialog>
    </div>
  );
}

function AddRecipeDialog({ date, meal, eventId, children }: { date: Date; meal: MealSlot; eventId: string; children: React.ReactNode; }) {
    const { recipes } = useRecipes();
    const { addRecipeToPlan } = usePlanning();
    const [selectedRecipe, setSelectedRecipe] = useState<string | undefined>();
    const [selectedMealType, setSelectedMealType] = useState<MealType | undefined>();
    const [isOpen, setIsOpen] = useState(false);

    const handleAdd = () => {
        if (selectedRecipe && selectedMealType) {
            addRecipeToPlan(date, meal, selectedRecipe, selectedMealType, eventId);
            setSelectedRecipe(undefined);
            setSelectedMealType(undefined);
            setIsOpen(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajouter une recette pour le {meal.toLowerCase()} du {format(date, 'd MMMM', { locale: fr })}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label>Recette</Label>
                        <Select onValueChange={setSelectedRecipe} value={selectedRecipe}>
                            <SelectTrigger><SelectValue placeholder="Choisir une recette" /></SelectTrigger>
                            <SelectContent>
                                {recipes.map(recipe => (
                                    <SelectItem key={recipe.id} value={recipe.id}>{recipe.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Type de plat</Label>
                        <Select onValueChange={(v) => setSelectedMealType(v as MealType)} value={selectedMealType}>
                             <SelectTrigger><SelectValue placeholder="Choisir le type de plat" /></SelectTrigger>
                            <SelectContent>
                                {MEAL_TYPES.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handleAdd} disabled={!selectedRecipe || !selectedMealType}>Ajouter au planning</Button>
            </DialogContent>
        </Dialog>
    );
}

    