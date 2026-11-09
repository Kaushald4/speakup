import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Spinner } from "./components/common/Spinner";

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const PracticePage = lazy(() =>
  import("./pages/PracticePage").then((module) => ({ default: module.PracticePage })),
);
const ReportPage = lazy(() =>
  import("./pages/ReportPage").then((module) => ({ default: module.ReportPage })),
);

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-3 text-[15px] text-muted-foreground">
      <Spinner className="size-5" />
      Loading
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/practice/:sessionId" element={<PracticePage />} />
          <Route path="/report/:sessionId" element={<ReportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
