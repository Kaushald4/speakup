import { REPORT_SCORE_BANDS } from "@/constants/report";

export function summaryForScore(score: number): string {
  return (
    REPORT_SCORE_BANDS.find((band) => score >= band.min)?.message ??
    REPORT_SCORE_BANDS[REPORT_SCORE_BANDS.length - 1].message
  );
}
