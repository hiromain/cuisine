
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import type { Recipe } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';

interface RecipeContextType {
  recipes: Recipe[];
  getRecipeById: (id: string) => Recipe | undefined;
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Recipe;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  isLoading: boolean;
  generatedRecipe: Partial<Recipe> | null;
  setGeneratedRecipe: (recipe: Partial<Recipe> | null) => void;
  generatedMenu: Partial<Recipe>[] | null;
  setGeneratedMenu: (menu: Partial<Recipe>[] | null) => void;
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  favoriteRecipes: Recipe[];
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const recipesCollection = useMemoFirebase(() => collection(firestore, 'recipes'), [firestore]);
  const { data: recipesData, isLoading: recipesIsLoading } = useCollection<Recipe>(recipesCollection);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedRecipe, setGeneratedRecipe] = useState<Partial<Recipe> | null>(null);
  const [generatedMenu, setGeneratedMenu] = useState<Partial<Recipe>[] | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Charger les favoris depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('favorite_recipes');
      if (stored) {
        setFavoriteIds(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites', error);
    }
  }, []);

  // Sauvegarder les favoris
  useEffect(() => {
    try {
      localStorage.setItem('favorite_recipes', JSON.stringify(favoriteIds));
    } catch (error) {
      console.error('Failed to save favorites', error);
    }
  }, [favoriteIds]);

  useEffect(() => {
    if (recipesData) {
      setRecipes(recipesData);
    }
  }, [recipesData]);

  useEffect(() => {
    setIsLoading(recipesIsLoading);
  }, [recipesIsLoading]);


  const getRecipeById = (id: string) => {
    return recipes.find((r) => r.id === id);
  };

  const addRecipe = (recipe: Omit<Recipe, 'id'>) => {
    const newRecipeId = `recipe-${Date.now()}-${Math.random()}`;
    const newRecipe: Recipe = {
      ...recipe,
      id: newRecipeId,
      ingredients: recipe.ingredients.map(ing => ({ ...ing, id: `ing-${Date.now()}-${Math.random()}` }))
    };

    if (!recipesCollection) return newRecipe; // Should not happen
    addDocumentNonBlocking(recipesCollection, newRecipe);

    return newRecipe;
  };

  const updateRecipe = (updatedRecipe: Recipe) => {
    const recipeRef = doc(firestore, 'recipes', updatedRecipe.id);
    setDocumentNonBlocking(recipeRef, updatedRecipe, { merge: true });
  };

  const deleteRecipe = (id: string) => {
    const recipeRef = doc(firestore, 'recipes', id);
    deleteDocumentNonBlocking(recipeRef);
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favoriteIds.includes(id);

  const favoriteRecipes = useMemo(() =>
    recipes.filter(r => favoriteIds.includes(r.id)),
    [recipes, favoriteIds]
  );

  const value = useMemo(() => ({
    recipes,
    getRecipeById,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    isLoading,
    generatedRecipe,
    setGeneratedRecipe,
    generatedMenu,
    setGeneratedMenu,
    favoriteIds,
    toggleFavorite,
    isFavorite,
    favoriteRecipes,
  }), [recipes, isLoading, generatedRecipe, generatedMenu, favoriteIds, favoriteRecipes]);

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
