
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/context/settings-context';
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { systemPrompt, setSystemPrompt, resetSystemPrompt } = useSettings();
  const [prompt, setPrompt] = useState(systemPrompt);
  const { toast } = useToast();

  useEffect(() => {
    setPrompt(systemPrompt);
  }, [systemPrompt]);

  const handleSave = () => {
    setSystemPrompt(prompt);
    toast({
      title: 'Paramètres enregistrés',
      description: 'Le nouveau prompt système a été sauvegardé.',
    });
  };
  
  const handleReset = () => {
    resetSystemPrompt();
     toast({
      title: 'Paramètres réinitialisés',
      description: 'Le prompt système a été restauré par défaut.',
    });
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Paramètres
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Personnalisez le comportement de l'application.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Génération de Recettes par IA
          </CardTitle>
          <CardDescription>
            Ajustez le prompt système utilisé par l'intelligence artificielle pour générer des recettes. Cela vous permet de donner des instructions générales sur le ton, le style ou le format des recettes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="system-prompt" className="font-semibold">Prompt Système</Label>
            <Textarea
              id="system-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              className="mt-2 font-mono text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleReset}>Réinitialiser</Button>
            <Button onClick={handleSave}>Enregistrer les modifications</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
