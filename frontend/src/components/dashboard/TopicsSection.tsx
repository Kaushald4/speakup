import { TOPIC_GRID_SKELETON_COUNT, TOPIC_SECTION_COPY } from "@/constants/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Topic } from "@/types/api";

import { TopicCard } from "./TopicCard";

interface TopicsSectionProps {
  categories: string[];
  category: string;
  onCategoryChange: (category: string) => void;
  topics: Topic[];
  loading: boolean;
  startingTopic: string | null;
  voiceUnavailable: boolean;
  onStart: (topic: Topic) => void;
}

export function TopicsSection({
  categories,
  category,
  onCategoryChange,
  topics,
  loading,
  startingTopic,
  voiceUnavailable,
  onStart,
}: TopicsSectionProps) {
  return (
    <section id="topics" className="scroll-mt-20">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <p className="eyebrow">{TOPIC_SECTION_COPY.eyebrow}</p>
            <h2 className="display-lg mt-3 text-ink">{TOPIC_SECTION_COPY.heading}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {TOPIC_SECTION_COPY.description}
            </p>
          </div>
          <Tabs value={category} onValueChange={onCategoryChange}>
            <TabsList className="max-w-full">
              {categories.map((item) => (
                <TabsTrigger key={item} value={item}>
                  {item}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: TOPIC_GRID_SKELETON_COUNT }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-hairline bg-card p-6">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-5 h-5 w-40" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
                <Skeleton className="mt-8 h-9 w-32 rounded-full" />
              </div>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-hairline-strong px-6 py-12 text-center text-[15px] text-muted-foreground">
            {TOPIC_SECTION_COPY.empty}
          </p>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                starting={startingTopic === topic.id}
                disabled={startingTopic === topic.id || voiceUnavailable}
                onStart={onStart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
