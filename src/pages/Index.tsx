import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
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
      <Steps />
      <Benefits />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
