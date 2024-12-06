import { Button } from "@/components/ui/button";
import { ReportData } from "@/types/Report";
import axios from "axios";
import { ArrowRight, FileUp } from "lucide-react";

export default function StartPage({
  setCurrentPage,
  setReport
}: {
  setCurrentPage: (page: "start" | "upload" | "analysis") => void;
  setReport: (reportData: ReportData) => void;
}) {

  const handleImportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    
    try {
      const response = await axios.post<ReportData>('/api/import', file, {
        headers: { 'Content-Type': 'application/json' },
      });
      setReport(response.data);
      setCurrentPage("analysis");
      
    } catch (error) {
      console.error('Failed to upload file', error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-2rem)] space-y-4">
      <Button onClick={() => setCurrentPage("upload")} size="lg" className="text-lg">
        Start New Analysis <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
      <Button onClick={() => document.getElementById("importInput")?.click()} size="lg" className="text-lg">
        Upload Existing Report <FileUp className="ml-2 h-5 w-5" />
      </Button>
      <input
          id="importInput"
          type="file"
          accept = ".json"
          className="hidden"
          onChange={handleImportUpload}
      />
      
    </div>
  );
}