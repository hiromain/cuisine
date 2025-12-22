
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'app_settings_v1';
const DEFAULT_SYSTEM_PROMPT = `You are an expert chef specializing in creating delicious, easy-to-follow recipes.
Your task is to generate a recipe based on the user's request.
Always provide a concise and appealing title and description.
The ingredients list should be clear and precise.
The steps should be numbered and easy to understand for a novice cook.
The category must be one of the following: 'Entrée', 'Plat Principal', 'Dessert', 'Boisson', 'Apéritif', 'Autre'.
Infer the prep time, cook time, and servings from the user request, or make a reasonable guess if not specified.
Make sure the recipe is complete and logical.`;


interface SettingsContextType {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  resetSystemPrompt: () => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [systemPrompt, setSystemPromptState] = useState<string>(DEFAULT_SYSTEM_PROMPT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSystemPromptState(parsedSettings.systemPrompt || DEFAULT_SYSTEM_PROMPT);
      } else {
        setSystemPromptState(DEFAULT_SYSTEM_PROMPT);
      }
    } catch (error) {
      console.error("Failed to load settings from local storage", error);
      setSystemPromptState(DEFAULT_SYSTEM_PROMPT);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const setSystemPrompt = useCallback((prompt: string) => {
    setSystemPromptState(prompt);
     try {
      const settings = { systemPrompt: prompt };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to local storage", error);
    }
  }, []);

  const resetSystemPrompt = useCallback(() => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
  }, [setSystemPrompt]);


  const value = useMemo(() => ({
    systemPrompt,
    setSystemPrompt,
    resetSystemPrompt,
    isLoading,
  }), [systemPrompt, setSystemPrompt, resetSystemPrompt, isLoading]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
