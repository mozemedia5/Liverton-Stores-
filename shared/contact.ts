export const CONTACT_EMAIL = "livertoncodes@gmail.com";
export const WHATSAPP_NUMBER = "256705954597";

export type ContactDraft = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function buildWhatsAppLink(draft: ContactDraft): string {
  const text = `Liverton contact from ${draft.name} (${draft.email})\n\n${draft.subject}\n${draft.message}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function buildOwnerContactContent(draft: ContactDraft, channel: "email" | "whatsapp"): string {
  return `Channel: ${channel}\nName: ${draft.name}\nEmail: ${draft.email}\nSubject: ${draft.subject}\nRequested destination: ${CONTACT_EMAIL}\nWhatsApp destination: +256 705 954 597\n\n${draft.message}`;
}

export function getContactConfirmation(channel: "email" | "whatsapp", delivered: boolean): string {
  if (channel === "whatsapp") return "Your message has been prepared in Liverton. Continue to WhatsApp when you are ready to send it.";
  return delivered
    ? `Your inquiry was submitted to Liverton support and routed through the project notification channel. Requested destination: ${CONTACT_EMAIL}.`
    : "Your inquiry was saved, but the notification channel is temporarily unavailable. Please try again or use WhatsApp.";
}
