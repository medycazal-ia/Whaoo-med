"use client";

import { useRef, useState } from "react";
import Link from "next/link";

export function VideoPartage({
  videoSrc,
  posterSrc,
  titre,
}: {
  videoSrc: string;
  posterSrc: string;
  titre: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [demarree, setDemarree] = useState(false);
  const [terminee, setTerminee] = useState(false);

  function lancerLecture() {
    videoRef.current?.play();
  }

  function rejouer() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setTerminee(false);
    setDemarree(true);
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <div className="relative w-full overflow-hidden rounded-2xl border border-ardoise/15 bg-black/10 shadow-lg">
        <video
          ref={videoRef}
          controls
          preload="metadata"
          playsInline
          poster={posterSrc}
          className="w-full"
          onPlay={() => setDemarree(true)}
          onEnded={() => setTerminee(true)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {!demarree && (
          <button
            type="button"
            onClick={lancerLecture}
            aria-label="Lancer la vidéo"
            className="absolute inset-x-0 top-[6%] mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-craie/95 text-ardoise shadow-lg transition hover:scale-105"
          >
            <span className="ml-1 text-2xl">▶</span>
          </button>
        )}

        {terminee && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ardoise/95 px-6 text-center">
            <p className="font-heading text-lg font-semibold text-craie">
              Convaincu·e ?
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
                Revoir
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-ardoise/60">{titre}</p>

      {/* Toujours visible, un clic suffit — pas besoin d'attendre la fin de la vidéo */}
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <Link
          href="/demo"
          className="flex-1 rounded-xl bg-ardoise px-4 py-3 text-center font-medium text-craie shadow hover:bg-ardoise-light"
        >
          🎯 Essayer la démo (sans compte)
        </Link>
        <Link
          href="/inscription"
          className="flex-1 rounded-xl bg-basilic px-4 py-3 text-center font-medium text-craie shadow hover:opacity-90"
        >
          ✨ Créer mon compte
        </Link>
      </div>
    </div>
  );
}
