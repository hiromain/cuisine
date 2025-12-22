
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addDays, format, startOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePlanning } from '@/context/planning-context';
import type { PlannedEvent } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, CalendarDays, PartyPopper, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function PlanningPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
       <EventsView />
    </div>
  );
}


// ---- Event Components ----

function EventsView() {
    const { plannedEvents, removeEvent } = usePlanning();
    const router = useRouter();

    const handleCreateEvent = (newEvent: PlannedEvent) => {
        router.push(`/planning/events/${newEvent.id}`);
    }
    
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    Vos Événements
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                  Planifiez vos repas pour des occasions spéciales.
                </p>
            </div>

            <div className="flex justify-center">
                <AddEventDialog onEventCreated={handleCreateEvent}>
                    <Button size="lg">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Créer un événement
                    </Button>
                </AddEventDialog>
            </div>

            {plannedEvents.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plannedEvents.map(event => (
                        <Card key={event.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="font-headline flex justify-between items-start">
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
