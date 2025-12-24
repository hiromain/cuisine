'use server';
/**
 * @fileOverview Flow to generate a new recipe using AI.
 *
 * - generateRecipe - Generates a recipe based on user input and a configurable system prompt.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {RecipeSchema} from '@/lib/ai-schema';

// Define input schemas
const GenerateRecipeInputSchema = z.object({
  userInput: z.string().describe('The user\'s request for the recipe, e.g., "a simple chicken pasta" or "a vegan chocolate cake".'),
  systemPrompt: z.string().optional().describe('The system prompt to guide the AI model.'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;


// Define the output schema by picking fields from the main Recipe schema
const GeneratedRecipeOutputSchema = RecipeSchema.pick({
  title: true,
  description: true,
  category: true,
  prepTime: true,
  cookTime: true,
  servings: true,
  ingredients: true,
  steps: true,
}).partial();
export type GeneratedRecipeOutput = z.infer<typeof GeneratedRecipeOutputSchema>;


// Create the flow
const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GeneratedRecipeOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        system: input.systemPrompt || 'Tu es un chef cuisinier créatif. Ta mission est de générer des recettes délicieuses et faciles à suivre.',
        prompt: `Basé sur la demande de l'utilisateur, génère une nouvelle recette : "${input.userInput}"`,
        output: { schema: GeneratedRecipeOutputSchema },
      });

      return output ?? {};
    } catch (error) {
      console.error('Erreur génération recette:', error);
      throw error;
    }
  }
);


// Exported function to be called from the client
export async function generateRecipe(input: GenerateRecipeInput): Promise<GeneratedRecipeOutput> {
  return await generateRecipeFlow(input);
}
