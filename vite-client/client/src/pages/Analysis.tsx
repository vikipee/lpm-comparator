import { CustomAlertDialog } from "@/components/AlertDialog";
import { Button } from "@/components/ui/button";
import { ReportData } from "@/types/FileInfo";
import axios from "axios";
import { Download } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";


export default function AnalysisPage({
    report,
    setReport,
    setCurrentPage,
  }: {
    report: ReportData | null;
    setReport: (reportData: ReportData) => void;
    setCurrentPage: (page: "start" | "upload" | "analysis") => void;
  }){

    const exportResults = () => {
        console.log("Exporting results");
    }

    const resetSession = async (nextPage: "start" | "upload") => {
        try {
          await axios.delete('/api/report');
        } catch (error) {
          console.error("Failed to reset session", error);
        }
        setCurrentPage(nextPage);
    }

    return (
        <>  
          <h1 className="text-3xl font-bold">Analysis Results</h1>
          <div className="flex flex-col justify-center space-y-10 h-[calc(100vh-8rem)]">
            {report ? (
              //Display report (ReportData type)
              report.similarity && (
                <>
                  <h3>Similarity Measures</h3>
                  <p>Trace Sim (Leven): {report.similarity.trace_similarity}</p>
                  <p>Eventually Follows Sim: {report.similarity.eventually_follows_similarity}</p>
                  <p>Exact Trace Sim: {report.similarity.trace_similarity_perfect}</p>
                  {report.similarity.a_subset_b && <p>Set A is a subset of Set B</p>}
                </>
              )
            ) : (
              <p>No report available</p>
            )
            }
          </div>
          <div className="flex justify-center space-x-4">
            <CustomAlertDialog button={
              <Button size="lg">Start new analysis</Button>}
              title={"Are you sure you want to start again?"}
              description={"This will clear all computed results and start the process from the beginning."}
              onAction={() => resetSession("start")}
            />
            <Button onClick={exportResults} size="lg">
              <Download className="mr-2 h-4 w-4" /> Export Results
            </Button>
            <CustomAlertDialog button={
              <Button size="lg">Edit upload</Button>}
              title={"Are you sure you want to edit the uploaded files?"}
              description={"This will clear all computed results."}
              onAction={() => resetSession("upload")}
            />
          </div>
        </>
        
    );
}