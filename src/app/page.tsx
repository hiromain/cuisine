
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
import { ShoppingCart, Search, Filter, ChefHat } from 'lucide-react';

export default function HomePage() {
  const { recipes } = useRecipes();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());

  // Advanced filters state
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [maxTotalTime, setMaxTotalTime] = useState<number>(240);
  const [servingsFilter, setServingsFilter] = useState<string>('');
  const [includeIngredients, setIncludeIngredients] = useState('');
  const [excludeIngredients, setExcludeIngredients] = useState('');


  const categories = useMemo(() => ['all', ...Array.from(new Set(recipes.map(r => r.category)))], [recipes]);

  const filteredRecipes = useMemo(() => {
    const included = includeIngredients.split(',').map(i => i.trim().toLowerCase()).filter(Boolean);
    const excluded = excludeIngredients.split(',').map(i => i.trim().toLowerCase()).filter(Boolean);

    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recipe.ingredients.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || recipe.category === categoryFilter;

      if (!isAdvancedSearchOpen) {
        return matchesSearch && matchesCategory;
      }
      
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
    <div className="py-8">
      <section className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-primary/10 text-primary">
          <ChefHat className="h-5 w-5 mr-2" />
          <span className="text-sm font-bold uppercase tracking-wider">Cuisinez avec passion</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl mb-6">
          Votre univers <span className="text-primary">Culinaire</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
          Gérez vos recettes préférées, planifiez vos repas et générez vos listes de courses en un clin d'œil.
        </p>
      </section>

      <div className="sticky top-[4.5rem] z-30 mb-8 p-1">
        <Collapsible open={isAdvancedSearchOpen} onOpenChange={setIsAdvancedSearchOpen} className="bg-card/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher une recette ou un ingrédient..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 w-full !h-14 bg-background/50 border-none rounded-xl text-lg focus-visible:ring-primary"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48 !h-14 bg-background/50 border-none rounded-xl text-base">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat === 'all' ? 'Tout voir' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              <CollapsibleTrigger asChild>
                <Button variant="secondary" className="!h-14 rounded-xl px-6">
                  <Filter className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Filtres</span>
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label className="font-bold">Temps total maximum</Label>
                  <span className="text-primary font-bold">{maxTotalTime} min</span>
                </div>
                <Slider
                  min={10}
                  max={240}
                  step={5}
                  value={[maxTotalTime]}
                  onValueChange={(value) => setMaxTotalTime(value[0])}
                  className="py-2"
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="servings" className="font-bold">Portions (minimum)</Label>
                <Input
                  id="servings"
                  type="number"
                  placeholder="Ex: 4"
                  value={servingsFilter}
                  onChange={e => setServingsFilter(e.target.value)}
                  className="bg-background/50 border-none h-11"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
               <div className="space-y-2">
                <Label className="font-bold">Inclure ces ingrédients</Label>
                <Input
                  type="text"
                  placeholder="Poulet, basilic..."
                  value={includeIngredients}
                  onChange={e => setIncludeIngredients(e.target.value)}
                  className="bg-background/50 border-none h-11"
                />
              </div>
               <div className="space-y-2">
                <Label className="font-bold">Exclure ces ingrédients</Label>
                <Input
                  type="text"
                  placeholder="Coriandre, arachides..."
                  value={excludeIngredients}
                  onChange={e => setExcludeIngredients(e.target.value)}
                  className="bg-background/50 border-none h-11"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      {selectedRecipes.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <Button onClick={generateShoppingList} size="lg" className="h-14 px-8 rounded-full shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 font-bold text-lg hover:scale-105 transition-transform">
            <ShoppingCart className="mr-3 h-6 w-6" />
            Liste de courses ({selectedRecipes.size})
          </Button>
        </div>
      )}

      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-stagger">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="relative group animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-both">
               <RecipeCard recipe={recipe} />
               <div className="absolute top-4 right-4 z-20">
                 <Checkbox
                   id={`select-${recipe.id}`}
                   onCheckedChange={(checked) => handleSelectRecipe(recipe.id, !!checked)}
                   checked={selectedRecipes.has(recipe.id)}
                   className="h-6 w-6 rounded-full border-2 border-white/50 bg-white/20 backdrop-blur-md data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all shadow-lg"
                 />
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card/50 rounded-3xl border border-dashed border-muted-foreground/30">
          <div className="inline-flex items-center justify-center p-6 bg-muted rounded-full mb-6">
             <Search className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Aucun résultat trouvé</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Ajustez vos filtres ou essayez une recherche plus large pour trouver l'inspiration.
          </p>
          <Button variant="link" onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setIsAdvancedSearchOpen(false); }} className="mt-4 text-primary">
            Réinitialiser tous les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
