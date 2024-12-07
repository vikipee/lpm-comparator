import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ReportData } from "@/types/Report";
import axios from "axios";
import { ArrowRight, FileUp } from "lucide-react";
import { useState } from "react";

export default function StartPage({
  setCurrentPage,
  setReport
}: {
  setCurrentPage: (page: "start" | "upload" | "analysis") => void;
  setReport: (reportData: ReportData) => void;
}) {

  const [isLoading, setIsLoading] = useState(false);

  const {toast} = useToast();

  const handleImportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.post<ReportData>('/api/import', file, {
        headers: { 'Content-Type': 'application/json' },
      });
      setReport(response.data);
      setIsLoading(false);
      setCurrentPage("analysis");
      
    } catch (error) {
      setIsLoading(false);
      toast({
        title: 'Failed to upload file',
        description: 'Please try again later.',
        variant: 'destructive'
      });
      console.error('Failed to upload file', error);
    }
  }

  return (
    <>
      {isLoading ? ( 
             <div className="flex flex-col items-center justify-center h-[calc(100vh-2rem)] space-y-4">
             {/* Loading animation */}
             <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
     
             {/* Status text */}
             <p className="mt-4 text-lg text-gray-600">Uploading report...</p>
           </div>
     
        ):(
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
        )}
    </>
  );
}