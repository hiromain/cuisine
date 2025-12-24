'use server';
/**
 * @fileOverview Flow to generate a meal plan for several days.
 * 
 * - generatePlanning - Generates a meal plan based on user constraints and available recipes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { RecipeSchema, IngredientSchema } from '@/lib/ai-schema';

// Define input schemas
const GeneratePlanningInputSchema = z.object({
    recipes: z.array(RecipeSchema.pick({ id: true, title: true, category: true, description: true })),
    duration: z.coerce.number().int().positive().describe("The number of days to plan for."),
    constraints: z.string().describe("User's constraints and preferences for the meal plan (e.g., 'vegetarian', 'quick meals', 'fish only')."),
});
export type GeneratePlanningInput = z.infer<typeof GeneratePlanningInputSchema>;

// Schema pour une recette complète générée à la volée (sans ID)
// On ne met PAS .partial() ici pour forcer l'IA à remplir tous les champs
const GeneratedRecipeDetailSchema = z.object({
  title: z.string().describe('Clean title, no disclaimers.'),
  description: z.string().describe('Short description.'),
  category: z.enum(['Entrée', 'Plat Principal', 'Dessert', 'Boisson', 'Apéritif', 'Autre']),
  prepTime: z.number(),
  cookTime: z.number(),
  servings: z.number(),
  ingredients: z.array(z.object({ name: z.string(), quantity: z.string() })),
  steps: z.array(z.string()),
});

const PlannedMealSchema = z.object({
    recipeId: z.string().optional().describe("The ID of the chosen recipe from the provided list. Required if isNew is false."),
    isNew: z.boolean().describe("Set to true if this is a newly generated recipe NOT in the provided list."),
    newRecipeDetails: GeneratedRecipeDetailSchema.optional().describe("Complete details of the new recipe. Required ONLY if isNew is true."),
    
    day: z.number().int().min(1).describe("The day number in the plan (e.g., 1 for Day 1)."),
    meal: z.enum(['Midi', 'Soir']).describe("The meal slot, either 'Midi' (Lunch) or 'Soir' (Dinner)."),
    mealType: z.enum(['Entrée', 'Plat Principal', 'Dessert']).describe("The type of meal."),
});

const GeneratePlanningOutputSchema = z.object({
    eventName: z.string().describe("A descriptive name for the generated event."),
    meals: z.array(PlannedMealSchema).describe("The list of planned meals."),
});
export type GeneratePlanningOutput = z.infer<typeof GeneratePlanningOutputSchema>;

// Create the flow
const generatePlanningFlow = ai.defineFlow(
  {
    name: 'generatePlanningFlow',
    inputSchema: GeneratePlanningInputSchema,
    outputSchema: GeneratePlanningOutputSchema,
  },
  async ({ recipes, duration, constraints }) => {
    const availableRecipesJson = JSON.stringify(recipes.map(r => ({ id: r.id, title: r.title, description: r.description, category: r.category })));
    
    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        system: `You are an expert meal planner. Your task is to create a balanced meal plan.
        
        CRITICAL RULES:
        1. Only use recipes from the list IF they match the constraints: "${constraints}".
        2. If you need a recipe that isn't in the list, set 'isNew: true' and provide FULL 'newRecipeDetails'.
        3. DO NOT include meta-talk, instructions, or disclaimers like "[NEW RECIPE]" or "Generated because..." in the title or description.
        4. The title must be ONLY the name of the dish.
        5. 'newRecipeDetails' MUST contain non-empty ingredients and steps if 'isNew' is true.
        
        Duration: ${duration} days.
        Constraints: ${constraints}`,
        prompt: `Available Recipes: ${availableRecipesJson}
        
        Generate the meal plan now.`,
        output: { schema: GeneratePlanningOutputSchema },
      });

      if (!output) {
        throw new Error('L\'IA a retourné un résultat de planning vide.');
      }

      return output;
    } catch (error) {
      console.error('Erreur planning Genkit:', error);
      throw error;
    }
  }
);


// Exported function to be called from the client
export async function generatePlanning(input: GeneratePlanningInput): Promise<GeneratedMealOutput> {
  return await generatePlanningFlow(input);
}
