
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRecipes } from '@/context/recipe-context';
import { useSettings } from '@/context/settings-context';
import { generateRecipe } from '@/ai/flows/generate-recipe-flow';
import type { Recipe } from '@/lib/types';


export default function GeneratorPage() {
  const router = useRouter();
  const { addRecipe } = useRecipes();
  const { systemPrompt } = useSettings();
  const [request, setRequest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!request.trim()) {
      toast({
        variant: 'destructive',
        title: 'La description est vide',
        description: 'Veuillez décrire la recette que vous souhaitez générer.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateRecipe({ userInput: request, systemPrompt });

      // Create a full recipe object, filling in missing fields
      const newRecipeData: Omit<Recipe, 'id'> = {
        title: result.title || 'Recette sans titre',
        description: result.description || 'Aucune description fournie.',
        category: result.category || 'Plat Principal',
        prepTime: result.prepTime || 0,
        cookTime: result.cookTime || 0,
        servings: result.servings || 2,
        ingredients: result.ingredients || [],
        steps: result.steps || [],
        imageUrl: `https://picsum.photos/seed/${Math.random()}/600/400`,
        imageHint: result.title ? result.title.toLowerCase().split(' ').slice(0,2).join(' ') : 'food plate',
      };
      
      addRecipe(newRecipeData);
      
      toast({
        title: 'Recette générée !',
        description: `La recette "${newRecipeData.title}" a été ajoutée à votre livre.`,
      });

      router.push('/'); // Navigate to home to see the new recipe
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur de génération',
        description: "L'IA n'a pas pu générer de recette. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="animate-in fade-in-50 duration-500">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Générateur de Recettes IA
          </CardTitle>
          <CardDescription>
            Décrivez la recette que vous aimeriez créer. Soyez aussi simple ou détaillé que vous le souhaitez.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ex: Un plat de pâtes rapide avec du poulet et des épinards, style méditerranéen..."
            rows={5}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            disabled={isLoading}
            className="text-base"
          />
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Générer la recette
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
