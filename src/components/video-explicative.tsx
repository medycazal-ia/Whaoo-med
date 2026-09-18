"use client";

import { useRef, useState } from "react";
import Link from "next/link";

export function VideoExplicative() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [demarree, setDemarree] = useState(false);
  const [terminee, setTerminee] = useState(false);

  function rejouer() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setTerminee(false);
    setDemarree(true);
  }

  return (
    <div ref={containerRef} className="w-full max-w-2xl scroll-mt-4">
      <div className="relative overflow-hidden rounded-2xl border border-craie/15 bg-black/20">
        <video
          ref={videoRef}
          controls
          preload="metadata"
          playsInline
          poster="/videos/whaoo-demo-poster.jpg"
          className="w-full"
          onPlay={() => {
            if (!demarree) {
              containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            setDemarree(true);
          }}
          onEnded={() => setTerminee(true)}
        >
          <source src="/videos/whaoo-demo.mp4" type="video/mp4" />
        </video>

        {!demarree && !terminee && (
          <div className="pointer-events-none absolute inset-x-0 top-[28%] flex justify-center px-4">
            <span className="rounded-full bg-ambre px-4 py-2 text-center text-sm font-medium text-ardoise shadow-lg">
              🎬 40 secondes pour tout comprendre — clique ▶
            </span>
          </div>
        )}

        {terminee && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ardoise/95 px-6 text-center">
            <p className="font-heading text-lg font-semibold text-craie">
              Convaincu·e ?
            </p>
            <p className="max-w-xs text-sm text-craie/80">
              Crée ton compte gratuitement et commence dès maintenant.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/inscription"
                className="rounded-lg bg-basilic px-4 py-2 text-sm font-medium text-craie hover:opacity-90"
              >
                Créer mon compte
              </Link>
              <button
                type="button"
                onClick={rejouer}
                className="rounded-lg border border-craie/40 px-4 py-2 text-sm text-craie hover:bg-craie/10"
              >
                Revoir la vidéo
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-craie/50">
        Voir comment ça marche en 40 secondes
      </p>
    </div>
  );
}
