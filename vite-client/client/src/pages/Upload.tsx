import EventLogUpload from "@/components/EventLogUpload";
import PetriNetUpload from "@/components/PetriNetUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {FileInfo } from "@/types/FileInfo";
import { ReportData } from "@/types/Report";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast"
import { CustomAlertDialog } from "@/components/AlertDialog";


export default function UploadPage({
    setCurrentPage,
    eventLog,
    setEventLog,
    lpmsLeft,
    setLpmsLeft,
    lpmsRight,
    setLpmsRight,
    setReport
  }: {
    setCurrentPage: (page: "start" | "upload" | "analysis") => void;
    eventLog: FileInfo | null;
    setEventLog: (eventLog: FileInfo | null) => void;
    lpmsLeft: FileInfo[];
    setLpmsLeft: (lpmsLeft: FileInfo[]) => void;
    lpmsRight: FileInfo[];
    setLpmsRight: (lpmsRight: FileInfo[]) => void;
    setReport: (reportData: ReportData) => void;
  }){

    const [isLoading, setIsLoading] = useState(false);
    const [statusText, setStatusText] = useState('Uploading files...');

    const {toast} = useToast();

    const handleFileUpload = async () => {
    
        const formData = new FormData();
      
        lpmsLeft.forEach((lpm) => {
          formData.append('pnml_side_a', lpm.file);
        });
      
        lpmsRight.forEach((lpm) => {
          formData.append('pnml_side_b', lpm.file);
        });
      
        if (eventLog) {
          formData.append('xes_file', eventLog.file);
        }
      
        try {
          setIsLoading(true);
          setStatusText('Uploading files...');
      
          await axios.post<ReportData>('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          console.log("Files uploaded successfully");
          setStatusText('Processing files...');
          listenForProgress();
        } catch (error: any) {
          setIsLoading(false);
          console.error(error);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
          })
        }
      };

      const listenForProgress = () => {
        const eventSource = new EventSource('/api/report/compute');
      
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log(data);
          setStatusText(data.message);
      
          if (data.report) {
            eventSource.close();
            setReport(data.report);
            setIsLoading(false);
            setCurrentPage('analysis');
          }
        };

        eventSource.onerror = (event) => {
          console.error(event);
          eventSource.close();
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
          })
        };
      };

    return (
        <>
        {isLoading ? ( 
             <div className="flex flex-col items-center justify-center h-[calc(100vh-2rem)] space-y-4">
             {/* Loading animation */}
             <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
     
             {/* Status text */}
             <p className="mt-4 text-lg text-gray-600">{statusText}</p>
           </div>
     
        ):(
            <>
            <EventLogUpload eventLog={eventLog} setEventLog={setEventLog} />
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <Card className="flex-1">
                <CardContent className="pt-6">
                  <PetriNetUpload side="Left" files={lpmsLeft} setFiles={setLpmsLeft} />
                </CardContent>
              </Card>
              <Card className="flex-1">
                <CardContent className="pt-6">
                <PetriNetUpload side="Right" files={lpmsRight} setFiles={setLpmsRight} />
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-between mt-6">
              <CustomAlertDialog button = {
                <Button size="lg" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                </Button>} 
                title={"Are you sure?"}
                description="If you continue, all uploaded files will be lost."
                onAction={() => {
                  setEventLog(null);
                  setLpmsLeft([]);
                  setLpmsRight([]);
                  setCurrentPage("start");
                }}
              />
              <CustomAlertDialog 
                button={<Button size="lg" disabled={!eventLog || lpmsLeft.length === 0 || lpmsRight.length === 0} >
                    Finish Upload and Analyze
                    </Button>} 
                title={"Do you want to continue?"} 
                description={"The computation takes a while and files cannot be changed without another computation."} 
                onAction={handleFileUpload} 
              />
            </div>
            </>
        )}
        </>
    );
}
