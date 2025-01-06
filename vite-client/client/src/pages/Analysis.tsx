import { CustomAlertDialog } from "@/components/AlertDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExportFile } from "@/types/Export";
import { FileInfo } from "@/types/FileInfo";
import { ReportData } from "@/types/Report";
import axios from "axios";
import { ChevronLeft, Download } from "lucide-react";
import { useState } from "react";
import AnalysisOverview from "@/pages/analysis/DashboardCards"; 
import LpmList from "@/pages/analysis/LpmList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AnalysisConformance from "@/pages/analysis/Conformance";
import Similarity from "./analysis/Similarity";
import CoverageTable from "@/components/CoverageTable";


export type AnalysisPage = "overview" | "list"| "conformance" | "similarity" | "coverage" | "evaluation" | "setRelation";

export default function AnalysisPage({
    report,
    setReport,
    setEventLog,
    setLpmsLeft,
    setLpmsRight,
    setCurrentPage,
  }: {
    report: ReportData | null;
    setReport: (reportData: ReportData | null) => void;
    setEventLog: (eventLog: FileInfo | null) => void;
    setLpmsLeft: (lpmsLeft: FileInfo[]) => void;
    setLpmsRight: (lpmsRight: FileInfo[]) => void;
    setCurrentPage: (page: "start" | "upload" | "analysis") => void;
  }){
    const [currentAnalysisPage, setCurrentAnalysisPage] = useState("overview");

    const [isExporting, setIsExporting] = useState(false)

    const goBack = () => {
      setCurrentAnalysisPage("overview");
    }

    const exportResults = async () => {
      setIsExporting(true)
      try{
        const exportReport = await axios.get<ExportFile>('/api/export');
        const data = exportReport.data;
        //Let the user download the file
        const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a")
        a.href = url
        a.download = "analysis_results.json"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      catch(error){
        console.error("Failed to export results", error);
      }
      finally{
        setIsExporting(false)
      }
    }

    const resetSession = async (nextPage: "start" | "upload") => {
        try {
          await axios.delete('/api/report');
        } catch (error) {
          console.error("Failed to reset session", error);
        }

        if (nextPage === "start") {
          setEventLog(null);
          setLpmsLeft([]);
          setLpmsRight([]);
          setReport(null);
        }
        setCurrentPage(nextPage);
    }

    return (
      <>
        {report ? (
          currentAnalysisPage === "overview" ? (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">Analysis Results</h1>
            <div className="space-y-6">
            <AnalysisOverview report={report} setAnalysisPage={setCurrentAnalysisPage}/> 
            </div>
          <div className="flex justify-center space-x-4 mt-6">
            <CustomAlertDialog button={
              <Button size="lg">Start new analysis</Button>}
              title={"Are you sure you want to start again?"}
              description={"This will clear all computed results and start the process from the beginning."}
              onAction={() => resetSession("start")}
            />
            <Button onClick={exportResults} size="lg">
              <Download className="mr-2 h-4 w-4" /> {isExporting ? ("Exporting...") : ("Export results")}
            </Button>
            <CustomAlertDialog button={
              <Button size="lg">Edit upload</Button>}
              title={"Are you sure you want to edit the uploaded files?"}
              description={"This will clear all computed results."}
              onAction={() => resetSession("upload")}
            />
          </div>
          </>
          ) : (
            <div className="container mx-auto p-4 pt-12 md:pt-4">
      <div className="flex flex-col md:flex-row items-center">
        <Button variant="ghost" onClick={goBack} className="mb-4 md:mb-0 md:mr-4 md:absolute md:top-4 md:left-4 hover:bg-gray-200">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Tabs value={currentAnalysisPage} onValueChange={setCurrentAnalysisPage} className="flex-grow w-full md:w-auto">
          <div className="flex justify-center">
            <TabsList className="w-full bg-gray-200 md:w-auto">
              <TabsTrigger value="list">LPM List</TabsTrigger>
              <TabsTrigger value="conformance">Conformance</TabsTrigger>
              <TabsTrigger value="similarity">Similarity</TabsTrigger>
              <TabsTrigger value="coverage">Coverage</TabsTrigger>
              <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
              <TabsTrigger value="setRelation">Set Relationship</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="list" className="mt-4">
            <LpmList report={report} />
          </TabsContent>
          <TabsContent value="conformance">
            <AnalysisConformance report={report} />
          </TabsContent>
          <TabsContent value="similarity">
            <Similarity report={report} />
          </TabsContent>
          <TabsContent value="coverage"><CoverageTable report={report}/></TabsContent>
          <TabsContent value="evaluation">Evaluation content</TabsContent>
          <TabsContent value="setRelation">Set Relationship content</TabsContent>
        </Tabs>
      </div>
    </div>
          
        )
        ) : (
          <Card>
            <CardContent className="p-6">
              <p>No report available</p>
            </CardContent>
          </Card>
        )}
        {/*
          currentAnalysisPage === "list" ? (
          <LpmList report={report} setAnalysisPage={setCurrentAnalysisPage}/> ) :
          currentAnalysisPage === "conformance" ? (
          <AnalysisConformance report={report} setAnalysisPage={setCurrentAnalysisPage}/> ) :
          currentAnalysisPage === "similarity" ? (
          <AnalysisSimilarity report={report} setAnalysisPage={setCurrentAnalysisPage}/> ) :
          currentAnalysisPage === "coverage" ? (
          <AnalysisCoverage report={report} setAnalysisPage={setCurrentAnalysisPage}/> ) :
          currentAnalysisPage === "evaluation" ? (
          <AnalysisEvaluation report={report} setAnalysisPage={setCurrentAnalysisPage}/> ) :
          currentAnalysisPage === "setRelation" ? (
          <AnalysisSetRelation report={report} setAnalysisPage={setCurrentAnalysisPage}/> ) : (
          <Card>
            <CardContent className="p-6">
              <p>No report available</p>
            </CardContent>
          </Card>)*/}
      
        </>
        
    );
}