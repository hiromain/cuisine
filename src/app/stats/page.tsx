'use client';

import { useMemo } from 'react';
import { useRecipes } from '@/context/recipe-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Book, Tag, UtensilsCrossed, Star } from 'lucide-react';

export default function StatsPage() {
  const { recipes } = useRecipes();

  const statsData = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {};
    recipes.forEach(recipe => {
      categoryCounts[recipe.category] = (categoryCounts[recipe.category] || 0) + 1;
    });
    
    const chartData = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }));

    return {
      totalRecipes: recipes.length,
      totalCategories: Object.keys(categoryCounts).length,
      chartData,
    };
  }, [recipes]);

  const chartConfig = {
    count: {
      label: 'Recettes',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold font-serif tracking-tight text-foreground sm:text-6xl">
          Ton Labo en <span className="text-primary">Chiffres</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
          Un petit coup d'œil sur l'étendue de ton génie culinaire.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
        <Card className="border-none shadow-lg rounded-2xl bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Tes Trésors
            </CardTitle>
            <Book className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground">{statsData.totalRecipes}</div>
            <p className="text-xs text-muted-foreground mt-1">Recettes au total</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg rounded-2xl bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Styles Différents
            </CardTitle>
            <Tag className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground">{statsData.totalCategories}</div>
            <p className="text-xs text-muted-foreground mt-1">Catégories explorées</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg rounded-2xl bg-card">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Ton Score Chef</CardTitle>
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground">Étoilé !</div>
             <p className="text-xs text-muted-foreground mt-1">
              Tu assures derrière les fourneaux.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="font-serif text-2xl">Où en sont tes envies ?</CardTitle>
          <CardDescription>La répartition de tes recettes par catégorie.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart accessibilityLayer data={statsData.chartData}>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                className="font-bold text-xs"
              />
              <YAxis dataKey="count" allowDecimals={false} hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ChartContainer>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground italic">
             <UtensilsCrossed className="h-4 w-4" />
             Continue de remplir ton grimoire pour voir ces barres grimper !
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
