import { ArrowRight, Clock } from "lucide-react";

import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { Spinner } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Topic } from "@/types/api";

interface TopicCardProps {
  topic: Topic;
  starting: boolean;
  disabled: boolean;
  onStart: (topic: Topic) => void;
}

export function TopicCard({ topic, starting, disabled, onStart }: TopicCardProps) {
  return (
    <Card className="hairline-card-hover flex flex-col border-hairline bg-card py-0 shadow-none">
      <CardHeader className="gap-2.5 px-6 pb-0 pt-6">
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow text-[10px]">{topic.category}</span>
          <DifficultyBadge difficulty={topic.difficulty} />
        </div>
        <CardTitle className="mt-1 text-[20px] font-medium text-ink">{topic.title}</CardTitle>
        <CardDescription className="text-[15px] leading-relaxed">
          {topic.description}
        </CardDescription>
      </CardHeader>
      <div className="flex-1" />
      <CardFooter className="mt-6 justify-between border-t border-hairline px-6 py-4">
        <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Clock className="size-3.5" />
          {topic.duration_minutes} min
        </span>
        <Button
          size="sm"
          onClick={() => onStart(topic)}
          disabled={disabled}
          title={disabled ? "Configure the voice providers first" : undefined}
        >
          {starting && <Spinner className="size-4" />}
          {starting ? "Starting" : "Start practice"}
          {!starting && <ArrowRight className="size-3.5" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
