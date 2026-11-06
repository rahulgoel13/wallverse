"use server";

import { db } from "@/lib/db";
import { contactSchema, type ContactInput } from "@/lib/validation";

export async function submitEnquiry(
  raw: ContactInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  await db.enquiry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  });
  return { ok: true };
}
