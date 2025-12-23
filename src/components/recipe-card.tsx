import Link from 'next/link';
import Image from 'next/image';
import type { Recipe } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Utensils } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block h-full group">
      <Card className="h-full overflow-hidden transition-all duration-300 border-none shadow-md hover:shadow-2xl bg-card rounded-2xl">
        <CardHeader className="p-0 relative">
          <div className="relative h-56 w-full overflow-hidden">
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              data-ai-hint={recipe.imageHint}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="absolute top-3 left-3 flex gap-2">
             <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm border-none shadow-sm font-semibold">
              {recipe.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex-1">
            <CardTitle className="font-serif text-2xl leading-snug mb-3 text-foreground group-hover:text-primary transition-colors">
              {recipe.title}
            </CardTitle>
          </div>
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground pt-4 border-t border-border/50">
            <div className="flex items-center">
              <Clock className="mr-1.5 h-4 w-4 text-primary" />
              <span>{recipe.prepTime + recipe.cookTime} min</span>
            </div>
            <div className="flex items-center">
              <Utensils className="mr-1.5 h-4 w-4 text-accent" />
              <span>{recipe.ingredients.length} ingr.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
