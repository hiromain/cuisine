
"use client";

import { useState, useEffect } from 'react';
import { useRecipes } from '@/context/recipe-context';
import { RecipeForm } from '@/components/recipe-form';
import { RecipeImporter } from '@/components/recipe-importer';
import type { Recipe } from '@/lib/types';

export default function NewRecipePage() {
  const { generatedRecipe, setGeneratedRecipe } = useRecipes();
  const [initialRecipeData, setInitialRecipeData] = useState<Partial<Recipe> | undefined>();

  useEffect(() => {
    if (generatedRecipe) {
      setInitialRecipeData(generatedRecipe);
      // Clear the generated recipe from context so it's not reused on next visit
      setGeneratedRecipe(null);
    }
  }, [generatedRecipe, setGeneratedRecipe]);

  const handleRecipeImported = (recipeData: Partial<Recipe>) => {
    setInitialRecipeData(recipeData);
  };

  const formKey = useMemo(() => JSON.stringify(initialRecipeData), [initialRecipeData]);

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      {!initialRecipeData && (
        <RecipeImporter onRecipeImported={handleRecipeImported} />
      )}
      <RecipeForm initialData={initialRecipeData as Recipe} key={formKey} />
    </div>
  );
}
