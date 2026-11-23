"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { NAV_LINKS } from "@/constants/navigation";
import { getWhatsAppUrl, SITE } from "@/constants/site";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";
  const solid = !isHome || scrolled || mobileOpen;

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        solid
          ? "border-b border-stone-200/80 bg-white/95 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-black/40 to-transparent transition-opacity duration-300",
          solid ? "opacity-0" : "opacity-100",
        )}
      />
      <Container>
        <div className="flex h-18 items-center justify-between py-4">
          <div className="flex flex-1 items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo/logo-01.png"
                alt={SITE.name}
                width={299}
                height={256}
                priority
                className="h-14 w-auto object-contain"
              />
            </Link>
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  solid
                    ? pathname === link.href
                      ? "text-amber-600"
                      : "text-stone-700 hover:text-amber-600"
                    : pathname === link.href
                      ? "text-amber-400"
                      : "text-white hover:text-amber-400",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="hidden items-center gap-3 lg:flex">
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  solid ? "text-stone-700 hover:text-amber-600" : "text-white hover:text-amber-400",
                )}
              >
                <Phone className="h-4 w-4" />
                {SITE.phone}
              </a>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="flex items-center justify-center rounded-full p-2 text-[#25D366] transition-colors hover:bg-[#25D366]/10"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
              <Button href="/contact" size="sm" variant={solid ? "primary" : "secondary"}>
                Get Quote
              </Button>
            </div>

            <button
              type="button"
              className={cn(
                "rounded-lg p-2 transition-colors lg:hidden",
                solid ? "text-stone-700" : "text-white",
              )}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-stone-100 py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    pathname === link.href
                      ? "bg-amber-50 text-amber-700"
                      : "text-stone-700 hover:bg-stone-50",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Button href="/contact" className="mt-2 w-full">
                Get Quote
              </Button>
            </div>
          </nav>
        )}
      </Container>
    </header>
  );
}
