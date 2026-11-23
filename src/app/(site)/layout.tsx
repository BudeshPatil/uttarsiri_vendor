import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MainWrapper from "@/components/layout/MainWrapper";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import ScrollToTop from "@/components/ui/ScrollToTop";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <MainWrapper>{children}</MainWrapper>
      <Footer />
      <WhatsAppFloat />
      <ScrollToTop />
    </>
  );
}
