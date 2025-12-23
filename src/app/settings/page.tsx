
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/context/settings-context';
import { useToast } from '@/hooks/use-toast';
import { Settings, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BackgroundManager } from '@/components/settings/background-manager';

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
      title: 'C\'est dans la boîte !',
      description: 'Tes préférences pour l\'IA ont été enregistrées.',
    });
  };
  
  const handleReset = () => {
    resetSystemPrompt();
     toast({
      title: 'Retour à la case départ',
      description: 'Le prompt système a été réinitialisé.',
    });
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold font-serif tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Tes Paramètres
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          Personnalise ton expérience culinaire.
        </p>
      </div>
      
      <BackgroundManager />

      <Card className="mt-8 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-serif">
            <Sparkles className="h-6 w-6 text-primary" />
            Le Cerveau de l'IA
          </CardTitle>
          <CardDescription>
            Ajuste les instructions données à ton assistant culinaire. Tu peux lui dire d'être plus drôle, plus précis, ou de parler comme un chef étoilé !
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="system-prompt" className="font-bold mb-2 block">Prompt Système (Instructions)</Label>
            <Textarea
              id="system-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              className="font-mono text-sm bg-background/50 border-input/50 focus:border-primary rounded-xl"
              placeholder="Ex: Tu es un chef italien passionné..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button variant="ghost" onClick={handleReset} className="text-muted-foreground hover:text-foreground">Réinitialiser par défaut</Button>
            <Button onClick={handleSave} className="font-bold rounded-xl shadow-md">Enregistrer les changements</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
