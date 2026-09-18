"use client";

import { useEffect, useRef, useState } from "react";
import { SCRIPTS_TELEPROMPTER } from "@/lib/teleprompter-scripts";

const MIME_TYPES_CANDIDATS = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4",
];

function choisirMimeType(): string {
  for (const type of MIME_TYPES_CANDIDATS) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

function formaterDuree(secondes: number): string {
  const m = Math.floor(secondes / 60);
  const s = Math.floor(secondes % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TeleprompterStudio() {
  const [scriptId, setScriptId] = useState(SCRIPTS_TELEPROMPTER[0].id);
  const script = SCRIPTS_TELEPROMPTER.find((s) => s.id === scriptId) ?? SCRIPTS_TELEPROMPTER[0];

  const [camerActive, setCameraActive] = useState(false);
  const [erreurCamera, setErreurCamera] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [dureeEcoulee, setDureeEcoulee] = useState(0);
  const [videoEnregistree, setVideoEnregistree] = useState<{ url: string; extension: string } | null>(null);

  const [defilementActif, setDefilementActif] = useState(false);
  const [vitesse, setVitesse] = useState(28); // pixels/seconde
  const [tailleTexte, setTailleTexte] = useState(28); // px
  const [miroir, setMiroir] = useState(true);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scriptScrollRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const chronoRef = useRef<number | null>(null);

  async function demarrerCamera() {
    setErreurCamera(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setErreurCamera(
        "Impossible d'accéder à la caméra/au micro — vérifie les autorisations de ton navigateur.",
      );
    }
  }

  function arreterCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
    setEnregistrement(false);
  }

  function demarrerEnregistrement() {
    const stream = streamRef.current;
    if (!stream) return;
    const mimeType = choisirMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const extension = mimeType.includes("mp4") ? "mp4" : "webm";
      const blob = new Blob(chunksRef.current, { type: mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoEnregistree({ url, extension });
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setEnregistrement(true);
    setDureeEcoulee(0);
    setVideoEnregistree(null);

    const debut = Date.now();
    chronoRef.current = window.setInterval(() => {
      setDureeEcoulee((Date.now() - debut) / 1000);
    }, 200);

    demarrerDefilement();
  }

  function arreterEnregistrement() {
    mediaRecorderRef.current?.stop();
    setEnregistrement(false);
    if (chronoRef.current) window.clearInterval(chronoRef.current);
    arreterDefilement();
  }

  function demarrerDefilement() {
    setDefilementActif(true);
  }

  function arreterDefilement() {
    setDefilementActif(false);
  }

  function reinitialiserDefilement() {
    scrollPosRef.current = 0;
    if (scriptScrollRef.current) scriptScrollRef.current.style.transform = "translateY(0px)";
    setDefilementActif(false);
  }

  // Défilement automatique du texte pendant la lecture/l'enregistrement.
  useEffect(() => {
    if (!defilementActif) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    let dernierTemps = performance.now();
    function tick(temps: number) {
      const delta = (temps - dernierTemps) / 1000;
      dernierTemps = temps;
      scrollPosRef.current += vitesse * delta;
      if (scriptScrollRef.current) {
        scriptScrollRef.current.style.transform = `translateY(-${scrollPosRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [defilementActif, vitesse]);

  // Le changement de script remet le défilement à zéro.
  useEffect(() => {
    reinitialiserDefilement();
  }, [scriptId]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (chronoRef.current) window.clearInterval(chronoRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ardoise">
          🎥 Studio d&apos;enregistrement whaoo
        </h1>
        <p className="text-sm text-ardoise/60">
          Enregistre-toi en train de présenter whaoo, avec un prompteur qui
          défile devant la caméra. Tout reste sur ton appareil — rien n&apos;est
          envoyé où que ce soit.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm text-ardoise/80">
        Scénario à présenter
        <select
          value={scriptId}
          onChange={(e) => setScriptId(e.target.value)}
          className="rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise"
        >
          {SCRIPTS_TELEPROMPTER.map((s) => (
            <option key={s.id} value={s.id}>
              {s.titre}
            </option>
          ))}
        </select>
      </label>

      <div className="relative overflow-hidden rounded-2xl border border-ardoise/15 bg-black">
        <video
          ref={videoPreviewRef}
          autoPlay
          muted
          playsInline
          className={`aspect-[9/16] w-full object-cover ${miroir ? "-scale-x-100" : ""}`}
        />

        {!camerActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ardoise/90 px-6 text-center">
            <p className="text-craie">
              {erreurCamera ?? "Active ta caméra pour commencer."}
            </p>
            <button
              type="button"
              onClick={demarrerCamera}
              className="rounded-lg bg-basilic px-4 py-2 font-medium text-craie hover:opacity-90"
            >
              📷 Activer la caméra
            </button>
          </div>
        )}

        {camerActive && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 overflow-hidden bg-gradient-to-b from-black/70 to-transparent px-4 pt-3">
            <div ref={scriptScrollRef} className="flex flex-col gap-3">
              {script.lignes.map((ligne, i) => (
                <p
                  key={i}
                  style={{ fontSize: `${tailleTexte}px` }}
                  className="font-medium leading-snug text-craie drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                >
                  {ligne}
                </p>
              ))}
              <div style={{ height: "40vh" }} />
            </div>
          </div>
        )}

        {enregistrement && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-tomate px-3 py-1 text-xs font-medium text-craie">
            <span className="h-2 w-2 animate-pulse rounded-full bg-craie" />
            REC {formaterDuree(dureeEcoulee)}
          </span>
        )}
      </div>

      {camerActive && (
        <div className="flex flex-col gap-3 rounded-xl border border-ardoise/15 bg-white p-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-ardoise/70">
            <label className="flex items-center gap-2">
              Vitesse du texte
              <input
                type="range"
                min={10}
                max={80}
                value={vitesse}
                onChange={(e) => setVitesse(Number(e.target.value))}
              />
            </label>
            <label className="flex items-center gap-2">
              Taille du texte
              <input
                type="range"
                min={18}
                max={44}
                value={tailleTexte}
                onChange={(e) => setTailleTexte(Number(e.target.value))}
              />
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={miroir} onChange={(e) => setMiroir(e.target.checked)} />
              Effet miroir (aperçu seulement)
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {!enregistrement ? (
              <>
                <button
                  type="button"
                  onClick={demarrerDefilement}
                  disabled={defilementActif}
                  className="rounded-lg border border-ardoise/20 px-3 py-2 text-sm text-ardoise disabled:opacity-40"
                >
                  ▶️ Défiler le texte
                </button>
                <button
                  type="button"
                  onClick={arreterDefilement}
                  disabled={!defilementActif}
                  className="rounded-lg border border-ardoise/20 px-3 py-2 text-sm text-ardoise disabled:opacity-40"
                >
                  ⏸️ Pause
                </button>
                <button
                  type="button"
                  onClick={reinitialiserDefilement}
                  className="rounded-lg border border-ardoise/20 px-3 py-2 text-sm text-ardoise"
                >
                  ⏮️ Recommencer le texte
                </button>
                <button
                  type="button"
                  onClick={demarrerEnregistrement}
                  className="ml-auto rounded-lg bg-tomate px-4 py-2 text-sm font-medium text-craie hover:opacity-90"
                >
                  ⏺️ Démarrer l&apos;enregistrement
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={arreterEnregistrement}
                className="ml-auto rounded-lg bg-tomate px-4 py-2 text-sm font-medium text-craie hover:opacity-90"
              >
                ⏹️ Arrêter l&apos;enregistrement
              </button>
            )}
            <button
              type="button"
              onClick={arreterCamera}
              className="rounded-lg px-3 py-2 text-sm text-ardoise/60 hover:text-ardoise"
            >
              Éteindre la caméra
            </button>
          </div>
        </div>
      )}

      {videoEnregistree && (
        <div className="flex flex-col gap-2 rounded-xl border border-basilic/40 bg-basilic/10 p-3">
          <p className="text-sm font-medium text-ardoise">
            ✅ Vidéo enregistrée — relis-la avant de la télécharger.
          </p>
          <video src={videoEnregistree.url} controls playsInline className="w-full rounded-lg" />
          <a
            href={videoEnregistree.url}
            download={`whaoo-demo-${script.id}.${videoEnregistree.extension}`}
            className="self-start rounded-lg bg-basilic px-4 py-2 text-sm font-medium text-craie hover:opacity-90"
          >
            ⬇️ Télécharger la vidéo
          </a>
        </div>
      )}
    </div>
  );
}
