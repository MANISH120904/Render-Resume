import { CreateNewResumeCard } from "@/components/dashboard/CreateNewResumeCard";
import { CreditBanner } from "@/components/dashboard/CreditBanner";
import { FunnelCharts } from "@/components/dashboard/FunnelCharts";
import { ResumeGrid } from "@/components/dashboard/ResumeGrid";
import { Navbar } from "@/components/layout/Navbar";
import { requireUser } from "@/lib/auth";
import { MOCK_DASHBOARD_DATA } from "@/lib/mock/dashboard";
import { getUserProfile } from "@/lib/profile";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getUserProfile(user.id);
  const displayName =
    profile?.fullName ??
    user.profile?.name ??
    user.email?.split("@")[0] ??
    "User";
  const creditBalance =
    profile?.currentCredits ?? MOCK_DASHBOARD_DATA.creditBalance;

  return (
    <>
      <Navbar
        isAuthenticated
        activePath="dashboard"
        creditBalance={creditBalance}
        userName={displayName}
      />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        <CreditBanner downloadCredits={creditBalance} />
        <CreateNewResumeCard />
        <ResumeGrid resumes={MOCK_DASHBOARD_DATA.resumes} />
        <FunnelCharts />
      </main>
    </>
  );
}
