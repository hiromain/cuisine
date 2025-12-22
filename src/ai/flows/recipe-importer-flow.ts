'use server';
/**
 * @fileOverview Flow to import recipes from a URL or a photo.
 *
 * - importRecipeFromUrl - Imports a recipe from a given URL.
 * - importRecipeFromPhoto - Imports a recipe from a photo.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { RecipeSchema } from '@/lib/ai-schema';

// Define input schemas
const UrlInputSchema = z.object({
  url: z.string().url().describe('The URL of the recipe page.'),
});
export type UrlInput = z.infer<typeof UrlInputSchema>;


const PhotoInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a recipe, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type PhotoInput = z.infer<typeof PhotoInputSchema>;

// Define the output schema by picking fields from the main Recipe schema
const ImportedRecipeOutputSchema = RecipeSchema.pick({
    title: true,
    description: true,
    category: true,
    prepTime: true,
    cookTime: true,
    servings: true,
    ingredients: true,
    steps: true,
}).partial(); // Make all fields optional as the AI may not find all of them
export type ImportedRecipeOutput = z.infer<typeof ImportedRecipeOutputSchema>;

// Create prompts
const urlPrompt = ai.definePrompt({
  name: 'importRecipeFromUrlPrompt',
  input: { schema: UrlInputSchema },
  output: { schema: ImportedRecipeOutputSchema },
  prompt: `You are an expert recipe scraper. Scrape the recipe from the provided URL.
URL: {{{url}}}`,
});

const photoPrompt = ai.definePrompt({
  name: 'importRecipeFromPhotoPrompt',
  input: { schema: PhotoInputSchema },
  output: { schema: ImportedRecipeOutputSchema },
  prompt: `You are an expert recipe transcriber. Extract the recipe details from the provided image.
Photo: {{media url=photoDataUri}}`,
});

// Create flows
const importFromUrlFlow = ai.defineFlow(
  {
    name: 'importFromUrlFlow',
    inputSchema: UrlInputSchema,
    outputSchema: ImportedRecipeOutputSchema,
  },
  async (input) => {
    const { output } = await urlPrompt(input);
    return output ?? {};
  }
);

const importFromPhotoFlow = ai.defineFlow(
  {
    name: 'importFromPhotoFlow',
    inputSchema: PhotoInputSchema,
    outputSchema: ImportedRecipeOutputSchema,
  },
  async (input) => {
    const { output } = await photoPrompt(input);
    return output ?? {};
  }
);

// Exported functions to be called from the client
export async function importRecipeFromUrl(input: UrlInput): Promise<ImportedRecipeOutput> {
  return await importFromUrlFlow(input);
}

export async function importRecipeFromPhoto(input: PhotoInput): Promise<ImportedRecipeOutput> {
  return await importFromPhotoFlow(input);
}
