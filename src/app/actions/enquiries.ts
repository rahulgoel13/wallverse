"use server";

import { db } from "@/lib/db";
import { usesDatabase } from "@/lib/data-source";
import { contactSchema, type ContactInput } from "@/lib/validation";

export async function submitEnquiry(
  raw: ContactInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!usesDatabase) {
    return { ok: false, error: "Enquiries can't be stored without a database — please email the studio directly." };
  }
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
