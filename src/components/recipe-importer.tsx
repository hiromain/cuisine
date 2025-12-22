"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Link as LinkIcon } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { importRecipeFromUrl, importRecipeFromPhoto } from '@/ai/flows/recipe-importer-flow';

interface RecipeImporterProps {
  onRecipeImported: (recipe: Partial<Recipe>) => void;
}

export function RecipeImporter({ onRecipeImported }: RecipeImporterProps) {
  const [url, setUrl] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUrlImport = async () => {
    if (!url) {
      toast({ variant: 'destructive', title: 'URL manquante', description: 'Veuillez entrer une URL.' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await importRecipeFromUrl({ url });
      onRecipeImported(result);
      toast({ title: 'Recette importée !', description: 'Vérifiez les informations ci-dessous.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur d\'importation', description: 'Impossible d\'extraire la recette depuis cette URL.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoImport = async () => {
    if (!photo || !photoPreview) {
      toast({ variant: 'destructive', title: 'Photo manquante', description: 'Veuillez sélectionner une photo.' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await importRecipeFromPhoto({ photoDataUri: photoPreview });
      onRecipeImported(result);
      toast({ title: 'Recette extraite !', description: 'Vérifiez les informations ci-dessous.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur d\'extraction', description: 'Impossible d\'extraire la recette depuis cette photo.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Importer une recette</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="url">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url"><LinkIcon className="mr-2"/> Depuis une URL</TabsTrigger>
            <TabsTrigger value="photo"><Upload className="mr-2"/> Depuis une photo</TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="pt-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://www.marmiton.org/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
              <Button onClick={handleUrlImport} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Importer'}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="photo" className="pt-4 space-y-4">
            <Input type="file" accept="image/*" onChange={handlePhotoChange} disabled={isLoading} />
            {photoPreview && (
              <div className="mt-4">
                <img src={photoPreview} alt="Aperçu de la recette" className="rounded-md max-h-64 mx-auto" />
              </div>
            )}
            <Button onClick={handlePhotoImport} disabled={isLoading || !photo} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Extraire depuis la photo'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
