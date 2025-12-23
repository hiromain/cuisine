
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePlanning } from '@/context/planning-context';
import type { PlannedEvent } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, CalendarDays, PartyPopper, Trash2, Pencil, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useRecipes } from '@/context/recipe-context';
import { generatePlanning } from '@/ai/flows/generate-planning-flow';
import { useToast } from '@/hooks/use-toast';

export default function PlanningPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
       <EventsView />
    </div>
  );
}


// ---- Event Components ----

function EventsView() {
    const { plannedEvents, removeEvent, addEvent, addRecipeToPlan, isLoading } = usePlanning();
    const { recipes } = useRecipes();
    const router = useRouter();
    const { toast } = useToast();

    const handleCreateEvent = (newEvent: PlannedEvent) => {
        router.push(`/planning/events/${newEvent.id}`);
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-xl font-serif text-muted-foreground">Chargement de votre planning...</p>
        </div>
      );
    }
    
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-serif tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    Vos Événements
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                  Planifiez vos repas pour des occasions spéciales.
                </p>
            </div>

            <div className="flex justify-center gap-4">
                <AddEventDialog onEventCreated={handleCreateEvent}>
                    <Button size="lg" variant="outline">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Créer un événement manuel
                    </Button>
                </AddEventDialog>
                 <GeneratePlanningDialog recipes={recipes} addEvent={addEvent} addRecipeToPlan={addRecipeToPlan} toast={toast} />
            </div>

            {plannedEvents.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plannedEvents.map(event => (
                        <Card key={event.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="font-serif flex justify-between items-start">
                                    {event.name}
                                    <div className="flex gap-1">
                                        <AddEventDialog existingEvent={event}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </AddEventDialog>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeEvent(event.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardTitle>
                                <CardDescription>
                                    {event.duration} jour{event.duration > 1 ? 's' : ''} à partir du {format(parseISO(event.startDate), 'd MMMM yyyy', { locale: fr })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                <Button asChild className="w-full">
                                    <Link href={`/planning/events/${event.id}`}>Planifier les repas</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <PartyPopper className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Aucun événement planifié</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Créez votre premier événement pour commencer.</p>
                </div>
            )}
        </div>
    )
}

function AddEventDialog({ children, onEventCreated, existingEvent }: { children: React.ReactNode, onEventCreated?: (event: PlannedEvent) => void, existingEvent?: PlannedEvent }) {
  const { addEvent, updateEvent } = usePlanning();
  const [name, setName] = useState(existingEvent?.name ?? "");
  const [startDate, setStartDate] = useState<Date | undefined>(existingEvent ? parseISO(existingEvent.startDate) : new Date());
  const [duration, setDuration] = useState(existingEvent?.duration ?? 1);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (name.trim() && startDate && duration > 0) {
      if (existingEvent) {
          updateEvent({ id: existingEvent.id, name: name.trim(), startDate: format(startDate, 'yyyy-MM-dd'), duration });
      } else {
          const newEvent = addEvent(name.trim(), startDate, duration);
          onEventCreated?.(newEvent);
      }
      setIsOpen(false);
      // Reset form for next time if it was a new event
      if(!existingEvent) {
          setName("");
          setStartDate(new Date());
          setDuration(1);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingEvent ? "Modifier l'événement" : "Créer un événement"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nom</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" placeholder="Ex: Week-end à la mer"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Début</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="col-span-3 font-normal justify-start">
                           <CalendarDays className="mr-2 h-4 w-4"/>
                           {startDate ? format(startDate, 'd MMMM yyyy', { locale: fr}) : "Choisir une date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">Durée (jours)</Label>
                <Input id="duration" type="number" value={duration} onChange={e => setDuration(Math.max(1, parseInt(e.target.value, 10) || 1))} className="col-span-3"/>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={!name.trim() || !startDate || duration <= 0}>{existingEvent ? "Enregistrer" : "Créer et planifier"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function GeneratePlanningDialog({ recipes, addEvent, addRecipeToPlan, toast }: any) {
  const [duration, setDuration] = useState(5);
  const [constraints, setConstraints] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (duration <= 0 || !constraints.trim()) {
      toast({
        variant: 'destructive',
        title: 'Informations manquantes',
        description: 'Veuillez renseigner une durée et des instructions.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await generatePlanning({
        recipes,
        duration,
        constraints,
      });

      if (!result || !result.eventName || result.meals.length === 0) {
        throw new Error("L'IA n'a pas pu générer de planning.");
      }

      const newEvent = addEvent(result.eventName, new Date(), duration);

      result.meals.forEach(meal => {
        const planDate = addDays(new Date(), meal.day - 1);
        addRecipeToPlan(planDate, meal.meal, meal.recipeId, meal.mealType, newEvent.id);
      });

      toast({
        title: 'Planning généré !',
        description: `L'événement "${result.eventName}" a été créé.`,
      });
      setIsOpen(false);
      setConstraints('');
      setDuration(5);
      router.push(`/planning/events/${newEvent.id}`);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur de génération',
        description: error.message || 'Un problème est survenu lors de la génération du planning.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Générer un planning IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Générer un planning avec l'IA</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="duration-ai">Durée (en jours)</Label>
            <Input id="duration-ai" type="number" min="1" max="14" value={duration} onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)} />
          </div>
          <div>
            <Label htmlFor="constraints-ai">Instructions</Label>
            <Textarea
              id="constraints-ai"
              placeholder="Ex: Repas végétariens, rapides pour le soir, avec du poisson le vendredi..."
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Générer le planning'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
