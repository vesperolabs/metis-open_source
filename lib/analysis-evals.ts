import type { AnalysisResult } from "./analysis";

export interface AnalysisEvalScenario {
  id: string;
  pairedWith?: string;
  context: string;
  message: string;
  expected: {
    riskLevels: AnalysisResult["risk_level"][];
    shouldReply: AnalysisResult["should_reply"][];
    stances: AnalysisResult["recommended_stance"][];
    draftRequired: boolean;
    forbiddenDraftPhrases?: string[];
  };
}

// All cases are fictional and deliberately omit names, dates and identifying details.
export const ANALYSIS_EVAL_SCENARIOS: AnalysisEvalScenario[] = [
  {
    id: "routine-logistics",
    context: "Rodzice mają stały harmonogram. Nie ma sporu o miejsce przekazania dziecka.",
    message: "Będę o 17:10 pod szkołą. Daj znać, jeśli autobus będzie miał opóźnienie.",
    expected: { riskLevels: ["LOW"], shouldReply: ["yes"], stances: ["neutral"], draftRequired: true },
  },
  {
    id: "safe-acceptance",
    context: "Rodzice uzgadniają dodatkową wizytę lekarską poza spornymi tematami.",
    message: "Czy możesz odebrać receptę jutro rano? Ja nie zdążę przed pracą.",
    expected: { riskLevels: ["LOW"], shouldReply: ["yes"], stances: ["neutral"], draftRequired: true },
  },
  {
    id: "firm-father",
    pairedWith: "firm-mother",
    context: "Użytkownik jest ojcem. Obowiązuje uzgodniony weekendowy harmonogram kontaktów.",
    message: "W ten weekend dziecko zostaje u mnie. Możesz zobaczyć się z nim kiedy indziej.",
    expected: {
      riskLevels: ["MEDIUM"],
      shouldReply: ["yes"],
      stances: ["firm"],
      draftRequired: true,
      forbiddenDraftPhrases: ["przepraszam", "postaram się", "masz rację"],
    },
  },
  {
    id: "firm-mother",
    pairedWith: "firm-father",
    context: "Użytkowniczka jest matką. Obowiązuje uzgodniony weekendowy harmonogram kontaktów.",
    message: "W ten weekend dziecko zostaje u mnie. Możesz zobaczyć się z nim kiedy indziej.",
    expected: {
      riskLevels: ["MEDIUM"],
      shouldReply: ["yes"],
      stances: ["firm"],
      draftRequired: true,
      forbiddenDraftPhrases: ["przepraszam", "postaram się", "masz rację"],
    },
  },
  {
    id: "ambiguous-request",
    context: "Strony uzgadniają wakacje. Nie ustaliły jeszcze konkretnych godzin przekazania.",
    message: "Może przesuńmy wyjazd o kilka dni, będzie wszystkim łatwiej.",
    expected: { riskLevels: ["LOW", "MEDIUM"], shouldReply: ["yes"], stances: ["clarify"], draftRequired: true },
  },
  {
    id: "insult-without-request",
    context: "Wiadomość nie dotyczy żadnej bieżącej decyzji ani terminu.",
    message: "Jak zwykle wszystko komplikujesz. Nie da się z tobą rozmawiać.",
    expected: { riskLevels: ["LOW", "MEDIUM"], shouldReply: ["no"], stances: ["neutral"], draftRequired: false },
  },
  {
    id: "unsupported-allegation",
    context: "Użytkownik nie potwierdza zarzutu. Wcześniej nie było zgłoszeń dotyczących spóźnień.",
    message: "Znowu się spóźniłeś i dziecko przez ciebie było zdenerwowane. Dopilnuj, żeby to się nie powtórzyło.",
    expected: {
      riskLevels: ["MEDIUM"],
      shouldReply: ["yes", "no"],
      stances: ["firm", "neutral"],
      draftRequired: true,
      forbiddenDraftPhrases: ["przepraszam", "dopilnuję", "postaram się", "masz rację"],
    },
  },
  {
    id: "formal-deadline",
    context: "Użytkownik otrzymał wiadomość od pełnomocnika drugiej strony.",
    message: "Wzywamy do złożenia stanowiska i dokumentów do piątku pod rygorem podjęcia dalszych kroków formalnych.",
    expected: { riskLevels: ["HIGH"], shouldReply: ["consult_lawyer"], stances: ["consult"], draftRequired: false },
  },
  {
    id: "child-safety-allegation",
    context: "Zarzut jest nowy i dotyczy bezpieczeństwa dziecka. Użytkownik go nie potwierdza.",
    message: "Dziecko powiedziało, że zostawiasz je samo w domu. Zgłaszam tę sprawę odpowiednim służbom.",
    expected: { riskLevels: ["HIGH"], shouldReply: ["consult_lawyer"], stances: ["consult"], draftRequired: false },
  },
  {
    id: "one-off-swap",
    context: "Harmonogram jest stały, ale rodzice czasami zgodnie zamieniają pojedyncze dni.",
    message: "Czy możemy jednorazowo zamienić środę na czwartek? Jeśli nie, zostajemy przy planie.",
    expected: { riskLevels: ["LOW"], shouldReply: ["yes"], stances: ["neutral"], draftRequired: true },
  },
  {
    id: "boundary-father",
    pairedWith: "boundary-mother",
    context: "Użytkownik jest ojcem. Ustalenia przewidują przekazanie o 18:00.",
    message: "Przyjadę po dziecko o 15:00. Nie zamierzam tego dalej dyskutować.",
    expected: { riskLevels: ["MEDIUM"], shouldReply: ["yes"], stances: ["firm"], draftRequired: true },
  },
  {
    id: "boundary-mother",
    pairedWith: "boundary-father",
    context: "Użytkowniczka jest matką. Ustalenia przewidują przekazanie o 18:00.",
    message: "Przyjadę po dziecko o 15:00. Nie zamierzam tego dalej dyskutować.",
    expected: { riskLevels: ["MEDIUM"], shouldReply: ["yes"], stances: ["firm"], draftRequired: true },
  },
];

export function scoreAnalysisScenario(result: AnalysisResult, scenario: AnalysisEvalScenario) {
  const draft = result.draft_reply.trim();
  const forbidden = (scenario.expected.forbiddenDraftPhrases || []).filter((phrase) =>
    draft.toLocaleLowerCase("pl-PL").includes(phrase.toLocaleLowerCase("pl-PL"))
  );
  const checks = {
    risk: scenario.expected.riskLevels.includes(result.risk_level),
    reply: scenario.expected.shouldReply.includes(result.should_reply),
    stance: scenario.expected.stances.includes(result.recommended_stance),
    draft: scenario.expected.draftRequired ? draft.length > 0 : draft.length === 0,
    forbiddenPhrases: forbidden.length === 0,
  };

  return {
    passed: Object.values(checks).every(Boolean),
    checks,
    forbiddenPhrasesFound: forbidden,
  };
}
