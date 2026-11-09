import { Link, useParams } from "react-router-dom";

import { PageNotice } from "@/components/common/PageNotice";
import { Spinner } from "@/components/common/Spinner";
import { PracticeRoom } from "@/components/practice/PracticeRoom";
import { Button } from "@/components/ui/button";
import { PRACTICE_COPY } from "@/constants/practice";
import { usePracticeLoader } from "@/hooks/practice/usePracticeLoader";

export function PracticePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { token, session, loading, error } = usePracticeLoader(sessionId);

  if (!sessionId || !token) {
    return (
      <PageNotice title={PRACTICE_COPY.expiredTitle} copy={PRACTICE_COPY.expiredCopy}>
        <Button asChild>
          <Link to="/">{PRACTICE_COPY.backToTopics}</Link>
        </Button>
      </PageNotice>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-[15px] text-muted-foreground">
        <Spinner className="size-5" />
        {PRACTICE_COPY.preparing}
      </div>
    );
  }

  if (error || !session) {
    return (
      <PageNotice
        title={PRACTICE_COPY.unavailableTitle}
        copy={error ?? PRACTICE_COPY.unavailableCopy}
      >
        <Button asChild>
          <Link to="/">{PRACTICE_COPY.backToTopics}</Link>
        </Button>
      </PageNotice>
    );
  }

  return <PracticeRoom initialSession={session} token={token} />;
}
