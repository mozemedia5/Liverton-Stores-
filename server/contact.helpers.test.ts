import { describe, expect, it } from "vitest";
import {
  CONTACT_EMAIL,
  buildOwnerContactContent,
  buildWhatsAppLink,
  getContactConfirmation,
} from "@shared/contact";

const draft = {
  name: "Amina",
  email: "amina@example.com",
  subject: "Order question",
  message: "Could you help me choose the right device?",
};

describe("Liverton contact helpers", () => {
  it("generates a WhatsApp handoff with an encoded message and the configured number", () => {
    const link = buildWhatsAppLink(draft);
    expect(link).toMatch(/^https:\/\/wa\.me\/256705954597\?text=/);
    expect(decodeURIComponent(link)).toContain("Liverton contact from Amina");
    expect(decodeURIComponent(link)).toContain(draft.message);
  });

  it("builds owner-notification content for the requested email destination", () => {
    const content = buildOwnerContactContent(draft, "email");
    expect(content).toContain(`Requested destination: ${CONTACT_EMAIL}`);
    expect(content).toContain(draft.subject);
    expect(content).toContain(draft.message);
  });

  it("covers delivered, unavailable, and WhatsApp confirmation states", () => {
    expect(getContactConfirmation("email", true)).toContain(CONTACT_EMAIL);
    expect(getContactConfirmation("email", false)).toContain("temporarily unavailable");
    expect(getContactConfirmation("whatsapp", true)).toContain("Continue to WhatsApp");
  });
});
