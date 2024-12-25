import { ReportData, SimilarityMeasures } from "@/types/Report";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Aggregation } from "@/types/Report"
import { RadialBar, RadialBarChart } from "recharts"
import { AnalysisPage } from "@/pages/Analysis";
import { SimilarityMeasure, SimilaritySelection } from "@/components/SimilaritySelection";

export const ConformanceCard = ({ report, setAnalysisPage }: { report: ReportData;  setAnalysisPage: (page: AnalysisPage) => void; }) => {

    type AggregationMethod = keyof Aggregation;

    const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod>("weighted_harmonic_mean" as AggregationMethod);

    const chartData = [
        { measure: "Fitness", setA: report.fitness_aggregation?.[aggregationMethod]?.[0] ?? 0, setB: report.fitness_aggregation?.[aggregationMethod]?.[1] ?? 0 },
        { measure: "Precision", setA: report.precision_aggregation?.[aggregationMethod]?.[0] ?? 0, setB: report.precision_aggregation?.[aggregationMethod]?.[1] ?? 0 },
      ]
    
    const chartConfig = {
    setA: {
        label: "Set A",
        color: "hsl(var(--chart-2))",
    },
    setB: {
        label: "Set B",
        color: "hsl(var(--chart-3))",
    },
    } satisfies ChartConfig;

    return (
    <Card className="md:row-span-2 flex flex-col overflow-auto">
        <CardHeader>
        <CardTitle>
          <button
            onClick={() => setAnalysisPage("conformance")}
            className="text-lg font-semibold cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Aggregated Conformance
          </button>
        </CardTitle>
            <Select onValueChange={(v) => setAggregationMethod(v as AggregationMethod)} defaultValue={aggregationMethod}>
                <SelectTrigger>
                <SelectValue placeholder="Select aggregation method" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="weighted_harmonic_mean">Weighted Harmonic Mean</SelectItem>
                <SelectItem value="arithmetic_avg">Arithmetic Average</SelectItem>
                <SelectItem value="geometric_mean">Geometric Mean</SelectItem>
                <SelectItem value="harmonic_mean">Harmonic Mean</SelectItem>
                <SelectItem value="weighted_arithmetic_avg">Weighted Arithmetic Average</SelectItem>
                <SelectItem value="weighted_geometric_mean">Weighted Geometric Mean</SelectItem>
            </SelectContent>
            </Select>
        </CardHeader>
        <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="w-full min-w-full h-full min-h-full">
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
}

const CoverageCard = ({ report, setAnalysisPage }: { report: ReportData;  setAnalysisPage: (page: AnalysisPage) => void; }) => {

    const chartData = [
        { lpmSet: "", coverage: 1, fill: "white" },
        { lpmSet: "setA", coverage: report.coverage?.coverage_a, fill: "hsl(var(--chart-2))" },
        { lpmSet: "setB", coverage: report.coverage?.coverage_b, fill: "hsl(var(--chart-3))" },
    ];
    
    const chartConfig = {
    coverage: {
        label: "Coverage",
    },
    setA: {
        label: "Set A",
        color: "hsl(var(--chart-2))",
    },
    setB: {
        label: "Set B",
        color: "hsl(var(--chart-3))",
    },
    } satisfies ChartConfig;

    return (
        <Card className="h-64 flex flex-col">
            <CardHeader>
            <CardTitle>
          <button
            onClick={() => setAnalysisPage("coverage")}
            className="text-lg font-semibold cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Overall Coverage
          </button>
        </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-0 h-full">
                <ChartContainer
                config={chartConfig}
                className="h-[70%] mt-0 aspect-square mx-auto"
                >
                <RadialBarChart data={chartData}
            innerRadius="10%"
              outerRadius="100%">
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="lpmSet" />}
                    />
                    <RadialBar dataKey="coverage" background className="h-5/6">
                    <LabelList
                        position="insideStart"
                        dataKey="lpmSet"
                        className="fill-white capitalize mix-blend-luminosity"
                        fontSize={11}
                    />
                    </RadialBar>
                </RadialBarChart>
                </ChartContainer>

            </CardContent>
        </Card>
    );
};
  
