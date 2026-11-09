import { Wordmark } from "@/components/brand/Wordmark";
import { Skeleton } from "@/components/ui/skeleton";

export function ReportLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-16 max-w-[1000px] items-center px-5 sm:px-6">
          <Wordmark />
        </div>
      </header>
      <main className="mx-auto max-w-[1000px] px-5 py-12 sm:px-6">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-4 h-12 w-2/3" />
        <Skeleton className="mt-4 h-4 w-1/2" />
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
