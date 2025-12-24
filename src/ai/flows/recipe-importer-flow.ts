'use server';
/**
 * @fileOverview Flow to import recipes from a URL or a photo.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ConfidenceSchema = z.object({
    value: z.any(),
    confidence: z.number().min(0).max(1),
    justification: z.string()
});

const UrlInputSchema = z.object({
  url: z.string().url(),
});
export type UrlInput = z.infer<typeof UrlInputSchema>;

const PhotoInputSchema = z.object({
  photoDataUri: z.string(),
});
export type PhotoInput = z.infer<typeof PhotoInputSchema>;

const ImportedRecipeOutputSchema = z.object({
    title: ConfidenceSchema.extend({ value: z.string() }).optional(),
    description: ConfidenceSchema.extend({ value: z.string() }).optional(),
    category: ConfidenceSchema.extend({ value: z.enum(['Entrée', 'Plat Principal', 'Dessert', 'Boisson', 'Apéritif', 'Autre']) }).optional(),
    prepTime: ConfidenceSchema.extend({ value: z.number() }).optional(),
    cookTime: ConfidenceSchema.extend({ value: z.number() }).optional(),
    servings: ConfidenceSchema.extend({ value: z.number() }).optional(),
    ingredients: ConfidenceSchema.extend({ value: z.array(z.object({ name: z.string(), quantity: z.string()})) }).optional(),
    steps: ConfidenceSchema.extend({ value: z.array(z.string()) }).optional(),
}).partial();
export type ImportedRecipeOutput = z.infer<typeof ImportedRecipeOutputSchema>;

export const importFromUrlFlow = ai.defineFlow(
  {
    name: 'importFromUrlFlow',
    inputSchema: UrlInputSchema,
    outputSchema: ImportedRecipeOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        system: 'Tu es un expert en extraction de données de recettes. Analyse l\'URL fournie et extrais les informations structurées.',
        prompt: `Extrais la recette de cette URL: ${input.url}`,
        output: { schema: ImportedRecipeOutputSchema }
    });
    return output ?? {};
  }
);

export const importFromPhotoFlow = ai.defineFlow(
  {
    name: 'importFromPhotoFlow',
    inputSchema: PhotoInputSchema,
    outputSchema: ImportedRecipeOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        system: 'Tu es un expert en transcription de recettes à partir d\'images. Analyse l\'image fournie.',
        prompt: [
            { text: 'Extrais les détails de la recette de cette image.' },
            { media: { url: input.photoDataUri } }
        ],
        output: { schema: ImportedRecipeOutputSchema }
    });
    return output ?? {};
  }
);

export async function importRecipeFromUrl(input: UrlInput): Promise<ImportedRecipeOutput> {
  return await importFromUrlFlow(input);
}

export async function importRecipeFromPhoto(input: PhotoInput): Promise<ImportedRecipeOutput> {
  return await importFromPhotoFlow(input);
}
