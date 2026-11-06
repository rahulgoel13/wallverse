"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { submitEnquiry } from "@/app/actions/enquiries";
import { TextField, TextAreaField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

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
        {isSubmitting ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}
