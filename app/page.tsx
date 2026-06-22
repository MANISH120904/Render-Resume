import { Features } from "@/components/homepage/Features";
import { Hero } from "@/components/homepage/Hero";
import { HeroVisual } from "@/components/homepage/HeroVisual";
import { PricingTable } from "@/components/homepage/PricingTable";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getCurrentUser } from "@/lib/auth";
import { MOCK_DASHBOARD_DATA } from "@/lib/mock/dashboard";
import { getUserProfile } from "@/lib/profile";

export default async function HomePage() {
  const user = await getCurrentUser();
  const profile = user ? await getUserProfile(user.id) : null;
  const displayName =
    profile?.fullName ??
    user?.profile?.name ??
    user?.email?.split("@")[0] ??
    "User";
  const creditBalance =
    profile?.currentCredits ?? MOCK_DASHBOARD_DATA.creditBalance;

  return (
    <>
      <Navbar
        isAuthenticated={Boolean(user)}
        creditBalance={user ? creditBalance : undefined}
        userName={displayName}
      />
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
