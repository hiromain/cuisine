"use client";

import { useState } from 'react';
import { RecipeForm } from '@/components/recipe-form';
import { RecipeImporter } from '@/components/recipe-importer';
import type { Recipe } from '@/lib/types';

export default function NewRecipePage() {
  const [importedRecipe, setImportedRecipe] = useState<Partial<Recipe> | undefined>();

  const handleRecipeImported = (recipeData: Partial<Recipe>) => {
    // Merge with some defaults to ensure the form is valid
    setImportedRecipe({
      ...{
        title: '',
        description: '',
        category: 'Plat Principal',
        prepTime: 0,
        cookTime: 0,
        servings: 1,
        ingredients: [],
        steps: [],
        imageUrl: 'https://picsum.photos/seed/10/600/400',
        imageHint: 'food plate',
      },
      ...recipeData,
    });
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <RecipeImporter onRecipeImported={handleRecipeImported} />
      <RecipeForm initialData={importedRecipe as Recipe} key={JSON.stringify(importedRecipe)} />
    </div>
  );
}
