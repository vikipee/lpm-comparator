import { ReportData } from '@/types/Report';
import { ConformanceCard } from '@/pages/analysis/DashboardCards';

export default function AnalysisConformance({
  report,
}: {
  report: ReportData;
}) {
  return (
    <div className="w-3/5 h-[calc(100vh-8rem)] mx-auto mt-6">
      <ConformanceCard report={report} setAnalysisPage={() => {}} />
    </div>
  );
}
