
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipes } from '@/context/recipe-context';
import { RecipeCard } from '@/components/recipe-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ShoppingCart, Search, Filter } from 'lucide-react';
import type { Recipe } from '@/lib/types';

export default function HomePage() {
  const { recipes } = useRecipes();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());

  // Advanced filters state
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [maxTotalTime, setMaxTotalTime] = useState<number>(240); // 4 hours
  const [servingsFilter, setServingsFilter] = useState<string>('');
  const [includeIngredients, setIncludeIngredients] = useState('');
  const [excludeIngredients, setExcludeIngredients] = useState('');


  const categories = useMemo(() => ['all', ...Array.from(new Set(recipes.map(r => r.category)))], [recipes]);

  const filteredRecipes = useMemo(() => {
    const included = includeIngredients.split(',').map(i => i.trim().toLowerCase()).filter(Boolean);
    const excluded = excludeIngredients.split(',').map(i => i.trim().toLowerCase()).filter(Boolean);

    return recipes.filter(recipe => {
      // Basic search
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recipe.ingredients.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || recipe.category === categoryFilter;

      if (!isAdvancedSearchOpen) {
        return matchesSearch && matchesCategory;
      }
      
      // Advanced search
      const totalTime = recipe.prepTime + recipe.cookTime;
      const matchesTime = totalTime <= maxTotalTime;

      const matchesServings = !servingsFilter || recipe.servings >= parseInt(servingsFilter, 10);
      
      const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase());
      const matchesInclude = included.length === 0 || included.every(ing => recipeIngredients.some(ri => ri.includes(ing)));
      const matchesExclude = excluded.length === 0 || !excluded.some(ing => recipeIngredients.some(ri => ri.includes(ing)));

      return matchesSearch && matchesCategory && matchesTime && matchesServings && matchesInclude && matchesExclude;
    });
  }, [recipes, searchTerm, categoryFilter, isAdvancedSearchOpen, maxTotalTime, servingsFilter, includeIngredients, excludeIngredients]);

  const handleSelectRecipe = (recipeId: string, isSelected: boolean) => {
    setSelectedRecipes(prev => {
      const newSelection = new Set(prev);
      if (isSelected) {
        newSelection.add(recipeId);
      } else {
        newSelection.delete(recipeId);
      }
      return newSelection;
    });
  };

  const generateShoppingList = () => {
    if (selectedRecipes.size > 0) {
      const ids = Array.from(selectedRecipes).join(',');
      router.push(`/shopping-list?ids=${ids}`);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Découvrez nos recettes
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Explorez, cuisinez, et régalez-vous. Votre aventure culinaire commence ici.
        </p>
      </div>

      <Collapsible open={isAdvancedSearchOpen} onOpenChange={setIsAdvancedSearchOpen} className="mb-8 p-4 bg-card rounded-lg shadow-sm border space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher une recette..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full !h-12 text-base"
            />
          </div>
          <div className="w-full sm:w-64">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full !h-12 text-base">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat} className="text-base">
                      {cat === 'all' ? 'Toutes les catégories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="!h-12">
              <Filter className="mr-2 h-4 w-4" />
              Recherche avancée
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-6 pt-4 animate-in fade-in-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="max-time" className="mb-2 block">Temps total maximum: {maxTotalTime} min</Label>
              <Slider
                id="max-time"
                min={10}
                max={240}
                step={5}
                value={[maxTotalTime]}
                onValueChange={(value) => setMaxTotalTime(value[0])}
              />
            </div>
            <div>
              <Label htmlFor="servings">Portions (minimum)</Label>
              <Input
                id="servings"
                type="number"
                placeholder="Ex: 4"
                value={servingsFilter}
                onChange={e => setServingsFilter(e.target.value)}
                min="1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="include-ingredients">Ingrédients à inclure (séparés par une virgule)</Label>
            <Input
              id="include-ingredients"
              type="text"
              placeholder="Ex: poulet, tomate"
              value={includeIngredients}
              onChange={e => setIncludeIngredients(e.target.value)}
            />
          </div>
           <div>
            <Label htmlFor="exclude-ingredients">Ingrédients à exclure (séparés par une virgule)</Label>
            <Input
              id="exclude-ingredients"
              type="text"
              placeholder="Ex: gluten, noix"
              value={excludeIngredients}
              onChange={e => setExcludeIngredients(e.target.value)}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {selectedRecipes.size > 0 && (
        <div className="mb-8 flex justify-center sticky top-20 z-10">
          <Button onClick={generateShoppingList} size="lg" className="shadow-lg animate-in fade-in zoom-in">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Générer la liste de courses ({selectedRecipes.size})
          </Button>
        </div>
      )}

      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="relative group animate-in fade-in-50 duration-500">
               <RecipeCard recipe={recipe} />
               <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Checkbox
                   id={`select-${recipe.id}`}
                   onCheckedChange={(checked) => handleSelectRecipe(recipe.id, !!checked)}
                   checked={selectedRecipes.has(recipe.id)}
                   aria-label={`Sélectionner ${recipe.title}`}
                 />
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">Aucune recette ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  );
}
