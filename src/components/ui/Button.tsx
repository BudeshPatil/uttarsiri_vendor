import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  external?: boolean;
  variant?: "primary" | "secondary" | "outline" | "whatsapp";
  size?: "sm" | "md" | "lg";
}

const variantClass = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-primary",
  whatsapp: "btn-whatsapp",
} as const;

export default function Button({
  href,
  external,
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const isBlock = className?.includes("w-full");
  const classes = cn(variantClass[variant], isBlock && "btn-block", className);

  if (href) {
    const isExternal = external || href.startsWith("http");

    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={props.disabled} {...props}>
      {children}
    </button>
  );
}
