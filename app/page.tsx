import { Features } from "@/components/homepage/Features";
import { Hero } from "@/components/homepage/Hero";
import { HeroVisual } from "@/components/homepage/HeroVisual";
import { PricingTable } from "@/components/homepage/PricingTable";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <>
      <Navbar isAuthenticated={Boolean(user)} />
      <main className="flex-1 bg-page">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-4 py-10 md:px-8 md:py-12">
          <Hero />
          <HeroVisual />
          <Features />
          <PricingTable />
        </div>
      </main>
      <Footer />
    </>
  );
}
