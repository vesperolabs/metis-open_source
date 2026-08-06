import type { AnalysisResult } from "./analysis";
import { storeTransientAnalysis } from "./result-storage";

export const SAMPLE_CONTEXT =
  "Marcin (ojciec) i Agnieszka (matka), syn Kuba (6 lat). Opieka naprzemienna tydzień/tydzień zgodnie z postanowieniem sądu z marca 2025. W toku sprawa o alimenty. Tematy wrażliwe: nie poruszać kwestii finansowych w wiadomościach.";

export const SAMPLE_MESSAGE =
  "Cześć, w ten weekend jednak nie dam rady przekazać Ci Kuby, coś mi wypadło. Możesz zobaczyć się z nim w czwartek przez dwie godziny zamiast tego. I proszę, nie rób z tego znowu problemu — wiesz, że Kuba bardzo źle znosi te wszystkie napięcia, które tworzysz.";

export const SAMPLE_RESULT: AnalysisResult = {
  risk_level: "MEDIUM",
  risk_explanation:
    "Wiadomość wygląda jak logistyka, ale jednostronnie odwołuje ustalony kontakt i proponuje w zamian znacznie krótszy termin. Zawiera też presję emocjonalną — sugestię, że ewentualny sprzeciw będzie 'robieniem problemów' i źródłem napięć dla dziecka.",
  should_reply: "yes",
  decision_explanation:
    "Warto odpowiedzieć krótko i rzeczowo: potwierdzić ustalony harmonogram i poprosić o konkret organizacyjny. Brak odpowiedzi mógłby zostać przedstawiony jako milcząca zgoda na zmianę.",
  message_summary:
    "Wiadomość proponuje zastąpienie zaplanowanego weekendu dwugodzinnym spotkaniem w tygodniu. Nie podaje konkretnej przyczyny i łączy ewentualny sprzeciw z zarzutem tworzenia napięć.",
  recommended_stance: "firm",
  stance_explanation:
    "Spokojnie podtrzymaj ustalony harmonogram. Nie musisz akceptować zmiany ani tłumaczyć się z niepotwierdzonego zarzutu.",
  options: [
    "Podtrzymać ustalony termin i poprosić o wskazanie konkretnej przeszkody.",
    "Jeśli zmiana jest dla Ciebie akceptowalna, wyraźnie zaznaczyć, że jest jednorazowa i uzgodnić równoważny termin.",
  ],
  attention_points: [
    "Zgoda ('ok, niech będzie czwartek') może zostać pokazana jako akceptacja 'elastycznych' ustaleń i precedens na przyszłość.",
    "Brak odpowiedzi może zostać przedstawiony jako milcząca zgoda.",
    "Emocjonalna odpowiedź może posłużyć jako dowód konfliktowości — zwłaszcza w zestawieniu ze zdaniem o dziecku 'źle znoszącym napięcia'.",
  ],
  what_not_to_write: [
    "Nie zgadzaj się wprost na zamianę weekendu na dwie godziny.",
    "Nie oskarżaj i nie komentuj motywacji drugiej strony.",
    "Nie wchodź w temat 'napięć' — to przynęta emocjonalna.",
  ],
  lawyer_questions: [
    "Czy pojedyncza zgoda na zmianę terminu może osłabić ustalony harmonogram kontaktów?",
    "Jak dokumentować jednostronne odwołania kontaktów przez drugą stronę?",
  ],
  draft_reply:
    "Cześć, zależy mi na stabilności dla Kuby, więc trzymajmy się ustalonego harmonogramu — weekend zgodnie z planem. Jeśli pojawiła się konkretna przeszkoda organizacyjna, napisz proszę, jaka — wtedy spokojnie się do niej odniosę.",
};

export function loadSampleAnalysis() {
  storeTransientAnalysis({
    result: SAMPLE_RESULT,
    message: SAMPLE_MESSAGE,
    source: "sample",
  });
  localStorage.setItem("metis_sample_seen", "true");
}
