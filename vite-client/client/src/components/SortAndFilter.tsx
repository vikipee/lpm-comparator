import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronUp, Filter, RotateCcw, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalProcessModel, Trace } from "@/types/Report";


export type SortOrder = 'asc' | 'desc';
export type SortOptionType = string;
export type FilterValuesType = Record<string, [number, number]>;

export type LpmSortOption  = 'name' | 'fitness' | 'precision' | 'coverage';

export const defaultLpmFilterValues: Record<Exclude<LpmSortOption, 'name'>, [number, number]> = {
  fitness: [0, 1],
  precision: [0, 1],
  coverage: [0, 1],
};

export type TraceCoverageSortOption = 'coverage_a' | 'duplicate_coverage_a' | 'trace' | 'coverage_b' | 'duplicate_coverage_b';

export const defaultTraceCoverageFilterValues : Record<Exclude<TraceCoverageSortOption, 'trace'>, [number, number]> = {
    coverage_a: [0, 1],
    coverage_b: [0, 1],
    duplicate_coverage_a: [0, 1],
    duplicate_coverage_b: [0, 1],
};

export const sortAndFilterLpms = (lpms: LocalProcessModel[], filterValues: Record<Exclude<LpmSortOption, 'name'>, [number, number]>, sortBy: LpmSortOption, sortOrder: SortOrder) => {
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

export const sortAndFilterTraceCoverages = (traces: Trace[], filterValues: Record<Exclude<TraceCoverageSortOption, 'trace'>, [number, number]>, sortBy: TraceCoverageSortOption, sortOrder: SortOrder, variantsIdx: number[]) => { 

  traces = traces.filter((_, i) => variantsIdx.includes(i));

    const filteredTraces = traces.filter((trace) => {
      const withinCoverageA =
        trace.coverage_a >= filterValues.coverage_a[0] &&
        trace.coverage_a <= filterValues.coverage_a[1];
      const withinCoverageB =
        trace.coverage_b >= filterValues.coverage_b[0] &&
        trace.coverage_b <= filterValues.coverage_b[1];
      const withinDuplicateCoverageA = 
        trace.duplicate_coverage_a >= filterValues.duplicate_coverage_a[0] &&
        trace.duplicate_coverage_a <= filterValues.duplicate_coverage_a[1];
      const withinDuplicateCoverageB =
        trace.duplicate_coverage_b >= filterValues.duplicate_coverage_b[0] &&
        trace.duplicate_coverage_b <= filterValues.duplicate_coverage_b[1];

      return withinCoverageA && withinCoverageB && withinDuplicateCoverageA && withinDuplicateCoverageB;
    });
    return filteredTraces.sort((a,b) => {
        if (sortBy === 'trace') {
            return sortOrder === 'asc' ? a.trace.localeCompare(b.trace) : b.trace.localeCompare(a.trace);
        }
        else if (sortBy === 'coverage_a') {
            return sortOrder === 'asc' ? a.coverage_a - b.coverage_a : b.coverage_a - a.coverage_a;
        }
        else if (sortBy === 'duplicate_coverage_a') {
          return sortOrder === 'asc' ? a.duplicate_coverage_a - b.duplicate_coverage_a : b.duplicate_coverage_a - a.duplicate_coverage_a;
        }
        else if (sortBy === 'duplicate_coverage_b') {
          return sortOrder === 'asc' ? a.duplicate_coverage_b - b.duplicate_coverage_b : b.duplicate_coverage_b - a.duplicate_coverage_b;
        }
        else {
            return sortOrder === 'asc' ? a.coverage_b - b.coverage_b : b.coverage_b - a.coverage_b;
        }
      
    });
}

  type GenericSortPopoverProps<TSortOption extends SortOptionType> = {
    onSortChange: (option: TSortOption, order: SortOrder) => void;
    sortBy: TSortOption;
    sortOrder: SortOrder;
    options: [TSortOption, string?][];
  };

  export function GenericSortPopover<TSortOption extends SortOptionType>({
    onSortChange,
    sortBy,
    sortOrder,
    options,
  }: GenericSortPopoverProps<TSortOption>) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <SortAsc className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option[0]} className="flex items-center justify-between">
                <span className="capitalize">{option[1] ?? option[0]}</span>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSortChange(option[0], 'asc')}
                    className={sortBy === option[0] && sortOrder === 'asc' ? 'bg-accent' : ''}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSortChange(option[0], 'desc')}
                    className={sortBy === option[0] && sortOrder === 'desc' ? 'bg-accent' : ''}
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

  type GenericFilterPopoverProps<TFilterOption extends string> = {
    onFilterChange: (metric: TFilterOption, value: [number, number]) => void;
    filterValues: Record<TFilterOption, [number, number]>;
    resetFilters: () => void;
    options: [TFilterOption, string?][];
  };
  
  export function GenericFilterPopover<TFilterOption extends string>({
    onFilterChange,
    filterValues,
    resetFilters,
    options,
  }: GenericFilterPopoverProps<TFilterOption>) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            {options.map((metric) => (
              <div key={metric[0]} className="space-y-2">
                <label className="text-sm font-medium capitalize">{metric[1] ?? metric[0]}</label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={filterValues[metric[0]]}
                  onValueChange={(value) => onFilterChange(metric[0], value as [number, number])}
                  className="[&;_[role=slider]]:h-4 [&;_[role=slider]]:w-4 [&;_[role=slider]]:border-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{filterValues[metric[0]][0].toFixed(2)}</span>
                  <span>{filterValues[metric[0]][1].toFixed(2)}</span>
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