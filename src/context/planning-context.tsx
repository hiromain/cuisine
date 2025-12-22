
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import type { PlannedMeal, MealSlot, MealType, PlannedEvent } from '@/lib/types';
import { format } from 'date-fns';

const LOCAL_STORAGE_KEY = 'mon_planning_v2';

interface PlanningDataType {
  meals: PlannedMeal[];
  events: PlannedEvent[];
}

interface PlanningContextType {
  plannedMeals: PlannedMeal[];
  plannedEvents: PlannedEvent[];
  addRecipeToPlan: (date: Date, meal: MealSlot, recipeId: string, mealType: MealType) => void;
  removeRecipeFromPlan: (date: Date, meal: MealSlot, recipeId: string, mealType: MealType) => void;
  getPlanForDate: (date: Date) => PlannedMeal[];
  addEventToPlan: (date: Date, name: string) => void;
  removeEventFromPlan: (eventId: string) => void;
  getEventsForDate: (date: Date) => PlannedEvent[];
  isLoading: boolean;
}

const PlanningContext = createContext<PlanningContextType | undefined>(undefined);

export const PlanningProvider = ({ children }: { children: ReactNode }) => {
  const [planningData, setPlanningData] = useState<PlanningDataType>({ meals: [], events: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedPlanning = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedPlanning) {
        setPlanningData(JSON.parse(storedPlanning));
      }
    } catch (error) {
      console.error("Failed to load planning from local storage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(planningData));
      } catch (error) {
        console.error("Failed to save planning to local storage", error);
      }
    }
  }, [planningData, isLoading]);

  const addRecipeToPlan = useCallback((date: Date, mealSlot: MealSlot, recipeId: string, mealType: MealType) => {
    const dateString = format(date, 'yyyy-MM-dd');
    
    setPlanningData(prev => {
        const newMeals = [...prev.meals];
        let mealPlan = newMeals.find(p => p.date === dateString && p.meal === mealSlot);

        if (mealPlan) {
            const recipeExists = mealPlan.recipes.some(r => r.recipeId === recipeId && r.mealType === mealType);
            if (!recipeExists) {
                mealPlan.recipes.push({ recipeId, mealType });
            }
        } else {
            newMeals.push({
                date: dateString,
                meal: mealSlot,
                recipes: [{ recipeId, mealType }],
            });
        }
        return { ...prev, meals: newMeals };
    });
  }, []);

  const removeRecipeFromPlan = useCallback((date: Date, mealSlot: MealSlot, recipeId: string, mealType: MealType) => {
    const dateString = format(date, 'yyyy-MM-dd');
    setPlanningData(prev => {
        const newMeals = prev.meals.map(plan => {
            if (plan.date === dateString && plan.meal === mealSlot) {
                return {
                    ...plan,
                    recipes: plan.recipes.filter(r => !(r.recipeId === recipeId && r.mealType === mealType))
                };
            }
            return plan;
        }).filter(plan => plan.recipes.length > 0);
        return { ...prev, meals: newMeals };
    });
  }, []);

  const getPlanForDate = useCallback((date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return planningData.meals.filter(p => p.date === dateString);
  }, [planningData.meals]);

  const addEventToPlan = useCallback((date: Date, name: string) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const newEvent: PlannedEvent = {
      id: `event-${Date.now()}`,
      date: dateString,
      name,
    };
    setPlanningData(prev => ({ ...prev, events: [...prev.events, newEvent] }));
  }, []);

  const removeEventFromPlan = useCallback((eventId: string) => {
    setPlanningData(prev => ({ ...prev, events: prev.events.filter(e => e.id !== eventId)}));
  }, []);

  const getEventsForDate = useCallback((date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return planningData.events.filter(e => e.date === dateString);
  }, [planningData.events]);


  const value = useMemo(() => ({
    plannedMeals: planningData.meals,
    plannedEvents: planningData.events,
    addRecipeToPlan,
    removeRecipeFromPlan,
    getPlanForDate,
    addEventToPlan,
    removeEventFromPlan,
    getEventsForDate,
    isLoading
  }), [planningData, addRecipeToPlan, removeRecipeFromPlan, getPlanForDate, addEventToPlan, removeEventFromPlan, getEventsForDate, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-primary font-headline text-2xl">Chargement du planning...</div>
      </div>
    );
  }

  return (
    <PlanningContext.Provider value={value}>
      {children}
    </PlanningContext.Provider>
  );
};

export const usePlanning = () => {
  const context = useContext(PlanningContext);
  if (context === undefined) {
    throw new Error('usePlanning must be used within a PlanningProvider');
  }
  return context;
};
