import type { ReactNode } from "react";
import { ArrowUpRight, Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FEEDBACK_MODAL_COPY,
  FEEDBACK_SCORE_FIELDS,
  FEEDBACK_TABS,
} from "@/constants/feedback";
import type { FeedbackItem } from "@/types/events";

interface FeedbackModalProps {
  item: FeedbackItem;
  pendingCount: number;
  onClose: () => void;
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-2 py-3.5 text-center">
      <div className="font-display text-[24px] font-light leading-none text-ink">{value}</div>
      <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-hairline-strong px-5 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function FeedbackModal({ item, pendingCount, onClose }: FeedbackModalProps) {
  const { feedback } = item;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="eyebrow">{FEEDBACK_MODAL_COPY.eyebrow}</span>
            <span className="text-hairline-strong">/</span>
            <span className="eyebrow text-ink">
              {FEEDBACK_MODAL_COPY.answerPrefix} {item.turnNumber}
            </span>
            {pendingCount > 0 && (
              <Badge variant="muted" className="ml-auto mr-10">
                {pendingCount} {FEEDBACK_MODAL_COPY.moreReadySuffix}
              </Badge>
            )}
          </div>
          <DialogTitle>{FEEDBACK_MODAL_COPY.title}</DialogTitle>
          <DialogDescription>{FEEDBACK_MODAL_COPY.description}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[58vh] overflow-y-auto px-6 py-5">
          <div className="rounded-xl border border-hairline bg-canvas-soft px-5 py-4">
            {item.question && (
              <p className="eyebrow text-[10px] text-muted-foreground">
                {FEEDBACK_MODAL_COPY.questionLabel}
              </p>
            )}
            {item.question && (
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {item.question}
              </p>
            )}
            <p className="mt-3 text-[15px] leading-relaxed text-ink">
              “{item.transcript}”
            </p>
          </div>

          <div className="mt-4 grid grid-cols-5 divide-x divide-hairline rounded-xl border border-hairline">
            {FEEDBACK_SCORE_FIELDS.map((field) => (
              <ScoreCell key={field.key} label={field.label} value={feedback[field.key]} />
            ))}
          </div>

          <Tabs defaultValue="grammar" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="grammar">
                {FEEDBACK_TABS.grammar}
                {feedback.corrections.length > 0 && (
                  <span className="ml-1.5 text-[11px] text-muted-foreground">
                    {feedback.corrections.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="expression">{FEEDBACK_TABS.expression}</TabsTrigger>
              <TabsTrigger value="coaching">{FEEDBACK_TABS.coaching}</TabsTrigger>
            </TabsList>

            <TabsContent value="grammar" className="space-y-3">
              {feedback.corrections.length === 0 ? (
                <EmptyNote>{FEEDBACK_MODAL_COPY.grammarEmpty}</EmptyNote>
              ) : (
                feedback.corrections.map((correction, index) => (
                  <div
                    key={`${correction.original}-${index}`}
                    className="rounded-xl border border-hairline px-5 py-4"
                  >
                    <p className="text-[14px] leading-relaxed text-muted-foreground line-through decoration-muted-soft">
                      {correction.original}
                    </p>
                    <p className="mt-2 flex gap-2 text-[15px] font-medium leading-relaxed text-ink">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400" strokeWidth={2} />
                      {correction.corrected}
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                      {correction.explanation}
                    </p>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="expression" className="space-y-3">
              {feedback.better_expressions.length === 0 ? (
                <EmptyNote>{FEEDBACK_MODAL_COPY.expressionEmpty}</EmptyNote>
              ) : (
                feedback.better_expressions.map((expression, index) => (
                  <div
                    key={`${expression.original}-${index}`}
                    className="rounded-xl border border-hairline px-5 py-4"
                  >
                    <p className="eyebrow text-[10px] text-muted-foreground">
                      {FEEDBACK_MODAL_COPY.youSaid}
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                      {expression.original}
                    </p>
                    <p className="mt-3 flex gap-2 text-[15px] leading-relaxed text-ink">
                      <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-ink/50" strokeWidth={1.8} />
                      {expression.suggestion}
                    </p>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="coaching" className="space-y-6">
              <div>
                <p className="eyebrow mb-2.5">{FEEDBACK_MODAL_COPY.whatWorked}</p>
                {feedback.positive_feedback.length === 0 ? (
                  <EmptyNote>{FEEDBACK_MODAL_COPY.strengthsEmpty}</EmptyNote>
                ) : (
                  <ul className="space-y-2.5">
                    {feedback.positive_feedback.map((text, index) => (
                      <li key={index} className="flex gap-2.5 text-[14px] leading-relaxed text-body">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400" strokeWidth={2} />
                        {text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="eyebrow mb-2.5">{FEEDBACK_MODAL_COPY.tryNextTime}</p>
                {feedback.improvement_tips.length === 0 ? (
                  <EmptyNote>{FEEDBACK_MODAL_COPY.coachingEmpty}</EmptyNote>
                ) : (
                  <ul className="space-y-2.5">
                    {feedback.improvement_tips.map((text, index) => (
                      <li key={index} className="flex gap-2.5 text-[14px] leading-relaxed text-body">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-ink/40" />
                        {text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>{FEEDBACK_MODAL_COPY.continue}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
