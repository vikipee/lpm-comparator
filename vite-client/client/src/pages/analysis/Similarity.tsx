import { ReportData } from "@/types/Report";
import MyResponsiveHeatMap from "@/components/Heatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultLpmFilterValues, LpmSortOption, SortOrder, sortAndFilterLpms, GenericSortPopover, GenericFilterPopover } from "@/components/SortAndFilter";
import { useState } from "react";
import { SimilarityMeasure, SimilaritySelection } from "@/components/SimilaritySelection";



export default function Similarity({report}: {report: ReportData}) {
  const [similarityMeasure, setSimilarityMeasure] = useState<SimilarityMeasure>("trace_similarity" as SimilarityMeasure);

  const [sortBy, setSortBy] = useState<LpmSortOption>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterValues, setFilterValues] = useState<Record<Exclude<LpmSortOption, 'name'>, [number, number]>>(defaultLpmFilterValues);

  const similarityData = report.similarity?.[similarityMeasure];

  const similarityMatrix =
        typeof similarityData === 'object' ? similarityData.matrix : undefined;

  if (!similarityMatrix) {
    return <div>No similarity data available</div>;
  }
  
  let noLPMs = false;


  const sortedLpmsA = sortAndFilterLpms(report.lpms_a, filterValues, sortBy, sortOrder).slice(0, 15);
  const sortedLpmsB = sortAndFilterLpms(report.lpms_b, filterValues, sortBy, sortOrder).slice(0, 15);

  if(sortedLpmsA.length === 0 || sortedLpmsB.length === 0) {
    noLPMs = true;
  }

  const data = sortedLpmsA.map((lpmA) => {
    const rowLabel = lpmA.name;
    const rowIndex = lpmA.index;
    return {
      id: rowLabel,
      data: sortedLpmsB.map((lpmB) => {
        const colLabel = lpmB.name;
        const colIndex = lpmB.index;
        const value = similarityMatrix[rowIndex][colIndex];
        return {
          x: colLabel,
          y: value,
        };
      }),
    };
  });

    return (
        <Card className=" h-[calc(100vh-8rem)] flex flex-col mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Similarity Heatmap</CardTitle>
                <div className="flex space-x-2">
                  <div className="flex items-center space-x-2">
                    <SimilaritySelection similarityMeasure={similarityMeasure} setSimilarityMeasure={setSimilarityMeasure} />
                  </div>
                    <GenericSortPopover onSortChange={(option, order) => {
                        setSortBy(option);
                        setSortOrder(order);
                    }} sortBy={sortBy} sortOrder={sortOrder} options={[['name'],['fitness'], ['precision'], ['coverage']]}/>
                    <GenericFilterPopover onFilterChange={(metric, value) => {
                        setFilterValues({
                            ...filterValues,
                            [metric]: value
                        });
                    }} filterValues={filterValues} resetFilters={() => setFilterValues(defaultLpmFilterValues)} options={[['fitness'], ['precision'], ['coverage']]}/>
                
                </div>
            </CardHeader>
            <CardContent className="h-[calc(100vh-8rem)] overflow-auto">
              {noLPMs ? (<div className="text-center h-full flex-col"> <h3 className="my-auto font-bold">No LPMs to display</h3> <p>Change your filters to see the Heatmap again</p></div>) : (<MyResponsiveHeatMap data={data}/>)}
            </CardContent>
        </Card>
    );

}