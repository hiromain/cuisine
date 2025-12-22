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
export const GenerateRecipeInputSchema = z.object({
  userInput: z.string().describe('The user\'s request for the recipe, e.g., "a simple chicken pasta" or "a vegan chocolate cake".'),
  systemPrompt: z.string().describe('The system prompt to guide the AI model.'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;


// Define the output schema by picking fields from the main Recipe schema
// We omit id, imageUrl, and imageHint as they will be generated separately/later.
export const GeneratedRecipeOutputSchema = RecipeSchema.pick({
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
    
    const prompt = ai.definePrompt({
        name: 'generateRecipePrompt',
        input: { schema: GenerateRecipeInputSchema },
        output: { schema: GeneratedRecipeOutputSchema },
        system: input.systemPrompt,
        prompt: `Based on the user's request, generate a new recipe.
        
        User Request: {{{userInput}}}`,
      });

    const { output } = await prompt(input);
    return output ?? {};
  }
);


// Exported function to be called from the client
export async function generateRecipe(input: GenerateRecipeInput) {
  return await generateRecipeFlow(input);
}
