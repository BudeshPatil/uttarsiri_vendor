"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle, Loader2 } from "lucide-react";
import { submitContactForm } from "@/services/public.service";
import type { ContactFormData } from "@/types";
import Button from "@/components/ui/Button";

interface InquiryFormProps {
  serviceInterest?: string;
  compact?: boolean;
  buttonVariant?: "primary" | "secondary" | "outline" | "whatsapp";
}

export default function InquiryForm({ serviceInterest, compact, buttonVariant = "primary" }: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ContactFormData>({
    defaultValues: { service_interest: serviceInterest || "" },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setError("");
      await submitContactForm(data);
      setSubmitted(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit inquiry");
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-lg font-semibold">Thank You!</h3>
        <p className="mt-2 text-sm font-semibold">
          Your inquiry has been submitted. We&apos;ll contact you shortly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 btn-primary text-sm font-medium text-amber-600"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!compact && <h3 className="text-lg font-semibold">Request a Free Quote</h3>}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          {...register("name", { required: true })}
          placeholder="Your Name *"
          className="rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
        />
        <input
          {...register("phone")}
          placeholder="Phone Number"
          className="rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
        />
      </div>
      <input
        {...register("email", { required: true })}
        type="email"
        placeholder="Email Address *"
        className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
      />
      <input
        {...register("service_interest")}
        placeholder="Service Interested In"
        className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
      />
      <textarea
        {...register("message")}
        rows={compact ? 3 : 4}
        placeholder="Tell us about your project..."
        className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
      />
      <Button type="submit" disabled={isSubmitting} className="w-full" variant={buttonVariant}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
          </>
        ) : (
          "Submit Inquiry"
        )}
      </Button>
    </form>
  );
}
