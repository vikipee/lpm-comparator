import { ReportData } from '@/types/Report';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SimilarityMeasure,
  SimilaritySelection,
} from '@/components/SimilaritySelection';
import { useEffect, useRef, useState } from 'react';
import { getDataForVennDiagram } from '@/computation/similarity';
import { Slider } from '@/components/ui/slider';
import Chart from 'chart.js/auto';
import { EulerDiagramController, ArcSlice } from 'chartjs-chart-venn';

Chart.register(EulerDiagramController, ArcSlice);

export function EulerDiagram({ report }: { report: ReportData }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [similarityMeasure, setSimilarityMeasure] = useState<SimilarityMeasure>(
    'trace_similarity' as SimilarityMeasure,
  );
  const [threshold, setThreshold] = useState(0.9);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    if (chartRef.current) {
      const similarityData = report.similarity?.[similarityMeasure];
      const similarityMatrix =
        typeof similarityData === 'object' ? similarityData.matrix : undefined;

      if (!similarityMatrix) {
        setNoData(true);
        return;
      }

      const { numSetA, numIntersection, numSetB } = getDataForVennDiagram(
        similarityMatrix,
        threshold,
      );

      // Create the chart
      const chart = new Chart(chartRef.current, {
        type: 'euler', // Change this line to 'euler'
        data: {
          labels: ['Set A', 'Set B'],
          datasets: [
            {
              label: 'Euler Diagram',
              data: [
                { sets: ['Set A'], value: numSetA },
                { sets: ['Set B'], value: numSetB },
                { sets: ['Set A', 'Set B'], value: numIntersection },
              ],
              backgroundColor: [
                'hsl(181, 97%, 38%)',
                'hsl(37, 94%, 54%)',
                'hsl(104.78 29.78% 55.88%)',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label(context) {
                  const label = context.label || '';
                  const value = (context.raw as { value: number }).value;
                  return `${label}: ${value}`;
                },
              },
            },
          },
        },
      });

      return () => {
        chart.destroy();
      };
    }
  }, [threshold, similarityMeasure]);

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Euler Diagram</CardTitle>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-6">
            <SimilaritySelection
              similarityMeasure={similarityMeasure}
              setSimilarityMeasure={setSimilarityMeasure}
            />
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500 mb-2">
                Threshold:{threshold.toFixed(2)}
              </span>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[threshold]}
                onValueChange={(value) => setThreshold(value[0])}
                className="w-32"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100vh-8rem)] overflow-hidden">
        {noData ? (
          <div className="text-center h-full flex-col">
            <h3 className="my-auto font-bold">No Data to display</h3>
          </div>
        ) : (
          <canvas ref={chartRef} className="max-h-full max-w-full" />
        )}
      </CardContent>
    </Card>
  );
}
