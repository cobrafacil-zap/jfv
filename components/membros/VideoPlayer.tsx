"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  lessonId: string;
  onComplete?: () => void;
  onProgress?: (percent: number) => void;
}

export function VideoPlayer({ lessonId, onComplete, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportedComplete, setReportedComplete] = useState(false);

  // Buscar signed URL
  useEffect(() => {
    async function fetchUrl() {
      try {
        const res = await fetch(`/api/aluno/video-url/${lessonId}`);
        if (!res.ok) throw new Error("Não foi possível carregar o vídeo.");
        const data = await res.json();
        setVideoUrl(data.url);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar vídeo."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchUrl();
  }, [lessonId]);

  // Tracking de progresso
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const percent = (video.currentTime / video.duration) * 100;
    onProgress?.(percent);

    // Marca como assistido em >= 80%
    if (percent >= 80 && !reportedComplete) {
      setReportedComplete(true);
      markProgress(percent, true);
      onComplete?.();
    }
  };

  // Salvar progresso no servidor (debounced)
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handlePause = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const percent = (video.currentTime / video.duration) * 100;
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }
    progressTimeoutRef.current = setTimeout(() => {
      markProgress(percent, percent >= 80);
    }, 500);
  };

  async function markProgress(percent: number, watched: boolean) {
    try {
      await fetch("/api/aluno/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          progressPercent: percent,
          watched,
        }),
      });
    } catch (err) {
      console.error("Erro ao salvar progresso:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-border bg-bg-card">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/5 p-6 text-center">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm text-red-300">
          {error || "Vídeo não disponível."}
        </p>
      </div>
    );
  }

  return (
    <div className="video-frame aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
        onEnded={() => {
          if (!reportedComplete) {
            setReportedComplete(true);
            markProgress(100, true);
            onComplete?.();
          }
        }}
        className="h-full w-full"
        playsInline
        preload="metadata"
      >
        <track kind="captions" />
        Seu navegador não suporta vídeo.
      </video>
    </div>
  );
}