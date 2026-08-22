"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

const MAX_RECORDING_SECONDS = 180;
const MONTHLY_TRANSCRIPTION_LIMIT = 3;

type VoiceTranscribeButtonProps = {
  field: "case_context" | "incoming_message" | "own_draft";
  onTranscript: (transcript: string) => void;
};

function usageKey() {
  return `metis_voice_transcriptions_${new Date().toISOString().slice(0, 7)}`;
}

function usedTranscriptions() {
  try {
    return Number.parseInt(localStorage.getItem(usageKey()) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function recordTranscriptionUse() {
  try {
    localStorage.setItem(usageKey(), String(usedTranscriptions() + 1));
  } catch {
    // The feature works without browser storage; only the local courtesy limit is skipped.
  }
}

async function audioDurationSeconds(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = url;
    return await new Promise<number>((resolve) => {
      const fallback = window.setTimeout(() => resolve(Number.NaN), 5_000);
      const complete = (duration: number) => {
        window.clearTimeout(fallback);
        resolve(duration);
      };
      audio.onloadedmetadata = () => complete(audio.duration);
      audio.onerror = () => complete(Number.NaN);
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function VoiceTranscribeButton({ field, onTranscript }: VoiceTranscribeButtonProps) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [notice, setNotice] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => () => stopStream(), []);

  function stopStream() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function canTranscribe() {
    if (usedTranscriptions() >= MONTHLY_TRANSCRIPTION_LIMIT) {
      setNotice("Wykorzystano limit 3 transkrypcji głosowych na tym urządzeniu w tym miesiącu.");
      return false;
    }
    return true;
  }

  async function transcribe(file: File) {
    if (!canTranscribe()) return;
    setNotice("");

    const duration = await audioDurationSeconds(file);
    if (Number.isFinite(duration) && duration > MAX_RECORDING_SECONDS) {
      setNotice("Nagranie może mieć maksymalnie 3 minuty. Skróć je i spróbuj ponownie.");
      return;
    }

    setTranscribing(true);
    track("voice_transcription_started", { field });
    try {
      const formData = new FormData();
      formData.append("audio", file, file.name || "nagranie-audio.webm");
      const response = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = (await response.json().catch(() => ({}))) as { transcript?: unknown; error?: unknown };
      if (!response.ok || typeof data.transcript !== "string") {
        throw new Error(typeof data.error === "string" ? data.error : "Nie udało się przetworzyć nagrania.");
      }
      recordTranscriptionUse();
      onTranscript(data.transcript);
      setNotice("Tekst dodano do pola. Przeczytaj go i popraw przed użyciem.");
      track("voice_transcription_completed", { field });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Nie udało się przetworzyć nagrania.");
      track("voice_transcription_failed", { field });
    } finally {
      setTranscribing(false);
    }
  }

  async function startRecording() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    if (!canTranscribe()) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setNotice("Ta przeglądarka nie obsługuje nagrywania. Wybierz plik audio zamiast tego.");
      return;
    }

    try {
      setNotice("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        setRecording(false);
        stopStream();
        recorderRef.current = null;
        const recordingFile = new File([new Blob(chunks, { type: recorder.mimeType || "audio/webm" })], "nagranie.webm", {
          type: recorder.mimeType || "audio/webm",
        });
        if (recordingFile.size > 0) void transcribe(recordingFile);
      };
      recorder.start();
      setRecording(true);
      track("voice_recording_started", { field });
      timerRef.current = window.setTimeout(() => recorder.stop(), MAX_RECORDING_SECONDS * 1000);
    } catch {
      stopStream();
      setNotice("Nie udało się uruchomić mikrofonu. Sprawdź zgodę w przeglądarce albo wybierz plik audio.");
    }
  }

  async function selectFile(file: File | undefined) {
    if (!file || recording || transcribing) return;
    await transcribe(file);
  }

  return (
    <div className="mt-3 rounded-[10px] border border-border bg-cream px-3 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={startRecording}
          disabled={transcribing}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {recording ? "Zatrzymaj nagranie" : transcribing ? "Przepisuję nagranie…" : "Nagraj głosowo"}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={recording || transcribing}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Wybierz plik audio
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void selectFile(file);
          }}
        />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-muted">
        Maks. 3 min. Audio trafia do ElevenLabs wyłącznie do transkrypcji; Metis nie zapisuje nagrania. Tekst zostanie dodany do pola i możesz go poprawić. Limit: 3 nagrania na tym urządzeniu w miesiącu.
      </p>
      {notice && (
        <p className="mt-2 text-xs leading-relaxed text-ink-body" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}
