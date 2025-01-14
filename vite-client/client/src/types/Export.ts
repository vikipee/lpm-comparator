import { ReportData } from '@/types/Report';

export interface ExportFile {
  report: ReportData;
  lpmset_a: string;
  lpmset_b: string;
  event_log: string;
}
