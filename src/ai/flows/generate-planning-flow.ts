'use server';
/**
 * @fileOverview Flow to generate a meal plan for several days.
 * 
 * - generatePlanning - Generates a meal plan based on user constraints and available recipes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { RecipeSchema } from '@/lib/ai-schema';

// Define input schemas
const GeneratePlanningInputSchema = z.object({
    recipes: z.array(RecipeSchema.pick({ id: true, title: true, category: true, description: true })),
    duration: z.coerce.number().int().positive().describe("The number of days to plan for."),
    constraints: z.string().describe("User's constraints and preferences for the meal plan (e.g., 'vegetarian', 'quick meals', 'fish only')."),
});
export type GeneratePlanningInput = z.infer<typeof GeneratePlanningInputSchema>;

// Schema pour une recette complète générée à la volée (sans ID)
const GeneratedRecipeDetailSchema = RecipeSchema.omit({ id: true }).partial();

const PlannedMealSchema = z.object({
    // Soit on utilise un ID existant
    recipeId: z.string().optional().describe("The ID of the chosen recipe from the provided list. Required if isNew is false."),
    // Soit c'est une nouvelle recette
    isNew: z.boolean().describe("Set to true if this is a newly generated recipe not in the provided list."),
    newRecipeDetails: GeneratedRecipeDetailSchema.optional().describe("Complete details of the new recipe. Required if isNew is true."),
    
    day: z.number().int().min(1).describe("The day number in the plan (e.g., 1 for Day 1)."),
    meal: z.enum(['Midi', 'Soir']).describe("The meal slot, either 'Midi' (Lunch) or 'Soir' (Dinner)."),
    mealType: z.enum(['Entrée', 'Plat Principal', 'Dessert']).describe("The type of meal."),
});

const GeneratePlanningOutputSchema = z.object({
    eventName: z.string().describe("A descriptive name for the generated event, summarizing the plan (e.g., 'Planning végétarien 5 jours')."),
    meals: z.array(PlannedMealSchema).describe("The list of planned meals for the entire duration."),
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
        system: `You are an expert meal planner. Your task is to create a balanced and varied meal plan for a user based on their constraints.

- You will plan for **${duration}** days.
- For each day, you must plan a "Plat Principal" for "Midi" (Lunch) and "Soir" (Dinner).
- You can optionally add an "Entrée" (Starter) or a "Dessert" for some meals to create variety.
- **PRIORITY:** Try to use recipes from the provided "Available Recipes" list first if they match the constraints.
- **FALLBACK:** If no suitable recipe exists in the list for a specific slot (or to add variety), YOU MUST GENERATE A NEW RECIPE.
    - If you generate a new recipe, set 'isNew' to true and fill 'newRecipeDetails' with ALL recipe fields (title, ingredients, steps, etc.).
    - If you use an existing recipe, set 'isNew' to false and provide the 'recipeId'.
- Adhere to the user's constraints: "${constraints}".
- Do not use the same main dish twice in the same day.
- Generate a suitable name for the event.`,
        prompt: `Here is the list of available recipes in JSON format:
${availableRecipesJson}

Please generate the meal plan.`,
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
export async function generatePlanning(input: GeneratePlanningInput): Promise<GeneratePlanningOutput> {
  return await generatePlanningFlow(input);
}
