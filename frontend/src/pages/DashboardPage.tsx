import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { HowItWorksSection } from "@/components/dashboard/HowItWorksSection";
import { ProviderAlerts } from "@/components/dashboard/ProviderAlerts";
import { TopicsSection } from "@/components/dashboard/TopicsSection";
import { useDashboard } from "@/hooks/dashboard/useDashboard";

export function DashboardPage() {
  const dashboard = useDashboard();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <HeroSection />
      <ProviderAlerts health={dashboard.health} error={dashboard.error} />
      <HowItWorksSection />
      <TopicsSection
        categories={dashboard.categories}
        category={dashboard.category}
        onCategoryChange={dashboard.setCategory}
        topics={dashboard.visibleTopics}
        loading={dashboard.loading}
        startingTopic={dashboard.startingTopic}
        voiceUnavailable={dashboard.voiceUnavailable}
        onStart={(topic) => void dashboard.startPractice(topic)}
      />
      <DashboardFooter />
    </div>
  );
}
