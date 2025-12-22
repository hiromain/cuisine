
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import type { Recipe } from '@/lib/types';
import { MOCK_RECIPES } from '@/lib/data';

const LOCAL_STORAGE_KEY = 'mes_recettes';

interface RecipeContextType {
  recipes: Recipe[];
  getRecipeById: (id: string) => Recipe | undefined;
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  isLoading: boolean;
  generatedRecipe: Partial<Recipe> | null;
  setGeneratedRecipe: (recipe: Partial<Recipe> | null) => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedRecipe, setGeneratedRecipe] = useState<Partial<Recipe> | null>(null);

  useEffect(() => {
    try {
      const storedRecipes = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedRecipes) {
        setRecipes(JSON.parse(storedRecipes));
      } else {
        setRecipes(MOCK_RECIPES);
      }
    } catch (error) {
      console.error("Failed to load recipes from local storage", error);
      setRecipes(MOCK_RECIPES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recipes));
      } catch (error) {
        console.error("Failed to save recipes to local storage", error);
      }
    }
  }, [recipes, isLoading]);

  const getRecipeById = (id: string) => {
    return recipes.find((r) => r.id === id);
  };

  const addRecipe = (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: `recipe-${Date.now()}-${Math.random()}`,
      ingredients: recipe.ingredients.map(ing => ({...ing, id: `ing-${Date.now()}-${Math.random()}`}))
    };
    setRecipes((prev) => [newRecipe, ...prev]);
  };

  const updateRecipe = (updatedRecipe: Recipe) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r))
    );
  };

  const deleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const value = useMemo(() => ({
    recipes,
    getRecipeById,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    isLoading,
    generatedRecipe,
    setGeneratedRecipe,
  }), [recipes, isLoading, generatedRecipe]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-primary font-headline text-2xl">Chargement...</div>
      </div>
    );
  }

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};
