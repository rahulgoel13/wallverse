"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { submitEnquiry } from "@/app/actions/enquiries";
import { TextField, TextAreaField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

/** A ready-to-send email holding the enquiry (used when there is no database to store it). */
function enquiryMailto(to: string, data: ContactInput) {
  const body = [
    data.message,
    "",
    "—",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactForm({ emailTo }: { emailTo?: string }) {
  const [done, setDone] = useState(false);
  const [mailto, setMailto] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  if (mailto) {
    return (
      <div className="border border-citron/40 p-8 text-center">
        <p className="label text-citron mb-3">Almost sent</p>
        <p className="font-serif text-2xl">Your email app should now be open with the enquiry ready to send.</p>
        <p className="mt-4 text-sm opacity-70">
          Nothing opened?{" "}
          <a href={mailto} className="text-citron underline underline-offset-4">
            Open the email again
          </a>{" "}
          or write to <span className="text-citron">{emailTo}</span>.
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setMailto(null);
          }}
          className="label mt-5 opacity-60 hover:opacity-100 cursor-pointer"
        >
          Write another enquiry
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="border border-citron/40 p-8 text-center">
        <p className="label text-citron mb-3">Received</p>
        <p className="font-serif text-2xl">Thank you — the studio will reply within one working day.</p>
        <button
          type="button"
          onClick={() => {
            reset();
            setDone(false);
          }}
          className="label mt-5 opacity-60 hover:opacity-100 cursor-pointer"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (data) => {
        setServerError(null);
        if (emailTo) {
          const link = enquiryMailto(emailTo, data);
          setMailto(link);
          window.location.assign(link);
          return;
        }
        const res = await submitEnquiry(data);
        if (res.ok) setDone(true);
        else setServerError(res.error);
      })}
      className="flex flex-col gap-5"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <TextField
          label="Phone (optional)"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <TextField label="Subject" error={errors.subject?.message} {...register("subject")} />
      </div>
      <TextAreaField label="Message" rows={6} error={errors.message?.message} {...register("message")} />
      {serverError ? (
        <p role="alert" className="text-sm text-error">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" variant="citron" className="self-start" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : emailTo ? "Write the email" : "Send enquiry"}
      </Button>
    </form>
  );
}
