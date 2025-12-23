
"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useRecipes } from '@/context/recipe-context';
import type { Ingredient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Printer, ShoppingCart, Loader2 } from 'lucide-react';
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
      <div className="container mx-auto max-w-2xl py-12 px-4 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 font-serif text-3xl font-bold">Votre liste de courses est vide</h1>
        <p className="mt-2 text-muted-foreground">
          Retournez à l'accueil pour sélectionner des recettes.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Retour à l'accueil</Link>
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
        <Card className="shadow-lg animate-in fade-in-50 duration-500 print:shadow-none print:border-none print:bg-transparent">
          <CardHeader>
            <div className="flex justify-between items-center no-print">
              <CardTitle className="font-serif text-3xl text-primary">Liste de Courses</CardTitle>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimer
              </Button>
            </div>
             <div className="hidden print:block text-center mb-4">
                <h1 className="font-serif text-3xl text-black">Liste de Courses</h1>
             </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {shoppingList.map((item) => (
                <li key={item.id} className="flex items-center space-x-4 p-3 rounded-md transition-colors hover:bg-accent/50 print:p-1 print:text-black">
                  <Checkbox 
                    id={`item-${item.id}`} 
                    checked={item.checked} 
                    onCheckedChange={() => handleToggleItem(item.id)}
                    className="h-6 w-6 no-print"
                  />
                  <div className="h-5 w-5 border border-black rounded-sm hidden print:block"></div>
                  <label 
                    htmlFor={`item-${item.id}`} 
                    className={`flex-1 cursor-pointer transition-all ${item.checked ? 'line-through text-muted-foreground print:text-gray-400' : 'print:text-black'}`}
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-sm"> - {item.quantity}</span>
                  </label>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ShoppingListPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ShoppingListContent />
    </Suspense>
  );
}
