"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useRecipes } from '@/context/recipe-context';
import type { Recipe } from '@/lib/types';
import { useEffect } from 'react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ingredientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  quantity: z.string().min(1, "La quantité est requise."),
});

const recipeSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères."),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères."),
  category: z.enum(['Entrée', 'Plat Principal', 'Dessert', 'Boisson', 'Apéritif', 'Autre']),
  prepTime: z.coerce.number().min(0, "Le temps doit être un nombre positif."),
  cookTime: z.coerce.number().min(0, "Le temps doit être un nombre positif."),
  servings: z.coerce.number().min(1, "Les portions doivent être d'au moins 1."),
  ingredients: z.array(ingredientSchema).min(1, "Ajoutez au moins un ingrédient."),
  steps: z.array(z.string().min(5, "L'étape doit contenir au moins 5 caractères.")).min(1, "Ajoutez au moins une étape."),
  imageUrl: z.string().url("Veuillez entrer une URL d'image valide."),
  imageHint: z.string().min(2, "Veuillez entrer un indice pour l'image."),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  initialData?: Recipe | Partial<Recipe>;
}

export function RecipeForm({ initialData }: RecipeFormProps) {
  const router = useRouter();
  const { addRecipe, updateRecipe } = useRecipes();
  const { toast } = useToast();

  const isEditMode = !!initialData?.id;

  const defaultValues = initialData && Object.keys(initialData).length > 0
    ? {
      ...initialData,
      title: initialData.title || '',
      description: initialData.description || '',
      category: initialData.category || 'Plat Principal',
      prepTime: initialData.prepTime || 0,
      cookTime: initialData.cookTime || 0,
      servings: initialData.servings || 1,
      ingredients: initialData.ingredients && initialData.ingredients.length > 0 ? initialData.ingredients.map(i => ({...i, id: i.id || `new-${Math.random()}`})) : [{ id: 'new-0', name: '', quantity: '' }],
      steps: initialData.steps && initialData.steps.length > 0 ? initialData.steps : [''],
      imageUrl: initialData.imageUrl || 'https://picsum.photos/seed/9/600/400',
      imageHint: initialData.imageHint || 'food plate',
    }
    : {
      title: '',
      description: '',
      category: 'Plat Principal' as const,
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      ingredients: [{ id: 'new-0', name: '', quantity: '' }],
      steps: [''],
      imageUrl: 'https://picsum.photos/seed/9/600/400',
      imageHint: 'food plate',
    };
  
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues,
    mode: "onChange",
  });
  
  useEffect(() => {
    if (initialData) {
      form.reset(defaultValues);
    }
  }, [initialData, form]);


  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control: form.control,
    name: "ingredients"
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control: form.control,
    name: "steps"
  });
  
  function onSubmit(data: RecipeFormValues) {
    if (isEditMode && initialData.id) {
      updateRecipe({ ...data, id: initialData.id });
      toast({ title: "Recette modifiée!", description: "La recette a été mise à jour avec succès." });
      router.push(`/recipes/${initialData.id}`);
    } else {
      addRecipe(data);
      toast({ title: "Recette ajoutée!", description: "Votre nouvelle recette est prête." });
      router.push('/');
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in-50 duration-500">
          <Card>
            <CardHeader><CardTitle className="text-2xl font-headline">{isEditMode ? 'Modifier la recette' : 'Ajouter une nouvelle recette'}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Titre</FormLabel><FormControl><Input placeholder="Ex: Gâteau au chocolat" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Une brève description de la recette..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Choisissez une catégorie" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {['Apéritif', 'Entrée', 'Plat Principal', 'Dessert', 'Boisson', 'Autre'].map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField control={form.control} name="prepTime" render={({ field }) => (
                  <FormItem><FormLabel>Temps de préparation (min)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="cookTime" render={({ field }) => (
                  <FormItem><FormLabel>Temps de cuisson (min)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="servings" render={({ field }) => (
                  <FormItem><FormLabel>Portions</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
               <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem><FormLabel>URL de l'image</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="imageHint" render={({ field }) => (
                  <FormItem><FormLabel>Indice de l'image</FormLabel><FormControl><Input placeholder="Ex: chocolate cake" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ingrédients</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <FormField control={form.control} name={`ingredients.${index}.quantity`} render={({ field }) => (
                    <FormItem className="flex-1"><FormLabel className={index !== 0 ? 'sr-only' : ''}>Quantité</FormLabel><FormControl><Input placeholder="Ex: 200g" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`ingredients.${index}.name`} render={({ field }) => (
                    <FormItem className="flex-[2]"><FormLabel className={index !== 0 ? 'sr-only' : ''}>Nom</FormLabel><FormControl><Input placeholder="Ex: Farine" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeIngredient(index)} disabled={ingredientFields.length <= 1}>
                    <Trash2 className="h-4 w-4" /><span className="sr-only">Supprimer l'ingrédient</span>
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendIngredient({ id: `new-${Date.now()}`, name: '', quantity: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un ingrédient
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Étapes de préparation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {stepFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <span className="pt-2 text-lg font-bold text-primary">{index + 1}.</span>
                  <FormField control={form.control} name={`steps.${index}`} render={({ field }) => (
                    <FormItem className="flex-1"><FormLabel className="sr-only">Étape {index + 1}</FormLabel><FormControl><Textarea placeholder="Décrivez l'étape..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeStep(index)} disabled={stepFields.length <= 1}>
                    <Trash2 className="h-4 w-4" /><span className="sr-only">Supprimer l'étape</span>
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendStep('')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une étape
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
             <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
             <Button type="submit" disabled={form.formState.isSubmitting}>
               {isEditMode ? 'Mettre à jour la recette' : 'Enregistrer la recette'}
             </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
