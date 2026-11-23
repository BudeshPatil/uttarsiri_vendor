import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { getPublicUrl } from "@/lib/utils";

interface BuildTogetherSectionProps {
  backgroundImage?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export default function BuildTogetherSection({
  backgroundImage = "/images/about/abt-12.jpg",
  primaryHref = "/contact",
  primaryLabel = "Start Your Project",
  secondaryHref = "/portfolio",
  secondaryLabel = "View Our Work",
}: BuildTogetherSectionProps) {
  return (
    <section className="relative overflow-hidden py-24">
      <Image
        src={getPublicUrl(backgroundImage)}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        aria-hidden
      />
      <div className="absolute inset-0 bg-stone-950/80" />
      <Container className="relative text-center text-white">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Let&apos;s Build Together</p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Ready to Transform Your Space?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-300">
            Share your ideas with our team and receive a tailored consultation for your next interior
            or renovation project.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href={primaryHref} variant="secondary">
              {primaryLabel}
            </Button>
            <Button href={secondaryHref} variant="secondary">
              {secondaryLabel}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
