import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { ChevronDown, ChevronUp, Filter, SortAsc, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { ReportData } from '@/types/Report'

type LPM = {
  id: number
  name: string
  fitness: number
  precision: number
  coverage: number
}

type SortOption = 'name' | 'fitness' | 'precision' | 'coverage'
type SortOrder = 'asc' | 'desc'

const generateMockData = (count: number): LPM[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `LPM Model ${i + 1}`,
    fitness: Math.random(),
    precision: Math.random(),
    coverage: Math.random(),
  }))
}

const LpmCard = ({ 
  lpms, 
  currentPage, 
  setCurrentPage, 
  totalPages,
  sortBy,
  sortOrder,
  onSortChange,
  onFilterChange,
  filterValues,
  onResetFilters,
  color
}: { 
  lpms: LPM[], 
  currentPage: number, 
  setCurrentPage: (page: number) => void, 
  totalPages: number,
  sortBy: SortOption,
  sortOrder: SortOrder,
  onSortChange: (option: SortOption, order: SortOrder) => void,
  onFilterChange: (metric: Exclude<SortOption, 'name'>, values: [number, number]) => void,
  filterValues: Record<Exclude<SortOption, 'name'>, [number, number]>,
  onResetFilters: () => void,
  color: string
}) => {
  const [selectedLpm, setSelectedLpm] = useState<LPM | null>(null)

  return (
    <Card className="h-[600px] flex flex-col" style={{ borderTop: `3px solid ${color}` }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{color === 'hsl(181, 97%, 38%)' ? 'Set A' : 'Set B'}</CardTitle>
        <div className="flex space-x-2">
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
                <Button onClick={onResetFilters} variant="outline" size="sm" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        <ul className="space-y-2">
          {lpms.map(lpm => (
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
      <div className="flex justify-center items-center p-4 border-t space-x-2">
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
      </div>
      <Dialog open={!!selectedLpm} onOpenChange={() => setSelectedLpm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedLpm?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p>Fitness: {selectedLpm?.fitness.toFixed(4)}</p>
            <p>Precision: {selectedLpm?.precision.toFixed(4)}</p>
            <p>Coverage: {selectedLpm?.coverage.toFixed(4)}</p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default function LpmList({report}: {report: ReportData}) {
  const [lpmSet1] = useState(generateMockData(100))
  const [lpmSet2] = useState(generateMockData(100))
  const [currentPage1, setCurrentPage1] = useState(1)
  const [currentPage2, setCurrentPage2] = useState(1)
  const [sortBy1, setSortBy1] = useState<SortOption>('name')
  const [sortBy2, setSortBy2] = useState<SortOption>('name')
  const [sortOrder1, setSortOrder1] = useState<SortOrder>('asc')
  const [sortOrder2, setSortOrder2] = useState<SortOrder>('asc')
  const [filterValues1, setFilterValues1] = useState<Record<Exclude<SortOption, 'name'>, [number, number]>>({
    fitness: [0, 1],
    precision: [0, 1],
    coverage: [0, 1]
  })
  const [filterValues2, setFilterValues2] = useState<Record<Exclude<SortOption, 'name'>, [number, number]>>({
    fitness: [0, 1],
    precision: [0, 1],
    coverage: [0, 1]
  })

  const itemsPerPage = 50

  const sortAndFilterLpms = (lpms: LPM[], sortBy: SortOption, sortOrder: SortOrder, filterValues: Record<Exclude<SortOption, 'name'>, [number, number]>) => {
    return lpms
      .filter(lpm => 
        lpm.fitness >= filterValues.fitness[0] && lpm.fitness <= filterValues.fitness[1] &&
        lpm.precision >= filterValues.precision[0] && lpm.precision <= filterValues.precision[1] &&
        lpm.coverage >= filterValues.coverage[0] && lpm.coverage <= filterValues.coverage[1]
      )
      .sort((a, b) => {
        if (sortBy === 'name') {
          return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else {
          return sortOrder === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
        }
      })
  }

  const paginateLpms = (lpms: LPM[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage
    return lpms.slice(startIndex, startIndex + itemsPerPage)
  }

  const sortedAndFilteredLpms1 = sortAndFilterLpms(lpmSet1, sortBy1, sortOrder1, filterValues1)
  const sortedAndFilteredLpms2 = sortAndFilterLpms(lpmSet2, sortBy2, sortOrder2, filterValues2)

  const paginatedLpms1 = paginateLpms(sortedAndFilteredLpms1, currentPage1)
  const paginatedLpms2 = paginateLpms(sortedAndFilteredLpms2, currentPage2)

  const totalPages1 = Math.ceil(sortedAndFilteredLpms1.length / itemsPerPage)
  const totalPages2 = Math.ceil(sortedAndFilteredLpms2.length / itemsPerPage)

  const resetFilters = (setFilterValues: React.Dispatch<React.SetStateAction<Record<Exclude<SortOption, 'name'>, [number, number]>>>) => {
    setFilterValues({
      fitness: [0, 1],
      precision: [0, 1],
      coverage: [0, 1]
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LpmCard 
        lpms={paginatedLpms1} 
        currentPage={currentPage1} 
        setCurrentPage={setCurrentPage1} 
        totalPages={totalPages1}
        sortBy={sortBy1}
        sortOrder={sortOrder1}
        onSortChange={(option, order) => { setSortBy1(option); setSortOrder1(order); }}
        onFilterChange={(metric, values) =>setFilterValues1(prev => ({ ...prev, [metric]: values }))}
        filterValues={filterValues1}
        onResetFilters={() => resetFilters(setFilterValues1)}
        color="hsl(var(--chart-2))"
      />
      <LpmCard 
        lpms={paginatedLpms2} 
        currentPage={currentPage2} 
        setCurrentPage={setCurrentPage2} 
        totalPages={totalPages2}
        sortBy={sortBy2}
        sortOrder={sortOrder2}
        onSortChange={(option, order) => { setSortBy2(option); setSortOrder2(order); }}
        onFilterChange={(metric, values) => setFilterValues2(prev => ({ ...prev, [metric]: values }))}
        filterValues={filterValues2}
        onResetFilters={() => resetFilters(setFilterValues2)}
        color="hsl(var(--chart-3))"
      />
    </div>
  )
}