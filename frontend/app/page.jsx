import Header from "../components/Header";
import Hero from "../components/Hero";
import BestSellers from "../components/BestSellers";
import MenuCategories from "../components/MenuCategories";
import About from "../components/About";
import DeliveryBanner from "../components/DeliveryBanner";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function Home(){
  return (
    <>
      <Header/>
      <main>
        <Hero />
        <BestSellers />
        <MenuCategories />
        <About />
        <Contact />
        <DeliveryBanner />
      </main>
      <Footer />
    </>
  );
}