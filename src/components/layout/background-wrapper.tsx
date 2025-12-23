"use client";

import Image from 'next/image';
import { useSettings } from '@/context/settings-context';

export function BackgroundWrapper() {
  const { backgroundImage } = useSettings();

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40 dark:opacity-20 transition-opacity duration-500">
      <Image
        src={backgroundImage}
        alt="Fond d'écran"
        fill
        className="object-cover transition-all duration-700"
        priority
      />
      {/* Dégradé pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
    </div>
  );
}
