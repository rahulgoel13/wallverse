"use client";

import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

export function FieldShell({ label, error, hint, children }: FieldShellProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label opacity-70">
        {label}
      </label>
      {children({ id, describedBy: error ? errorId : undefined, invalid: Boolean(error) })}
      {hint && !error ? <p className="text-xs opacity-50">{hint}</p> : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputCls =
  "w-full border border-current/25 bg-transparent px-4 py-3 text-sm placeholder:opacity-40 focus:border-current outline-none transition-colors aria-[invalid=true]:border-error";

export function TextField({
  label,
  error,
  hint,
  ...rest
}: { label: string; error?: string; hint?: string } & ComponentPropsWithoutRef<"input">) {
  return (
    <FieldShell label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <input id={id} aria-invalid={invalid} aria-describedby={describedBy} className={inputCls} {...rest} />
      )}
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  ...rest
}: { label: string; error?: string; hint?: string } & ComponentPropsWithoutRef<"textarea">) {
  return (
    <FieldShell label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`${inputCls} min-h-28 resize-y`}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({
  label,
  error,
  hint,
  children,
  ...rest
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<"select">) {
  return (
    <FieldShell label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`${inputCls} appearance-none bg-no-repeat bg-[right_1rem_center] cursor-pointer [&>option]:bg-obsidian [&>option]:text-ivory`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23999' stroke-width='1.5'/%3E%3C/svg%3E\")",
          }}
          {...rest}
        >
          {children}
        </select>
      )}
    </FieldShell>
  );
}
