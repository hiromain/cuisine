"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useRecipes } from '@/context/recipe-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Soup, Trash2, Pencil, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getRecipeById, deleteRecipe } = useRecipes();
  const recipe = getRecipeById(params.id as string);

  if (!recipe) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="text-2xl font-serif text-muted-foreground">Oups, cette recette a disparu dans le triangle des Bermudes...</p>
        <Button onClick={() => router.push('/')} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour au bercail
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteRecipe(recipe.id);
    router.push('/');
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
       <Button onClick={() => router.push('/')} variant="ghost" className="mb-6 hover:bg-primary/10 hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux recettes
        </Button>

      <article className="bg-card p-6 sm:p-10 rounded-3xl shadow-xl animate-in fade-in-50 duration-500 overflow-hidden border border-white/20">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-3">
            <Badge className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">{recipe.category}</Badge>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-foreground leading-tight">
              {recipe.title}
            </h1>
            <p className="text-xl text-muted-foreground italic">"{recipe.description}"</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button asChild variant="secondary" size="icon" className="rounded-full h-12 w-12 shadow-sm">
              <Link href={`/recipes/${recipe.id}/edit`}>
                <Pencil className="h-5 w-5" />
                <span className="sr-only">Modifier</span>
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="rounded-full h-12 w-12 shadow-sm">
                  <Trash2 className="h-5 w-5" />
                   <span className="sr-only">Supprimer</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-serif">Tu veux vraiment effacer ce trésor ?</AlertDialogTitle>
                  <AlertDialogDescription className="text-lg">
                    Attention, une fois supprimée, cette recette rejoindra le paradis des cookies oubliés. C'est irréversible !
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="rounded-full px-6">Non, je la garde !</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full px-8 font-bold">
                    Oui, au revoir !
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="relative my-8 h-80 sm:h-[450px] w-full overflow-hidden rounded-3xl shadow-inner group">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            data-ai-hint={recipe.imageHint}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="my-10 grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div className="bg-background/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center border border-border/50">
            <Clock className="h-8 w-8 text-primary mb-3" />
            <p className="font-bold text-lg">Prépa'</p>
            <p className="text-muted-foreground font-medium">{recipe.prepTime} min</p>
          </div>
          <div className="bg-background/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center border border-border/50">
            <Soup className="h-8 w-8 text-primary mb-3" />
            <p className="font-bold text-lg">Cuisson</p>
            <p className="text-muted-foreground font-medium">{recipe.cookTime} min</p>
          </div>
          <div className="bg-background/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center border border-border/50 col-span-2 sm:col-span-1">
            <Users className="h-8 w-8 text-primary mb-3" />
            <p className="font-bold text-lg">Pour</p>
            <p className="text-muted-foreground font-medium">{recipe.servings} gourmands</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-x-12 gap-y-12">
          <div className="md:col-span-1">
            <h2 className="font-serif text-3xl font-bold mb-6 flex items-center">
              <span className="bg-primary/10 text-primary p-2 rounded-lg mr-3">🥫</span>
              Ingrédients
            </h2>
            <ul className="space-y-4">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start group">
                  <span className="text-primary font-bold mr-4 mt-1 transition-transform group-hover:scale-125">✦</span>
                  <span className="text-lg">
                    <strong className="text-foreground">{ingredient.quantity}</strong> 
                    <span className="text-muted-foreground ml-1">{ingredient.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h2 className="font-serif text-3xl font-bold mb-6 flex items-center">
              <span className="bg-primary/10 text-primary p-2 rounded-lg mr-3">👨‍🍳</span>
              La recette pas à pas
            </h2>
            <ol className="space-y-8">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex items-start group">
                  <span className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-black mr-5 flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                    {index + 1}
                  </span>
                  <p className="text-lg leading-relaxed pt-1 text-foreground/90">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-dashed text-center">
           <p className="text-muted-foreground flex items-center justify-center text-lg italic">
             Cuisiné avec <Heart className="h-5 w-5 mx-2 text-primary fill-primary animate-pulse" /> par toi !
           </p>
        </div>
      </article>
    </div>
  );
}
