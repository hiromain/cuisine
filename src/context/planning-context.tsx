
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import type { PlannedMeal, MealSlot, MealType, PlannedEvent } from '@/lib/types';
import { format } from 'date-fns';

const LOCAL_STORAGE_KEY = 'mon_planning_v3';

interface PlanningDataType {
  meals: PlannedMeal[];
  events: PlannedEvent[];
}

interface PlanningContextType {
  plannedMeals: PlannedMeal[];
  plannedEvents: PlannedEvent[];
  addRecipeToPlan: (date: Date, meal: MealSlot, recipeId: string, mealType: MealType, eventId?: string) => void;
  removeRecipeFromPlan: (date: Date, meal: MealSlot, recipeId: string, mealType: MealType, eventId?: string) => void;
  getPlanForDate: (date: Date, eventId?: string) => PlannedMeal[];
  addEvent: (name: string, startDate: Date, duration: number) => PlannedEvent;
  updateEvent: (event: PlannedEvent) => void;
  removeEvent: (eventId: string) => void;
  getEventById: (eventId: string) => PlannedEvent | undefined;
  getMealsForEvent: (eventId: string) => PlannedMeal[];
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

  const addRecipeToPlan = useCallback((date: Date, mealSlot: MealSlot, recipeId: string, mealType: MealType, eventId?: string) => {
    const dateString = format(date, 'yyyy-MM-dd');
    
    setPlanningData(prev => {
        const newMeals = [...prev.meals];
        let mealPlan = newMeals.find(p => p.date === dateString && p.meal === mealSlot && p.eventId === eventId);

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
                eventId,
            });
        }
        return { ...prev, meals: newMeals };
    });
  }, []);

  const removeRecipeFromPlan = useCallback((date: Date, mealSlot: MealSlot, recipeId: string, mealType: MealType, eventId?: string) => {
    const dateString = format(date, 'yyyy-MM-dd');
    setPlanningData(prev => {
        const newMeals = prev.meals.map(plan => {
            if (plan.date === dateString && plan.meal === mealSlot && plan.eventId === eventId) {
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

  const getPlanForDate = useCallback((date: Date, eventId?: string) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return planningData.meals.filter(p => p.date === dateString && p.eventId === eventId);
  }, [planningData.meals]);

  const addEvent = useCallback((name: string, startDate: Date, duration: number) => {
    const newEvent: PlannedEvent = {
      id: `event-${Date.now()}`,
      name,
      startDate: format(startDate, 'yyyy-MM-dd'),
      duration,
    };
    setPlanningData(prev => ({ ...prev, events: [...prev.events, newEvent] }));
    return newEvent;
  }, []);

  const updateEvent = useCallback((updatedEvent: PlannedEvent) => {
    setPlanningData(prev => ({
        ...prev,
        events: prev.events.map(e => e.id === updatedEvent.id ? updatedEvent : e)
    }));
  }, []);

  const removeEvent = useCallback((eventId: string) => {
    setPlanningData(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== eventId),
      meals: prev.meals.filter(m => m.eventId !== eventId) // Also remove meals associated with the event
    }));
  }, []);
  
  const getEventById = useCallback((eventId: string) => {
      return planningData.events.find(e => e.id === eventId);
  }, [planningData.events]);

  const getMealsForEvent = useCallback((eventId: string) => {
      return planningData.meals.filter(m => m.eventId === eventId);
  }, [planningData.meals]);

  const value = useMemo(() => ({
    plannedMeals: planningData.meals,
    plannedEvents: planningData.events,
    addRecipeToPlan,
    removeRecipeFromPlan,
    getPlanForDate,
    addEvent,
    updateEvent,
    removeEvent,
    getEventById,
    getMealsForEvent,
    isLoading
  }), [planningData, addRecipeToPlan, removeRecipeFromPlan, getPlanForDate, addEvent, updateEvent, removeEvent, getEventById, getMealsForEvent, isLoading]);

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
