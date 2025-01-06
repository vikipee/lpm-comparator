import LPMDialog from "@/components/LPMDialog";
import { defaultLpmFilterValues, sortAndFilterLpms, LpmSortOption, SortOrder, GenericSortPopover, GenericFilterPopover } from "@/components/SortAndFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportData, LocalProcessModel } from "@/types/Report";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const LPMCard =  ({side, lpms, setSelectedSide, setSelectedLpm}: {side: 1 | 2; lpms: LocalProcessModel[]; setSelectedSide: (side:1 |2) => void; setSelectedLpm: (selectedLpm: LocalProcessModel) => void;}) => {

    const title = side === 1 ? "Set A" : "Set B";
    const color = side === 1 ? "hsl(var(--chart-2))" : "hsl(var(--chart-3))";

    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<LpmSortOption>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [filterValues, setFilterValues] = useState<Record<Exclude<LpmSortOption, 'name'>, [number, number]>>(defaultLpmFilterValues);

    const itemsPerPage = 50;

    const paginateLpms = (lpms: LocalProcessModel[]) => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return lpms.slice(startIndex, startIndex + itemsPerPage)
    };

    const sortedAndFilteredLpms = sortAndFilterLpms(lpms, filterValues, sortBy, sortOrder);
    const totalPages = Math.ceil(sortedAndFilteredLpms.length / itemsPerPage);

    if (currentPage > totalPages) {
        setCurrentPage(totalPages);
    }

    const paginatedLpms = paginateLpms(sortedAndFilteredLpms);



    return (
        <Card className="h-[600px] flex flex-col" style={{ borderTop: `3px solid ${color}`}}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{title}</CardTitle>
                <div className="flex space-x-2">
                    <GenericSortPopover onSortChange={(option, order) => {
                        setSortBy(option);
                        setSortOrder(order);
                    }} sortBy={sortBy} sortOrder={sortOrder} options={[['name'], ['fitness'], ['precision'], ['coverage']]}/>
                    <GenericFilterPopover onFilterChange={(metric, value) => {
                        setFilterValues({
                            ...filterValues,
                            [metric]: value
                        });
                    }} filterValues={filterValues} resetFilters={() => setFilterValues(defaultLpmFilterValues)} options={[['fitness'], ['precision'], ['coverage']]}/>
                
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
        <ul className="space-y-2">
          {paginatedLpms.map(lpm => (
            <li 
              key={lpm.id} 
              className="flex justify-between items-center p-2 hover:bg-accent cursor-pointer rounded" 
              onClick={() => {setSelectedLpm(lpm); setSelectedSide(side);}}
              style={{ borderLeft: `2px solid ${color}` }}
            >
              <span className="text-lg font-semibold">{lpm.name}</span>
              <span className="text-sm text-muted-foreground">
                F: {lpm.fitness.toFixed(2)}, P: {lpm.precision.toFixed(2)}, C: {lpm.coverage.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-center items-center p-4 border-t space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNumber = currentPage <= 3 ? i + 1 : 
                             currentPage >= totalPages - 2 ? totalPages - 4 + i :
                             currentPage - 2 + i;
          return (
            <Button
              key={i}
              variant={pageNumber === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          );
        })}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
        </Card>
    );
};

export default function LpmList({report}: {report: ReportData}) {

    const [selectedLpm, setSelectedLpm] = useState<LocalProcessModel | null>(null);
    const [selectedSide, setSelectedSide] = useState<1 | 2>(1);

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LPMCard 
                    side={1}
                    lpms={report.lpms_a}
                    setSelectedSide={setSelectedSide}
                    setSelectedLpm={setSelectedLpm}
                />
                <LPMCard
                    side={2}
                    lpms={report.lpms_b}
                    setSelectedSide={setSelectedSide}
                    setSelectedLpm={setSelectedLpm}
                />
                <LPMDialog side={selectedSide} setSide={setSelectedSide} selectedLpm={selectedLpm} setSelectedLpm={setSelectedLpm} report={report} />
             
            </div> 
            );
            
    
}