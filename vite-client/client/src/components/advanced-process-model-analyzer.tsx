import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, FileText, X, AlertTriangle, Check, ArrowRight, BarChart as BarChartIcon, FileUp, Download, ArrowLeft } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface FileInfo {
  name: string
  size: number
  type: string
  id: string
}

interface ConformanceMeasure {
  fitness: number
  precision: number
  support: number
  coverage: number
}

interface ConformanceMeasures {
  [key: string]: ConformanceMeasure;
}

interface SimilarityMeasures {
  structuralSimilarity: number
  behavioralSimilarity: number
  overallSimilarity: number
}

interface DetailedSimilarityMeasures {
  [leftModelName: string]: {
    [rightModelName: string]: SimilarityMeasures
  }
}

type UploadStage = "initial" | "uploading" | "analysis"

export default function Component() {
  const [stage, setStage] = useState<UploadStage>("initial")
  const [leftFiles, setLeftFiles] = useState<FileInfo[]>([])
  const [rightFiles, setRightFiles] = useState<FileInfo[]>([])
  const [eventLog, setEventLog] = useState<FileInfo | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null)
  const [leftConformanceMeasures, setLeftConformanceMeasures] = useState<Record<string, ConformanceMeasure>>({})
  const [rightConformanceMeasures, setRightConformanceMeasures] = useState<Record<string, ConformanceMeasure>>({})
  const [similarityMeasures, setSimilarityMeasures] = useState<SimilarityMeasures | null>(null)
  const [detailedSimilarityMeasures, setDetailedSimilarityMeasures] = useState<DetailedSimilarityMeasures | null>(null)
  const [overallComparison, setOverallComparison] = useState<string | null>(null)
  const [showDetailedLeft, setShowDetailedLeft] = useState(false)
  const [showDetailedRight, setShowDetailedRight] = useState(false)
  const [showDetailedSimilarity, setShowDetailedSimilarity] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    side: "left" | "right" | "eventLog" | "report"
  ) => {
    const files = event.target.files
    if (files) {
      const fileInfos: FileInfo[] = Array.from(files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        id: Math.random().toString(36).substr(2, 9)
      }))
      if (side === "left") {
        setLeftFiles((prev) => [...prev, ...fileInfos])
      } else if (side === "right") {
        setRightFiles((prev) => [...prev, ...fileInfos])
      } else if (side === "eventLog") {
        setEventLog(fileInfos[0])
      } else if (side === "report") {
        // Simulating report parsing
        setStage("analysis")
      }
    }
  }

  const removeFile = (fileId: string, side: "left" | "right" | "eventLog") => {
    if (side === "left") {
      setLeftFiles((prev) => prev.filter((file) => file.id !== fileId))
    } else if (side === "right") {
      setRightFiles((prev) => prev.filter((file) => file.id !== fileId))
    } else {
      setEventLog(null)
    }
    if (selectedFile?.id === fileId) {
      setSelectedFile(null)
    }
  }

  const computeConformanceMeasures = async (side: "left" | "right") => {
    const files = side === "left" ? leftFiles : rightFiles
    const mockResponse: Record<string, ConformanceMeasure> = {}
    files.forEach((file) => {
      mockResponse[file.name] = {
        fitness: Math.random(),
        precision: Math.random(),
        support: Math.random(),
        coverage: Math.random(),
      }
    })
    if (side === "left") {
      setLeftConformanceMeasures(mockResponse)
    } else {
      setRightConformanceMeasures(mockResponse)
    }
  }

  const computeSimilarities = () => {
    setSimilarityMeasures({
      structuralSimilarity: Math.random(),
      behavioralSimilarity: Math.random(),
      overallSimilarity: Math.random(),
    })

    const detailedMock: DetailedSimilarityMeasures = {}
    leftFiles.forEach(leftFile => {
      detailedMock[leftFile.name] = {}
      rightFiles.forEach(rightFile => {
        detailedMock[leftFile.name][rightFile.name] = {
          structuralSimilarity: Math.random(),
          behavioralSimilarity: Math.random(),
          overallSimilarity: Math.random(),
        }
      })
    })
    setDetailedSimilarityMeasures(detailedMock)
  }

  const finishUpload = () => {
    computeConformanceMeasures("left")
    computeConformanceMeasures("right")
    computeSimilarities()
    setOverallComparison(Math.random() > 0.5 ? "Left set is better" : "Right set is better")
    setStage("analysis")
  }

  const startNewAnalysis = () => {
    setLeftFiles([])
    setRightFiles([])
    setEventLog(null)
    setLeftConformanceMeasures({})
    setRightConformanceMeasures({})
    setSimilarityMeasures(null)
    setDetailedSimilarityMeasures(null)
    setOverallComparison(null)
    setStage("uploading")
  }

  const exportResults = () => {
    const results = {
      leftConformanceMeasures,
      rightConformanceMeasures,
      similarityMeasures,
      detailedSimilarityMeasures,
      overallComparison
    }
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "analysis_results.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderConformanceChart = (measures: ConformanceMeasure) => {
    const data = [
      { name: 'Fitness', value: measures.fitness },
      { name: 'Precision', value: measures.precision },
      { name: 'Support', value: measures.support },
      { name: 'Coverage', value: measures.coverage },
    ]

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderSimilarityChart = () => {
    if (!similarityMeasures) return null

    const data = [
      { subject: 'Structural', A: similarityMeasures.structuralSimilarity, fullMark: 1 },
      { subject: 'Behavioral', A: similarityMeasures.behavioralSimilarity, fullMark: 1 },
      { subject: 'Overall', A: similarityMeasures.overallSimilarity, fullMark: 1 },
    ]

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 1]} />
          <Radar name="Similarity" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    )
  }

  const renderSideContent = (side: "left" | "right") => {
    const files = side === "left" ? leftFiles : rightFiles

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{side === "left" ? "Left" : "Right"} Models</h3>
        </div>
        <Button className="w-full" onClick={() => document.getElementById(`${side}FileInput`)?.click()}>
          <Upload className="mr-2 h-4 w-4" /> Upload Files
        </Button>
        <input
          id={`${side}FileInput`}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e, side)}
        />
        <ScrollArea className="h-[calc(100vh-400px)]">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setSelectedFile(file)}
              >
                <FileText className="mr-2 h-4 w-4" />
                {file.name}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => removeFile(file.id, side)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </ScrollArea>
      </div>
    )
  }

  const renderInitialStage = () => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-2rem)] space-y-4">
      <Button onClick={() => setStage("uploading")} size="lg" className="text-lg">
        Start New Analysis <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
      <Button onClick={() => fileInputRef.current?.click()} size="lg" className="text-lg">
        Upload Existing Report <FileUp className="ml-2 h-5 w-5" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "report")}
      />
    </div>
  )

  const renderUploadingStage = () => (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          {eventLog ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Event log uploaded: {eventLog.name}</span>
              </div>
              <Button variant="outline" onClick={() => setEventLog(null)}>
                Change Event Log
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button className="w-full" onClick={() => document.getElementById("eventLogInput")?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload Event Log
              </Button>
              <input
                id="eventLogInput"
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "eventLog")}
              />
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
        <Card className="flex-1">
          <CardContent className="pt-6">
            {renderSideContent("left")}
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="pt-6">
            {renderSideContent("right")}
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between mt-6">
        <Button onClick={() => setStage("initial")} size="lg" variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button onClick={finishUpload} size="lg" disabled={!eventLog || leftFiles.length === 0 || rightFiles.length === 0}>
          Finish Upload and Analyze
        </Button>
      </div>
    </>
  )

  const renderAnalysisStage = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Overall Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-semibold">{overallComparison}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Similarity Measures</CardTitle>
        </CardHeader>
        <CardContent>
          {renderSimilarityChart()}
          <Button onClick={() => setShowDetailedSimilarity(true)} className="mt-4">
            View Detailed Similarity Measures
          </Button>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Left Models Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Number of models: {leftFiles.length}</p>
            <p>Average fitness: {Object.values(leftConformanceMeasures).reduce((sum, m) => sum + m.fitness, 0) / leftFiles.length}</p>
            <Button onClick={() => setShowDetailedLeft(true)} className="mt-4">
              <BarChartIcon className="mr-2 h-4 w-4" /> View Detailed Results
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Right Models Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Number of models: {rightFiles.length}</p>
            <p>Average fitness: {Object.values(rightConformanceMeasures).reduce((sum, m) => sum + m.fitness, 0) / rightFiles.length}</p>
            <Button onClick={() => setShowDetailedRight(true)} className="mt-4">
              <BarChartIcon className="mr-2 h-4 w-4" /> View Detailed Results
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-center space-x-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="lg">Start New Analysis</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will clear all current data and start a new analysis. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={startNewAnalysis}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button onClick={() => setStage("uploading")} size="lg">Edit Upload</Button>
        <Button onClick={exportResults} size="lg">
          <Download className="mr-2 h-4 w-4" /> Export Results
        </Button>
      </div>
    </div>
  )

  const renderDetailedResults = (side: "left" | "right") => {
    const measures = side === "left" ? leftConformanceMeasures : rightConformanceMeasures
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto relative">
          <Button
            className="absolute top-2 right-2"
            variant="ghost"
            size="icon"
            onClick={() => side === "left" ? setShowDetailedLeft(false) : setShowDetailedRight(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardHeader>
            <CardTitle>{side === "left" ? "Left" : "Right"} Models Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(90vh-8rem)]">
              {Object.entries(measures).map(([fileName, measure]) => (
                <div key={fileName} className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">{fileName}</h3>
                  {renderConformanceChart(measure)}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderDetailedSimilarityMeasures = () => {
    if (!detailedSimilarityMeasures) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto relative">
          <Button
            className="absolute top-2 right-2"
            variant="ghost"
            size="icon"
            onClick={() => setShowDetailedSimilarity(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardHeader>
            <CardTitle>Detailed Similarity Measures</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(90vh-8rem)]">
              {Object.entries(detailedSimilarityMeasures).map(([leftModel, rightModels]) => (
                <div key={leftModel} className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">{leftModel}</h3>
                  {Object.entries(rightModels).map(([rightModel, measures]) => (
                    <div key={rightModel} className="ml-4 mb-4">
                      <h4 className="font-medium mb-2">{rightModel}</h4>
                      <p>Structural Similarity: {measures.structuralSimilarity.toFixed(2)}</p>
                      <p>Behavioral Similarity: {measures.behavioralSimilarity.toFixed(2)}</p>
                      <p>Overall Similarity: {measures.overallSimilarity.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedFile && !(event.target as Element).closest('.card')) {
        setSelectedFile(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedFile])

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-100">
      {stage === "initial" && renderInitialStage()}
      {stage === "uploading" && renderUploadingStage()}
      {stage === "analysis" && renderAnalysisStage()}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>File Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Name:</strong> {selectedFile.name}</p>
              <p><strong>Size:</strong> {selectedFile.size} bytes</p>
              <p><strong>Type:</strong> {selectedFile.type}</p>
              <Button className="mt-4" onClick={() => setSelectedFile(null)}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}
      {showDetailedLeft && renderDetailedResults("left")}
      {showDetailedRight && renderDetailedResults("right")}
      {showDetailedSimilarity && renderDetailedSimilarityMeasures()}
    </div>
  )
}