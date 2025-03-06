import { ReportData } from '@/types/Report';
import { Card, CardTitle, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AnalysisPage } from '@/pages/Analysis';
import {
  SimilarityMeasure,
  SimilaritySelection,
} from '@/components/SimilaritySelection';
import { aggregate, aggregationMethod } from '@/computation/aggregation';
import { EulerDiagram } from '@/components/EulerDiagram';
import { Slider } from '@/components/ui/slider';

export const ConformanceCard = ({
  report,
  setAnalysisPage,
  isOverview = true,
}: {
  report: ReportData;
  setAnalysisPage: (page: AnalysisPage) => void;
  isOverview?: boolean;
}) => {
  const [aggregationMethod, setAggregationMethod] = useState<aggregationMethod>(
    'weightedHarmonicMean',
  );

  const fitnessVals_A = report.lpms_a.map((lpm) => lpm.fitness);
  const fitnessVals_B = report.lpms_b.map((lpm) => lpm.fitness);

  const precisionVals_A = report.lpms_a.map((lpm) => lpm.precision);
  const precisionVals_B = report.lpms_b.map((lpm) => lpm.precision);

  const coverageVals_A = report.lpms_a.map((lpm) => lpm.coverage);
  const coverageVals_B = report.lpms_b.map((lpm) => lpm.coverage);

  const chartData = [
    {
      measure: 'Fitness',
      setA: aggregate(aggregationMethod, fitnessVals_A, coverageVals_A),
      setB: aggregate(aggregationMethod, fitnessVals_B, coverageVals_B),
    },
    {
      measure: 'Precision',
      setA: aggregate(aggregationMethod, precisionVals_A, coverageVals_A),
      setB: aggregate(aggregationMethod, precisionVals_B, coverageVals_B),
    },
  ];

  const chartConfig = {
    setA: {
      label: 'Set A',
      color: 'hsl(var(--chart-2))',
    },
    setB: {
      label: 'Set B',
      color: 'hsl(var(--chart-3))',
    },
  } satisfies ChartConfig;

  return (
    <Card className="md:row-span-2 flex flex-col overflow-auto">
      <CardHeader>
        <CardTitle>
          <button
            onClick={() => setAnalysisPage('conformance')}
            className="text-lg font-semibold cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Aggregated Conformance
          </button>
        </CardTitle>
        {!isOverview ? (
        <Select
          onValueChange={(v) => setAggregationMethod(v as aggregationMethod)}
          defaultValue={aggregationMethod}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select aggregation method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weightedHarmonicMean">
              Weighted Harmonic Mean
            </SelectItem>
            <SelectItem value="arithmeticMean">Arithmetic Average</SelectItem>
            <SelectItem value="geometricMean">Geometric Mean</SelectItem>
            <SelectItem value="harmonicMean">Harmonic Mean</SelectItem>
            <SelectItem value="weightedArithmeticMean">
              Weighted Arithmetic Average
            </SelectItem>
            <SelectItem value="weightedGeometricMean">
              Weighted Geometric Mean
            </SelectItem>
          </SelectContent>
        </Select>): (<div>Weighted Harmonic Mean</div>)}
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="w-full min-w-full h-full min-h-full"
        >
          <BarChart accessibilityLayer data={chartData} barCategoryGap={20}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="measure"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              padding={{ left: -30, right: 0 }}
            />
            <YAxis
              tickLine={false}
              tickMargin={30}
              axisLine={false}
              domain={[0, 1]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="setA" fill="var(--color-setA)" radius={4} />
            <Bar dataKey="setB" fill="var(--color-setB)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const CoverageCard = ({
  report,
  setAnalysisPage,
}: {
  report: ReportData;
  setAnalysisPage: (page: AnalysisPage) => void;
}) => {
  const chartData = [
    {
      measure: 'Coverage',
      setA: report.coverage?.coverage_a,
      setB: report.coverage?.coverage_b,
    },
    {
      measure: 'Duplicate Coverage',
      setA: report.coverage?.duplicate_coverage_a,
      setB: report.coverage?.duplicate_coverage_b,
    },
  ];

  const chartConfig = {
    setA: {
      label: 'Set A',
      color: 'hsl(var(--chart-2))',
    },
    setB: {
      label: 'Set B',
      color: 'hsl(var(--chart-3))',
    },
  } satisfies ChartConfig;

  return (
    <Card className="h-64 flex flex-col">
      <CardHeader>
        <CardTitle>
          <button
            onClick={() => setAnalysisPage('coverage')}
            className="text-lg font-semibold cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Overall Coverage
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0 mt-[-1rem] h-5/6">
        <ChartContainer
          config={chartConfig}
          className="w-full min-w-full h-full min-h-full"
        >
          <BarChart
            layout="vertical" // Step 1: Set layout to vertical for horizontal bars
            accessibilityLayer
            data={chartData}
            barCategoryGap={20}
          >
            <CartesianGrid horizontal={false} />{' '}
            {/* Adjust grid lines if needed */}
            <XAxis
              type="number" // Step 2: X-axis now represents numeric values
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              domain={[0, 1]} // Retain domain if applicable
              padding={{ left: 0, right: 0 }} // Adjust padding as needed
            />
            <YAxis
              dataKey="measure" // Step 2: Y-axis now uses dataKey for categories
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              padding={{ top: 0, bottom: 0 }} // Adjust padding as needed
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="setA" fill="var(--color-setA)" radius={4} />
            <Bar dataKey="setB" fill="var(--color-setB)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const CardinalityCard = ({
  report,
  setAnalysisPage,
}: {
  report: ReportData;
  setAnalysisPage: (page: AnalysisPage) => void;
}) => {
  const setA = report.lpms_a.length;
  const setB = report.lpms_b.length;

  const maxCardinality = Math.max(setA, setB);
  const instancesPerCircle = Math.ceil(maxCardinality / 100);

  const circlesA = setA / instancesPerCircle;
  const circlesB = setB / instancesPerCircle;

  const fullCirclesA = Math.floor(circlesA);
  const lastCircleFractionA = circlesA - fullCirclesA;

  const fullCirclesB = Math.floor(circlesB);
  const lastCircleFractionB = circlesB - fullCirclesB;

  const circlesDataA = [];
  for (let i = 0; i < fullCirclesA; i++) {
    circlesDataA.push({ fraction: 1 });
  }
  if (lastCircleFractionA > 0) {
    circlesDataA.push({ fraction: lastCircleFractionA });
  }

  const circlesDataB = [];
  for (let i = 0; i < fullCirclesB; i++) {
    circlesDataB.push({ fraction: 1 });
  }
  if (lastCircleFractionB > 0) {
    circlesDataB.push({ fraction: lastCircleFractionB });
  }

  const Circle = ({ fraction, set }: { fraction: number; set: number }) => {
    const degrees = fraction * 360;

    const color = set === 1 ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-3))';

    return (
      <div
        className="w-2 h-2 rounded-full bg-gray-200 relative"
        style={{
          background: `conic-gradient(${color} 0deg, ${color} ${degrees}deg, transparent ${degrees}deg, transparent 360deg)`,
        }}
      />
    );
  };

  return (
    <Card className="h-64 flex flex-col">
      <CardHeader>
        <CardTitle>
          <button
            onClick={() => setAnalysisPage('list')}
            className="text-lg font-semibold cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            LPMs Overview
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex h-4/6 pt-0">
        <div className="flex-1 flex flex-col items-center h-5/6">
          <h4 className="font-bold mb-2">Set A: {setA}</h4>
          <div className="grid grid-cols-10 gap-1 h-fit">
            {circlesDataA.map((circle, index) => (
              <Circle key={index} fraction={circle.fraction} set={1} />
            ))}
          </div>
        </div>
        <div className="w-0.5 bg-gray-200 mx-2 relative"></div>
        <div className="flex-1 flex flex-col items-center h-5/6">
          <h4 className="font-bold mb-2">Set B: {setB}</h4>
          <div className="grid grid-cols-10 gap-1 h-fit">
            {circlesDataB.map((circle, index) => (
              <Circle key={index} fraction={circle.fraction} set={2} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SimilarityCard = ({
  report,
  setAnalysisPage,
}: {
  report: ReportData;
  setAnalysisPage: (page: AnalysisPage) => void;
}) => {
  const [similarityMeasure, setSimilarityMeasure] = useState<SimilarityMeasure>(
    'trace_similarity' as SimilarityMeasure,
  );

  const similarityData = report.similarity?.[similarityMeasure];

  const similarityValue =
    typeof similarityData === 'object' &&
    typeof similarityData.overall === 'number'
      ? similarityData.overall
      : 0;

  const percentage = Math.round(similarityValue * 10000) / 100;

  return (
    <Card className="h-64 overflow-auto">
      <CardHeader>
        <CardTitle>
          <button
            onClick={() => setAnalysisPage('similarity')}
            className="text-lg font-semibold cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Overall Similarity
          </button>
        </CardTitle>
        <SimilaritySelection
          similarityMeasure={similarityMeasure}
          setSimilarityMeasure={setSimilarityMeasure}
        />
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center h-3/6">
        <p className="text-6xl font-bold">{percentage}%</p>
      </CardContent>
    </Card>
  );
};

const SetRelationCard = ({
  report,
  setAnalysisPage,
  isOverview = true
}: {
  report: ReportData;
  setAnalysisPage: (page: AnalysisPage) => void;
  isOverview?: boolean;
}) => {
  const [similarityMeasure, setSimilarityMeasure] = useState<SimilarityMeasure>(
    'trace_similarity' as SimilarityMeasure,
  );
  const [threshold, setThreshold] = useState(0.9);

  return (
    <Card className="h-64 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between mb-0">
        <CardTitle>
          <button
            onClick={() => setAnalysisPage('setRelation')}
            className="text-lg font-semibold cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Set Relation
          </button>
        </CardTitle>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2">
            <SimilaritySelection
              similarityMeasure={similarityMeasure}
              setSimilarityMeasure={setSimilarityMeasure}
            />
            {!isOverview && (
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
                className="w-24"
              />
            </div>)}
          </div>
        </div>
        {isOverview && (
          <div>Threshold: 0.9</div>)}
      </CardHeader>
      <CardContent className="items-center justify-center">
        <div className="h-60 w-80">
          <EulerDiagram
            report={report}
            similarityMeasure={similarityMeasure}
            threshold={threshold}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default function AnalysisOverview({
  report,
  setAnalysisPage,
}: {
  report: ReportData;
  setAnalysisPage: (page: AnalysisPage) => void;
}) {
  return (
    <div className="flex-grow grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-min">
      <ConformanceCard report={report} setAnalysisPage={setAnalysisPage} />
      <CoverageCard report={report} setAnalysisPage={setAnalysisPage} />
      <CardinalityCard report={report} setAnalysisPage={setAnalysisPage} />
      <SimilarityCard report={report} setAnalysisPage={setAnalysisPage} />
      <SetRelationCard report={report} setAnalysisPage={setAnalysisPage} />
    </div>
  );
}
