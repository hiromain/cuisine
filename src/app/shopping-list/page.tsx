
"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useRecipes } from '@/context/recipe-context';
import type { Ingredient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Printer, ShoppingCart, Loader2, Heart } from 'lucide-react';
import Link from 'next/link';

type ShoppingListItem = Ingredient & { checked: boolean };

function ShoppingListContent() {
  const searchParams = useSearchParams();
  const { getRecipeById } = useRecipes();
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const ids = searchParams.get('ids')?.split(',') ?? [];
    if (ids.length > 0) {
      const allIngredients: Ingredient[] = [];
      ids.forEach(id => {
        const recipe = getRecipeById(id);
        if (recipe) {
          allIngredients.push(...recipe.ingredients);
        }
      });

      const aggregated = allIngredients.reduce<Record<string, Ingredient>>((acc, ingredient) => {
        const key = ingredient.name.trim().toLowerCase();
        if (acc[key]) {
          acc[key].quantity = `${acc[key].quantity} + ${ingredient.quantity}`;
        } else {
          acc[key] = { ...ingredient };
        }
        return acc;
      }, {});

      setShoppingList(Object.values(aggregated).map(item => ({ ...item, checked: false })));
    }
  }, [searchParams, getRecipeById, isClient]);

  const handleToggleItem = (ingredientId: string) => {
    setShoppingList(prev => 
      prev.map(item => 
        item.id === ingredientId ? { ...item, checked: !item.checked } : item
      )
    );
  };
  
  const handlePrint = () => {
    window.print();
  };

  if (!isClient) {
    return null; 
  }

  if (shoppingList.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl py-24 px-4 text-center">
        <div className="inline-flex items-center justify-center p-6 bg-muted rounded-full mb-6">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h1 className="font-serif text-3xl font-bold mb-4">Ta liste est aussi vide que mon estomac...</h1>
        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
          Va vite choisir des bonnes choses à manger sur la page d'accueil !
        </p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/">C'est parti pour le shopping !</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4 print:py-4 print:px-0">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
      <div className="printable-area">
        <Card className="shadow-lg animate-in fade-in-50 duration-500 print:shadow-none print:border-none print:bg-transparent rounded-2xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8 pt-10 px-8">
            <div className="flex justify-between items-center no-print">
              <div>
                <CardTitle className="font-serif text-4xl text-primary mb-2">Ma Liste</CardTitle>
                <p className="text-muted-foreground">Oublie rien au supermarché ! 🛒</p>
              </div>
              <Button variant="outline" onClick={handlePrint} className="rounded-full">
                <Printer className="mr-2 h-4 w-4" />
                Imprimer
              </Button>
            </div>
             <div className="hidden print:block text-center mb-4">
                <h1 className="font-serif text-4xl text-black">Ma Liste de Courses 🍲</h1>
             </div>
          </CardHeader>
          <CardContent className="p-8">
            <ul className="space-y-4">
              {shoppingList.map((item) => (
                <li key={item.id} className="flex items-center space-x-4 p-4 rounded-xl transition-all hover:bg-accent/10 border border-transparent hover:border-accent/20 print:p-1 print:text-black">
                  <Checkbox 
                    id={`item-${item.id}`} 
                    checked={item.checked} 
                    onCheckedChange={() => handleToggleItem(item.id)}
                    className="h-6 w-6 no-print rounded-full data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />
                  <div className="h-5 w-5 border border-black rounded-sm hidden print:block"></div>
                  <label 
                    htmlFor={`item-${item.id}`} 
                    className={`flex-1 cursor-pointer transition-all text-lg ${item.checked ? 'line-through text-muted-foreground opacity-50' : 'text-foreground'}`}
                  >
                    <span className="font-bold">{item.name}</span>
                    <span className="text-muted-foreground ml-2">({item.quantity})</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-12 text-center no-print border-t pt-8">
              <p className="text-sm text-muted-foreground flex items-center justify-center">
                Fait avec <Heart className="h-3 w-3 mx-1 text-red-500 fill-red-500" /> pour tes bons petits plats.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ShoppingListPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <ShoppingListContent />
    </Suspense>
  );
}
