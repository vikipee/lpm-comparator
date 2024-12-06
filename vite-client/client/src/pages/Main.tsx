import { useEffect, useState } from "react"
import StartPage from "./Start"
import UploadPage from "./Upload"
import AnalysisPage from "./Analysis"
import {FileInfo} from "@/types/FileInfo"
import {ReportData} from "@/types/Report"
import axios from "axios"

type Page = "start" | "upload" | "analysis"

export default function Main(){

    const [currentPage, setCurrentPage] = useState<Page>("start")

    const [eventLog, setEventLog] = useState<FileInfo | null>(null);
    const [lpmsLeft, setLpmsLeft] = useState<FileInfo[]>([]);
    const [lpmsRight, setLpmsRight] = useState<FileInfo[]>([]);

    const [report, setReport] = useState<ReportData | null>(null);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        axios.get<ReportData>('/api/report/current').then((rep) => {
            if(rep.data.message){
                console.log(rep.data.message);
                return
            }
            setReport(rep.data);
            setCurrentPage("analysis")
        }).catch((e) => {
            console.log("No report found");
        });
    }


    return(
        <div className="container w-10/12 mx-auto p-4 min-h-screen">
            {currentPage == "start" && <StartPage setCurrentPage={setCurrentPage} setReport={setReport}/>}
            {currentPage == "upload" && <UploadPage setCurrentPage={setCurrentPage} eventLog={eventLog} setEventLog={setEventLog} lpmsLeft={lpmsLeft} setLpmsLeft={setLpmsLeft} lpmsRight={lpmsRight} setLpmsRight={setLpmsRight} setReport={setReport}/>}
            {currentPage == "analysis" && <AnalysisPage report={report} setReport={setReport} setCurrentPage={setCurrentPage} />}
        </div>
    );
}