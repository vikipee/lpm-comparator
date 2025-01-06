import { Trace } from "@/types/Report";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import axios from "axios";

type TraceDetails = {
    event: string;
    covered_a: number;
    covered_b: number;
}[];


export default function TraceDialog({
        selectedTrace,
        setSelectedTrace,
    }: {
        selectedTrace: Trace | null;
        setSelectedTrace: (trace: Trace | null) => void;
    }) {

        const [traceDetails, setTraceDetails] = useState<TraceDetails | null>(null);

        useEffect(() => {
            if (selectedTrace) {
              fetchTraceDetails();
            }
          }, [selectedTrace]);

        const fetchTraceDetails = async () => {
            try {
                const response = await axios.get(`/api/tracecoverage/${selectedTrace?.id}`);
                setTraceDetails(response.data);
            } catch (error) {
              console.error('Error fetching trace details:', error);
            }
        };

        const getEventColor = (covered_a: number, covered_b: number) => {
            if (covered_a > 0 && covered_b > 0) return "hsl(104.78deg 29.78% 55.88%)"
            if (covered_a > 0) return "hsl(var(--chart-2))"
            if (covered_b > 0) return "hsl(var(--chart-3))"
            return "hsl(216 12.2% 83.9%)"
        }

        return (
            <Dialog open={!!selectedTrace} onOpenChange={() => {setSelectedTrace(null);}}>
                <DialogContent className="max-w-[calc(100vw-3rem)] w-full">
                    <DialogHeader>
                        <DialogTitle>{selectedTrace?.trace}</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div className="overflow-x-auto">
          <div className="flex items-center justify-center px-0 py-8 min-w-fit">
            {traceDetails?.map((detail, index) => (
              <div key={index} className="flex items-center">
                <div
                  className= "event-block"
                  style={{
                    backgroundColor: getEventColor(detail.covered_a, detail.covered_b),
                }}
                >
                  {detail.event}
                </div>
                
              </div>
            ))}
          </div>
        </div>
                </DialogContent>
            </Dialog>
        );

};

    