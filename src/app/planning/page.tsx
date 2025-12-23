
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePlanning } from '@/context/planning-context';
import type { PlannedEvent } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, CalendarDays, PartyPopper, Trash2, Pencil, Sparkles, Loader2, Utensils } from 'lucide-react';
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
    <div className="container mx-auto py-8">
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
          <p className="text-xl font-serif text-muted-foreground italic">Je prépare ton calendrier aux petits oignons...</p>
        </div>
      );
    }
    
    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-serif tracking-tight text-foreground sm:text-6xl">
                    Tes <span className="text-primary">Festins</span> Planifiés
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
                  Prépare tes repas pour les jours à venir ou pour tes grandes occasions.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
                <AddEventDialog onEventCreated={handleCreateEvent}>
                    <Button size="lg" variant="outline" className="rounded-full px-8 border-primary/20 hover:bg-primary/5 transition-all">
                        <PlusCircle className="mr-2 h-5 w-5 text-primary" />
                        Nouvel événement
                    </Button>
                </AddEventDialog>
                 <GeneratePlanningDialog recipes={recipes} addEvent={addEvent} addRecipeToPlan={addRecipeToPlan} toast={toast} />
            </div>

            {plannedEvents.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plannedEvents.map(event => (
                        <Card key={event.id} className="flex flex-col border-none shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow group">
                            <CardHeader className="bg-primary/5 pb-6">
                                <CardTitle className="font-serif text-2xl flex justify-between items-start text-foreground group-hover:text-primary transition-colors">
                                    {event.name}
                                    <div className="flex gap-1">
                                        <AddEventDialog existingEvent={event}>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </AddEventDialog>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white text-destructive hover:text-destructive" onClick={() => removeEvent(event.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardTitle>
                                <CardDescription className="font-medium">
                                    {event.duration} jour{event.duration > 1 ? 's' : ''} • Dès le {format(parseISO(event.startDate), 'd MMMM yyyy', { locale: fr })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end p-6 pt-0 mt-6">
                                <Button asChild className="w-full rounded-xl h-12 font-bold shadow-md">
                                    <Link href={`/planning/events/${event.id}`}>
                                        <Utensils className="mr-2 h-4 w-4" />
                                        C'est parti !
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-muted-foreground/30">
                    <PartyPopper className="mx-auto h-16 w-16 text-muted-foreground/40 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Rien de prévu pour l'instant</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">Lance-toi et crée ton premier événement pour ne plus jamais manquer d'inspiration !</p>
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
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{existingEvent ? "On change les plans ?" : "Nouvelle aventure culinaire"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-6">
            <div className="space-y-2">
                <Label htmlFor="name" className="font-bold">Nom de l'événement</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} className="rounded-xl bg-background/50 border-none h-11" placeholder="Ex: Grand banquet de Noël"/>
            </div>
            <div className="space-y-2 flex flex-col">
                <Label className="font-bold mb-1">On commence quand ?</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="font-normal justify-start rounded-xl h-11 bg-background/50 border-none">
                           <CalendarDays className="mr-2 h-4 w-4 text-primary"/>
                           {startDate ? format(startDate, 'd MMMM yyyy', { locale: fr}) : "Choisir une date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="duration" className="font-bold">Ça va durer combien de jours ?</Label>
                <Input id="duration" type="number" value={duration} onChange={e => setDuration(Math.max(1, parseInt(e.target.value, 10) || 1))} className="rounded-xl bg-background/50 border-none h-11"/>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="w-full rounded-xl h-12 font-bold shadow-lg" disabled={!name.trim() || !startDate || duration <= 0}>
              {existingEvent ? "Enregistrer les modifs" : "On y va !"}
          </Button>
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
        title: 'Heu...',
        description: 'Dis-moi au moins combien de jours et ce que tu as en tête !',
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
        title: 'Tadam ! ✨',
        description: `Ton événement "${result.eventName}" est prêt.`,
      });
      setIsOpen(false);
      setConstraints('');
      setDuration(5);
      router.push(`/planning/events/${newEvent.id}`);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Oups, petit bug technique',
        description: error.message || 'L\'IA a eu un petit coup de mou.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full px-8 shadow-xl hover:scale-105 transition-transform">
          <Sparkles className="mr-2 h-5 w-5" />
          Magie de l'IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
              <Sparkles className="text-primary h-6 w-6" />
              L'IA s'occupe de tout
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="duration-ai" className="font-bold">Durée (jours)</Label>
            <Input id="duration-ai" type="number" min="1" max="14" value={duration} onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)} className="rounded-xl bg-background/50 border-none h-11"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="constraints-ai" className="font-bold">Tes envies du moment</Label>
            <Textarea
              id="constraints-ai"
              placeholder="Dis-moi tout : végétarien, rapide, sans choux de Bruxelles, ambiance italie..."
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              rows={4}
              className="rounded-xl bg-background/50 border-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full rounded-xl h-12 font-bold shadow-lg">
            {isLoading ? <><Loader2 className="animate-spin mr-2" /> Je réfléchis...</> : 'Générer la magie ✨'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
