import type { ReactNode } from "react";

import { APP_NAME } from "@/constants/app";

export function PageNotice({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">{APP_NAME}</p>
      <h1 className="display-md mt-4 text-ink">{title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{copy}</p>
      {children && <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
