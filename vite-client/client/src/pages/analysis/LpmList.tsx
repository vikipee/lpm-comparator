import LPMDialog from "@/components/LPMDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { ReportData, LocalProcessModel, SimilarityMeasures } from "@/types/Report";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Filter, RotateCcw, SortAsc } from "lucide-react";
import { useState } from "react";

type SortOption = 'name' | 'fitness' | 'precision' | 'coverage'
type SortOrder = 'asc' | 'desc'


const SortPopover = ({onSortChange, sortBy, sortOrder}: {onSortChange: (option: SortOption, order: SortOrder) => void; sortBy: SortOption; sortOrder: SortOrder}) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <SortAsc className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                {(['name', 'fitness', 'precision', 'coverage'] as const).map((option) => (
                  <div key={option} className="flex items-center justify-between">
                    <span className="capitalize">{option}</span>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSortChange(option, 'asc')}
                        className={sortBy === option && sortOrder === 'asc' ? 'bg-accent' : ''}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSortChange(option, 'desc')}
                        className={sortBy === option && sortOrder === 'desc' ? 'bg-accent' : ''}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
    );
};

const FilterPopover = ({onFilterChange, filterValues, resetFilters}: {onFilterChange: (metric: Exclude<SortOption, 'name'>, value: [number, number]) => void; filterValues: Record<Exclude<SortOption, 'name'>, [number, number]>; resetFilters: () => void;}) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                {(['fitness', 'precision', 'coverage'] as const).map((metric) => (
                  <div key={metric} className="space-y-2">
                    <label className="text-sm font-medium capitalize">{metric}</label>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={filterValues[metric]}
                      onValueChange={(value) => onFilterChange(metric, value as [number, number])}
                      className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{filterValues[metric][0].toFixed(2)}</span>
                      <span>{filterValues[metric][1].toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                <Button onClick={resetFilters} variant="outline" size="sm" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
    );
};

const LPMCard =  ({side, lpms, similarityMeasures}: {side: 1 | 2; lpms: LocalProcessModel[]; similarityMeasures: SimilarityMeasures}) => {

    const title = side === 1 ? "Set A" : "Set B";
    const color = side === 1 ? "hsl(var(--chart-2))" : "hsl(var(--chart-3))";

    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [filterValues, setFilterValues] = useState<Record<Exclude<SortOption, 'name'>, [number, number]>>({
        fitness: [0, 1],
        precision: [0, 1],
        coverage: [0, 1]
    });

    const resetFilters = () => {
        setFilterValues({
          fitness: [0, 1],
          precision: [0, 1],
          coverage: [0, 1]
        })
    };

    const [selectedLpm, setSelectedLpm] = useState<LocalProcessModel | null>(null)

    const itemsPerPage = 50;

    const sortAndFilterLpms = (lpms: LocalProcessModel[]) => {
        return lpms
            .filter(lpm => 
                lpm.fitness >= filterValues.fitness[0] && lpm.fitness <= filterValues.fitness[1] &&
                lpm.precision >= filterValues.precision[0] && lpm.precision <= filterValues.precision[1] &&
                lpm.coverage >= filterValues.coverage[0] && lpm.coverage <= filterValues.coverage[1]
            )
            .sort((a, b) =>{
                if (sortBy === 'name') {
                    return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                } else {
                    return sortOrder === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
                }
            });
    };

    const paginateLpms = (lpms: LocalProcessModel[]) => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return lpms.slice(startIndex, startIndex + itemsPerPage)
    };

    const sortedAndFilteredLpms = sortAndFilterLpms(lpms);
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
                    <SortPopover onSortChange={(option, order) => {
                        setSortBy(option);
                        setSortOrder(order);
                    }} sortBy={sortBy} sortOrder={sortOrder} />
                    <FilterPopover onFilterChange={(metric, value) => {
                        setFilterValues({
                            ...filterValues,
                            [metric]: value
                        });
                    }} filterValues={filterValues} resetFilters={resetFilters} />
                
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
        <ul className="space-y-2">
          {paginatedLpms.map(lpm => (
            <li 
              key={lpm.id} 
              className="flex justify-between items-center p-2 hover:bg-accent cursor-pointer rounded" 
              onClick={() => setSelectedLpm(lpm)}
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
      <LPMDialog side={side} selectedLpm={selectedLpm} setSelectedLpm={setSelectedLpm} similarityMeasures={similarityMeasures} />
        </Card>
    );
};

export default function LpmList({report}: {report: ReportData}) {

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LPMCard 
                    side={1}
                    lpms={report.lpms_a}
                    similarityMeasures={report.similarity ?? {}}
                />
                <LPMCard
                    side={2}
                    lpms={report.lpms_b}
                    similarityMeasures={report.similarity ?? {}}
                />
            </div>
        );
    
}