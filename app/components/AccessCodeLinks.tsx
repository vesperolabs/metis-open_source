"use client";

import { track } from "@/lib/analytics";

const EMAIL_ADDRESS = "kacper.staroszczyk@gmail.com";
const WHATSAPP_BASE_URL = "https://wa.me/48725282419";

const MESSAGE = "Cześć, chcę poprosić o kod do pełnej wersji beta Metis.";
const SUBJECT = "Kod dostępu do Metis";

export default function AccessCodeLinks({
  className = "",
}: {
  className?: string;
}) {
  const emailUrl = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(MESSAGE)}`;
  const whatsappUrl = `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      <a
        href={emailUrl}
        onClick={() => track("access_contact_clicked", { channel: "email", intent: "code" })}
        className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-accent px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Napisz po kod — e-mail
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => track("access_contact_clicked", { channel: "whatsapp", intent: "code" })}
        className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-border bg-paper px-5 py-3 text-center text-sm font-semibold text-accent transition-colors hover:border-accent/40 hover:bg-accent-light"
      >
        …albo WhatsApp
      </a>
    </div>
  );
}
