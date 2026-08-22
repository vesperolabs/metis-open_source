import { NextRequest } from "next/server";
import { elevenLabsErrorResponse, requestElevenLabsTranscription } from "@/lib/elevenlabs";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Transkrypcja głosowa nie jest teraz skonfigurowana." },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Nie udało się odczytać pliku audio." }, { status: 400 });
  }

  const audio = formData.get("audio");
  if (!(audio instanceof File)) {
    return Response.json({ error: "Wybierz plik audio albo nagraj wiadomość." }, { status: 400 });
  }

  if (!audio.type.startsWith("audio/")) {
    return Response.json({ error: "Ten plik nie wygląda na nagranie audio." }, { status: 400 });
  }

  if (audio.size === 0 || audio.size > MAX_AUDIO_BYTES) {
    return Response.json(
      { error: "Nagranie jest puste albo zbyt duże. Wybierz plik do 25 MB." },
      { status: 413 }
    );
  }

  try {
    const transcript = await requestElevenLabsTranscription({ apiKey, audio });
    return Response.json({ transcript });
  } catch (error) {
    return elevenLabsErrorResponse(error);
  }
}
