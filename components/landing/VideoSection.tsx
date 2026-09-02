"use client";

import { useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VideoSection() {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  return (
    <section id="vsl" className="section-clip relative py-10 md:py-20">
      <div className="absolute inset-0 -z-10 glow-bg" />

      <div className="container-custom px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent md:mb-4">
            Vídeo de apresentação
          </span>
          <h2 className="font-display text-2xl font-bold leading-tight md:text-4xl lg:text-5xl">
            Assista e descubra como{" "}
            <span className="text-gradient">triplicar seu engajamento</span>{" "}
            no Instagram.
          </h2>
          <p className="mt-3 text-sm text-text-secondary md:mt-4 md:text-lg">
            Em poucos minutos, você vai entender por que este método já
            transformou milhares de perfis.
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-5xl animate-fade-up md:mt-12">
          <div className="video-frame relative aspect-video bg-bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-bg-card via-bg-secondary to-accent/20" />

            {!playing && (
              <button
                onClick={() => setPlaying(true)}
                className="group absolute inset-0 flex items-center justify-center"
                aria-label="Reproduzir vídeo"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent shadow-accent-glow transition-all duration-300 group-hover:scale-110 animate-pulse-glow md:h-24 md:w-24">
                  <Play size={32} className="ml-1 fill-white text-white md:size-10" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-left md:bottom-6 md:left-6 md:right-6">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-accent md:text-xs">
                    VSL · 12 min
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white md:text-lg">
                    Por que a maioria dos perfis não cresce?
                  </p>
                </div>
              </button>
            )}

            {playing && (
              <>
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-lg bg-black/60 backdrop-blur-sm px-3 py-2 md:bottom-4 md:left-4 md:right-4 md:gap-3 md:px-4 md:py-2.5">
                  <button
                    onClick={() => setPlaying(false)}
                    className="text-white"
                    aria-label="Pausar"
                  >
                    <Pause size={18} className="fill-current md:size-5" />
                  </button>
                  <div className="h-1 flex-1 rounded-full bg-white/20">
                    <div className="h-full w-1/3 rounded-full bg-accent" />
                  </div>
                  <span className="text-[10px] font-medium text-white md:text-xs">4:08 / 12:00</span>
                  <button
                    onClick={() => setMuted(!muted)}
                    className="text-white"
                    aria-label="Mudo"
                  >
                    {muted ? <VolumeX size={18} className="md:size-5" /> : <Volume2 size={18} className="md:size-5" />}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 text-center md:mt-10">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href="#oferta">Quero garantir minha vaga agora</a>
            </Button>
            <p className="mt-2 text-xs text-text-muted md:mt-3 md:text-sm">
              Vagas limitadas nesta turma
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}