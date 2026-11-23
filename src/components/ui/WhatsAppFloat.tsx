"use client";

import { getWhatsAppUrl } from "@/constants/site";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

export default function WhatsAppFloat() {
  return (
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#20bd5a] active:scale-95 lg:hidden"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
