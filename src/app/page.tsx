import Hero from "@/components/journey/Hero";
import Dream from "@/components/journey/Dream";
import Worlds from "@/components/journey/Worlds";
import Depoimentos from "@/components/journey/Depoimentos";
import Moments from "@/components/journey/Moments";
import Experience from "@/components/journey/Experience";
import FAQ from "@/components/journey/FAQ";
import BookingInvite from "@/components/journey/BookingInvite";
import Footer from "@/components/site/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Dream />
      <Worlds />
      <Depoimentos />
      <Moments />
      <Experience />
      <FAQ />
      <BookingInvite />
      <Footer />
    </main>
  );
}
