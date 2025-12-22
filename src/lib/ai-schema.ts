import * as z from 'zod';

export const IngredientSchema = z.object({
  name: z.string().describe("Ingredient name, e.g., 'Farine'"),
  quantity: z.string().describe("Ingredient quantity and unit, e.g., '200g' or '1 tasse'"),
});

export const RecipeSchema = z.object({
  id: z.string(),
  title: z.string().describe('The title of the recipe.'),
  description: z.string().describe('A brief, engaging description of the recipe.'),
  category: z.enum(['Entrée', 'Plat Principal', 'Dessert', 'Boisson', 'Apéritif', 'Autre']).describe('The category of the dish.'),
  prepTime: z.coerce.number().describe('Preparation time in minutes.'),
  cookTime: z.coerce.number().describe('Cooking time in minutes.'),
  servings: z.coerce.number().describe('Number of servings the recipe makes.'),
  ingredients: z.array(IngredientSchema).describe('A list of ingredients.'),
  steps: z.array(z.string()).describe('An ordered list of preparation steps.'),
  imageUrl: z.string().url().describe('A URL for an image of the dish.'),
  imageHint: z.string().describe('A short, 2-word hint for the image search (e.g., "chocolate cake").'),
});
