import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronUp, Filter, RotateCcw, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalProcessModel } from "@/types/Report";


export type SortOption = 'name' | 'fitness' | 'precision' | 'coverage'
export type SortOrder = 'asc' | 'desc'

export const sortAndFilterLpms = (lpms: LocalProcessModel[], filterValues: Record<Exclude<SortOption, 'name'>, [number, number]>, sortBy: SortOption, sortOrder: SortOrder) => {
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

export const defaultFilterValues : Record<Exclude<SortOption, 'name'>, [number, number]> = {
          fitness: [0, 1],
          precision: [0, 1],
          coverage: [0, 1]
        };

export const SortPopover = ({onSortChange, sortBy, sortOrder}: {onSortChange: (option: SortOption, order: SortOrder) => void; sortBy: SortOption; sortOrder: SortOrder}) => {
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

export const FilterPopover = ({onFilterChange, filterValues, resetFilters}: {onFilterChange: (metric: Exclude<SortOption, 'name'>, value: [number, number]) => void; filterValues: Record<Exclude<SortOption, 'name'>, [number, number]>; resetFilters: () => void;}) => {
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