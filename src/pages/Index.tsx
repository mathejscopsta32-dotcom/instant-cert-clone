import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Commitments from "@/components/Commitments";
import Steps from "@/components/Steps";
import Benefits from "@/components/Benefits";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import GlobalIframe from "@/components/GlobalIframe";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <GlobalIframe />
      <section id="como-funciona" className="scroll-mt-20">
        <Steps />
      </section>
      <section id="diferenciais" className="scroll-mt-20">
        <Commitments />
        <Benefits />
      </section>
      <section id="opinioes" className="scroll-mt-20">
        <Testimonials />
      </section>
      <section id="duvidas" className="scroll-mt-20">
        <FAQ />
      </section>
      <Footer />
    </div>
  );
};

export default Index;
