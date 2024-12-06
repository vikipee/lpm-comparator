import { useState } from "react"
import StartPage from "./Start"
import UploadPage from "./Upload"
import AnalysisPage from "./Analysis"
import {FileInfo, ReportData} from "@/types/FileInfo"

type Page = "start" | "upload" | "analysis"

export default function Main(){

    const [currentPage, setCurrentPage] = useState<Page>("start")

    const [eventLog, setEventLog] = useState<FileInfo | null>(null);
    const [lpmsLeft, setLpmsLeft] = useState<FileInfo[]>([]);
    const [lpmsRight, setLpmsRight] = useState<FileInfo[]>([]);

    const [report, setReport] = useState<ReportData | null>(null);


    return(
        <div className="container w-10/12 mx-auto p-4 min-h-screen">
            {currentPage == "start" && <StartPage setCurrentPage={setCurrentPage} />}
            {currentPage == "upload" && <UploadPage setCurrentPage={setCurrentPage} eventLog={eventLog} setEventLog={setEventLog} lpmsLeft={lpmsLeft} setLpmsLeft={setLpmsLeft} lpmsRight={lpmsRight} setLpmsRight={setLpmsRight} setReport={setReport}/>}
            {currentPage == "analysis" && <AnalysisPage report={report} setReport={setReport} setCurrentPage={setCurrentPage} />}
        </div>
    );
}