import type { Metadata } from "next";
import { MapPin, MessageCircle, Phone, Mail, Clock } from "lucide-react";
import { SITE } from "@/constants/site";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import InquiryForm from "@/components/forms/InquiryForm";

export const metadata: Metadata = {
  title: `Contact Us | ${SITE.name}`,
  description: `Get in touch with ${SITE.name} for a free consultation. Call, email, or fill out our inquiry form.`,
};

export default function ContactPage() {
  const whatsappUrl = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi, I'd like to inquire about your services.")}`;

  return (
    <>
      <section className="bg-stone-950 py-20 text-white">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
            Contact
          </p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Get In Touch</h1>
          <p className="mt-6 max-w-2xl text-lg text-stone-300">
            Ready to start your project? Reach out and our team will respond
            within 24 hours.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading align="left" title="Contact Information" />
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="mt-1 h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-stone-900">
                      Office Address
                    </p>
                    <p className="mt-1 text-stone-600">{SITE.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="mt-1 h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-stone-900">Phone</p>
                    <a
                      href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                      className="mt-1 text-stone-600 hover:text-amber-600"
                    >
                      {SITE.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="mt-1 h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-stone-900">Email</p>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="mt-1 text-stone-600 hover:text-amber-600"
                    >
                      {SITE.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="mt-1 h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-stone-900">
                      Business Hours
                    </p>
                    <p className="mt-1 text-stone-600">
                      Mon - Sat: 9:00 AM - 7:00 PM
                    </p>
                    <p className="text-stone-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>

              <Button href={whatsappUrl} variant="whatsapp" className="mt-8">
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </Button>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
              <InquiryForm />
            </div>
          </div>
          <div className="grid gap-0 lg:grid-cols-1">
            <div className="mt-10 overflow-hidden rounded-2xl border border-stone-200">
              <iframe
                title="Office Location"
                src="https://maps.google.com/maps?q=Sree+Padha+homes,+Electronic+City,+Bengaluru,+Karnataka+560105&z=15&ie=UTF8&iwloc=&output=embed"
                className="h-64 w-full"
                loading="lazy"
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
