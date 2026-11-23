import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg leading-relaxed text-stone-600">{description}</p>
      )}
    </div>
  );
}