const CardinalityCard = ({ report, setAnalysisPage }: { report: ReportData;  setAnalysisPage: (page: AnalysisPage) => void; }) => {
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
  
    const Circle = ({ fraction, set }: {fraction: number; set: number}) => {
      const degrees = fraction * 360;
  
      const color = set === 1 ? "hsl(var(--chart-2))" : "hsl(var(--chart-3))";
    
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
            onClick={() => setAnalysisPage("list")}
            className="text-lg font-semibold cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
           Cardinality
          </button>
        </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex h-4/6 pt-0">
          <div className="flex-1 flex flex-col items-center h-5/6">
          <h4 className="font-bold mb-2">Set A: {setA}</h4>
            <div className="grid grid-cols-10 gap-1 h-fit">
              {circlesDataA.map((circle, index) => (
                <Circle key={index} fraction={circle.fraction} set={1}/>
              ))}
            </div>
          </div>
          <div className="w-0.5 bg-gray-200 mx-2 relative">
          </div>
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

const SimilarityCard = ({ report, setAnalysisPage }: { report: ReportData;  setAnalysisPage: (page: AnalysisPage) => void; }) => {

    const [similarityMeasure, setSimilarityMeasure] = useState<SimilarityMeasure>("trace_similarity" as SimilarityMeasure);

    const similarityData = report.similarity?.[similarityMeasure];
  
    const similarityValue =
        typeof similarityData === 'object' && typeof similarityData.overall === 'number'
        ? similarityData.overall
        : 0;
  
  const percentage = Math.round(similarityValue * 10000)/100;

    return (
        <Card className="h-64 overflow-auto">
            <CardHeader>
            <CardTitle>
          <button
            onClick={() => setAnalysisPage("similarity")}
            className="text-lg font-semibold cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Similarity
          </button>
        </CardTitle>
        <SimilaritySelection similarityMeasure={similarityMeasure} setSimilarityMeasure={setSimilarityMeasure} />
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center h-3/6">
        <p className="text-6xl font-bold">
          {percentage}%
        </p>
      </CardContent>
        </Card>
    );

}

const EvaluationCard = ({ report, setAnalysisPage }: { report: ReportData;  setAnalysisPage: (page: AnalysisPage) => void; }) => {
    const setAWins = 6;
    const setBWins = 7;
  
    const totalWins = setAWins + setBWins;
    const winningThreshold = Math.ceil(totalWins / 2);
  
    // Determine the winner
    let winner: 'A' | 'B' | null = null;
    if (setAWins > setBWins) {
      winner = 'A';
    } else if (setBWins > setAWins) {
      winner = 'B';
    } else {
      winner = null; // Draw
    }
  
    // Prepare data for the chart
    const chartData = [
      {
        name: 'Wins',
        'Set A': setAWins,
        'Set B': setBWins,
      },
    ];
  
    // Styles for Set A and Set B Texts
    const getSetTextStyle = (set: 'A' | 'B') => {
      if (winner === set) {
        const borderColor = set === 'A' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-3))';
        return {
          borderColor: borderColor,
          borderWidth: '2px',
          borderStyle: 'solid',
          borderRadius: '9999px',
          padding: '0.25rem 0.75rem',
          whiteSpace: 'nowrap',
        };
      } else {
        return {};
      }
    };
  
    return (
      <Card className="h-64 flex flex-col">
        <CardHeader>
        <CardTitle>
          <button
            onClick={() => setAnalysisPage("evaluation")}
            className="text-lg font-semibold cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Evaluation
          </button>
        </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-start">
          <div className="flex items-center justify-between px-4">
            <div
              className="text-xl font-bold"
              style={getSetTextStyle('A')}
            >
              Set A
            </div>
            <div
              className="text-xl font-bold"
              style={getSetTextStyle('B')}
            >
              Set B
            </div>
          </div>
          <div className="flex-1 flex px-4 mt-0">
            <ResponsiveContainer width="100%" height={90}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 0, bottom: 25, left: 0 }}
              >
                <XAxis type="number" hide domain={[0, totalWins]} />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip
                  formatter={(value, name) => [`${value} wins`, name]}
                  labelFormatter={() => ''}
                />
                <Bar
                  dataKey="Set A"
                  stackId="a"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 0, 0, 4]}
                  isAnimationActive={true}
                />
                <Bar
                  dataKey="Set B"
                  stackId="a"
                  fill="hsl(var(--chart-3))"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={true}
                />
                <ReferenceLine
                  x={winningThreshold}
                  stroke="black"
                  strokeDasharray="3 3"
                  label={{
                    position: 'bottom',
                    value: `Winning Threshold: ${winningThreshold}`,
                    fill: 'black',
                    fontSize: 12,
                    dy: 5, 

                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };
  

export default function AnalysisOverview ({ report, setAnalysisPage }: { report: ReportData;  setAnalysisPage: (page: AnalysisPage) => void; }) {

  return(
    <div className="flex-grow grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-min">
          <ConformanceCard report={report} setAnalysisPage={setAnalysisPage} />
          <CoverageCard report={report} setAnalysisPage={setAnalysisPage}/>
          <CardinalityCard report={report} setAnalysisPage={setAnalysisPage}/>
          <SimilarityCard report={report} setAnalysisPage={setAnalysisPage}/>
          <EvaluationCard report={report} setAnalysisPage={setAnalysisPage}/>
      </div>
      );
};
