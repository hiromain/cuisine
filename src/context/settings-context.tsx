
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

export const DEFAULT_BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop";

interface SettingsContextType {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  resetSystemPrompt: () => void;
  backgroundImage: string;
  setBackgroundImage: (url: string) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [systemPrompt, setSystemPromptState] = useState<string>(DEFAULT_SYSTEM_PROMPT);
  const [backgroundImage, setBackgroundImageState] = useState<string>(DEFAULT_BACKGROUND_IMAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSystemPromptState(parsedSettings.systemPrompt || DEFAULT_SYSTEM_PROMPT);
        setBackgroundImageState(parsedSettings.backgroundImage || DEFAULT_BACKGROUND_IMAGE);
      } else {
        setSystemPromptState(DEFAULT_SYSTEM_PROMPT);
        setBackgroundImageState(DEFAULT_BACKGROUND_IMAGE);
      }
    } catch (error) {
      console.error("Failed to load settings from local storage", error);
      setSystemPromptState(DEFAULT_SYSTEM_PROMPT);
      setBackgroundImageState(DEFAULT_BACKGROUND_IMAGE);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const saveSettings = (newPrompt: string, newImage: string) => {
     try {
      const settings = { systemPrompt: newPrompt, backgroundImage: newImage };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to local storage", error);
    }
  };

  const setSystemPrompt = useCallback((prompt: string) => {
    setSystemPromptState(prompt);
    saveSettings(prompt, backgroundImage);
  }, [backgroundImage]);

  const setBackgroundImage = useCallback((url: string) => {
    setBackgroundImageState(url);
    saveSettings(systemPrompt, url);
  }, [systemPrompt]);

  const resetSystemPrompt = useCallback(() => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
  }, [setSystemPrompt]);


  const value = useMemo(() => ({
    systemPrompt,
    setSystemPrompt,
    resetSystemPrompt,
    backgroundImage,
    setBackgroundImage,
    isLoading,
  }), [systemPrompt, setSystemPrompt, resetSystemPrompt, backgroundImage, setBackgroundImage, isLoading]);

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
