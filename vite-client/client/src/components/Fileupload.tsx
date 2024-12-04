import { Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle, } from "@/components/ui/card";
import { Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const FileUpload: React.FC = () => {

    interface FileInfo {
        name: string
        size: number
        type: string
        id: string
      }

    const [eventLog, setEventLog] = useState<FileInfo | null>(null);

    const handleFileUpload = (
        event: React.ChangeEvent<HTMLInputElement>,
      ) => {
        const files = event.target.files
        if (files) {
          const fileInfos: FileInfo[] = Array.from(files).map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            id: Math.random().toString(36).substr(2, 9)
          }));
          setEventLog(fileInfos[0]);
        }
      };

    return (
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
                onChange={(e) => handleFileUpload(e)}
              />
            </div>
          )}
        </CardContent>
      </Card>
        </>

    );
};

export default FileUpload