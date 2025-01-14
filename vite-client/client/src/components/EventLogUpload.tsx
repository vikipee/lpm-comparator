import { Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileInfo } from '@/types/FileInfo';
import { ChangeEvent } from 'react';

export default function EventLogUpload({
  eventLog,
  setEventLog,
}: {
  eventLog: FileInfo | null;
  setEventLog: (eventLog: FileInfo | null) => void;
}) {
  const handleEventLogChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file: FileInfo = {
        name: e.target.files[0].name,
        size: e.target.files[0].size,
        type: e.target.files[0].type,
        id: Math.random().toString(36).substr(2, 9),
        file: e.target.files[0],
      };
      setEventLog(file);
    }
  };

  return (
    <Card className="mb-4" style={{ borderTop: `3px solid hsl(240 5% 64.9%)` }}>
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
            <Button
              className="w-full"
              onClick={() => document.getElementById('eventLogInput')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Event Log
            </Button>
            <input
              id="eventLogInput"
              type="file"
              accept=".xes"
              className="hidden"
              onChange={handleEventLogChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
