"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings, DEFAULT_BACKGROUND_IMAGE } from '@/context/settings-context';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon, Upload, Trash2, Check, Loader2, RefreshCcw } from 'lucide-react';
import Image from 'next/image';
import { getStorage, ref, uploadBytes, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { initializeFirebase } from '@/firebase';

interface StorageImage {
  name: string;
  url: string;
  fullPath: string;
}

export function BackgroundManager() {
  const { backgroundImage, setBackgroundImage } = useSettings();
  const { toast } = useToast();
  const [images, setImages] = useState<StorageImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Storage
  const { storage } = initializeFirebase();
  const backgroundsRef = ref(storage, 'backgrounds');

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const res = await listAll(backgroundsRef);
      const imagePromises = res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          url: url,
          fullPath: itemRef.fullPath,
        };
      });
      const fetchedImages = await Promise.all(imagePromises);
      setImages(fetchedImages);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les images.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Fichier trop volumineux",
        description: "L'image ne doit pas dépasser 5 Mo.",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Create a unique name
      const fileName = `${Date.now()}-${file.name}`;
      const imageRef = ref(storage, `backgrounds/${fileName}`);
      
      await uploadBytes(imageRef, file);
      
      toast({
        title: "Succès",
        description: "Image téléchargée avec succès.",
      });
      
      await fetchImages();
      
      // Auto-select the new image
      const newUrl = await getDownloadURL(imageRef);
      setBackgroundImage(newUrl);

    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger l'image.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (image: StorageImage, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection when clicking delete
    
    if (!confirm("Voulez-vous vraiment supprimer cette image ?")) return;

    try {
      const imageRef = ref(storage, image.fullPath);
      await deleteObject(imageRef);
      
      toast({
        title: "Image supprimée",
        description: "L'image a été retirée du stockage.",
      });

      // If the deleted image was selected, revert to default
      if (backgroundImage === image.url) {
        setBackgroundImage(DEFAULT_BACKGROUND_IMAGE);
      }

      setImages(prev => prev.filter(img => img.fullPath !== image.fullPath));
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'image.",
      });
    }
  };

  const isDefault = backgroundImage === DEFAULT_BACKGROUND_IMAGE;

  return (
    <Card className="mt-8 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-serif">
          <ImageIcon className="h-6 w-6 text-primary" />
          Ambiance Visuelle
        </CardTitle>
        <CardDescription>
          Choisis l'image de fond qui t'inspire le plus ou ajoutes-en une nouvelle.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
           <Button 
             variant="outline" 
             onClick={() => fileInputRef.current?.click()} 
             disabled={isUploading}
             className="rounded-full"
           >
             {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
             Ajouter une image
           </Button>
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/*" 
             onChange={handleUpload} 
           />
           
           {!isDefault && (
             <Button variant="ghost" onClick={() => setBackgroundImage(DEFAULT_BACKGROUND_IMAGE)} className="text-muted-foreground hover:text-foreground">
               <RefreshCcw className="mr-2 h-4 w-4" />
               Revenir au défaut
             </Button>
           )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Default Image Option */}
             <div 
                className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-4 transition-all group ${isDefault ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-white/50'}`}
                onClick={() => setBackgroundImage(DEFAULT_BACKGROUND_IMAGE)}
              >
                <Image 
                  src={DEFAULT_BACKGROUND_IMAGE} 
                  alt="Défaut" 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105" 
                />
                {isDefault && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-6 w-6" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center backdrop-blur-sm">
                  Par défaut
                </div>
              </div>

            {/* Uploaded Images */}
            {images.map((img) => {
              const isSelected = backgroundImage === img.url;
              return (
                <div 
                  key={img.fullPath} 
                  className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-4 transition-all group ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-white/50'}`}
                  onClick={() => setBackgroundImage(img.url)}
                >
                  <Image 
                    src={img.url} 
                    alt="Fond personnalisé" 
                    fill 
                    className="object-cover transition-transform group-hover:scale-105" 
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-6 w-6" />
                      </div>
                    </div>
                  )}
                  
                  <button 
                    onClick={(e) => handleDelete(img, e)}
                    className="absolute top-2 right-2 p-1.5 bg-destructive/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
