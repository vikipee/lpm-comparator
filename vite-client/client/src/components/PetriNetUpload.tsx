import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileInfo } from '@/types/FileInfo';
import { Upload, FileText, X } from 'lucide-react';
import { ChangeEvent } from 'react';

export default function PetriNetUpload({
  side,
  files,
  color,
  setFiles,
}: {
  side: 'Left' | 'Right';
  files: FileInfo[];
  color: string;
  setFiles: (files: FileInfo[]) => void;
}) {
  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileInfos: FileInfo[] = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        id: Math.random().toString(36).substr(2, 9),
        file: file,
      }));
      setFiles([...files, ...fileInfos]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{side === "Left" ? "LPM Set A": "LPM Set B"}</h3>
      </div>
      <Button
        className="w-full"
        onClick={() => document.getElementById(`${side}FileInput`)?.click()}
      >
        <Upload className="mr-2 h-4 w-4" /> Upload Files
      </Button>
      <input
        id={`${side}FileInput`}
        type="file"
        accept=".pnml, .apnml"
        multiple
        className="hidden"
        onChange={handleUpload}
      />
      <ScrollArea className="h-[calc(100vh-400px)]">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between px-2 py-1 my-2 hover:bg-gray-100 rounded"
            style={{ borderLeft: `2px solid ${color} ` }}
          >
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              {file.name}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeFile(file.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
