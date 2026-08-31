import Hero from "@/components/journey/Hero";
import Dream from "@/components/journey/Dream";
import Worlds from "@/components/journey/Worlds";
import Moments from "@/components/journey/Moments";
import Experience from "@/components/journey/Experience";
import BookingInvite from "@/components/journey/BookingInvite";
import Footer from "@/components/site/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Dream />
      <Worlds />
      <Moments />
      <Experience />
      <BookingInvite />
      <Footer />
    </main>
  );
}
