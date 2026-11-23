import Link from "next/link";
import Image from "next/image";
import { Globe, Mail, MapPin, Phone, Share2 } from "lucide-react";
import { FOOTER_LINKS } from "@/constants/navigation";
import { SITE } from "@/constants/site";
import Container from "@/components/ui/Container";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-stone-300">
      <Container className="py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="inline-flex rounded-lg bg-white p-2">
              <Image
                src="/logo/logo-01.png"
                alt={SITE.name}
                width={299}
                height={256}
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-400">
              {SITE.description}
            </p>
            <div className="mt-6 flex gap-3">
              {[Share2, Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-stone-300 transition hover:bg-amber-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Company</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-amber-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Services</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-amber-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                {SITE.address}
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-amber-500" />
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-amber-500" />
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-800 pt-8 text-sm text-stone-500 sm:flex-row">
          <p>&copy; {year} Dream Home Solutions. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-amber-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-amber-400">Terms of Service</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
