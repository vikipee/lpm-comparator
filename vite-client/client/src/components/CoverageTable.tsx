import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination, PaginationEllipsis } from '@/components/ui/pagination';
import { ReportData } from '@/types/Report';
import { defaultTraceCoverageFilterValues, GenericFilterPopover, GenericSortPopover, sortAndFilterTraceCoverages, SortOrder, TraceCoverageSortOption } from '@/components/SortAndFilter';

// Generate random data of trace coverages
const generateRandomData = (length: number) => {
    //Data should be an array of objects with the following structure
    // { trace: string, coverage_a: number, coverage_b: number }
    let data = []
    for (let i = 0; i < length; i++) {
        const trace = Math.random().toString(36).substring(7);
        const coverage_a = Math.random();
        const coverage_b = Math.random();
        data.push({ 'trace': trace, 'coverage_a': coverage_a, 'coverage_b': coverage_b });
    }
    return data;
}   

//const { trace_coverages_a, short_trace_strings, trace_coverages_b } = generateRandomData(1000)

export default function CoverageTable({ report }: { report: ReportData }) {
    const [sortBy, setSortBy] = useState<TraceCoverageSortOption>('trace');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [filterValues, setFilterValues] = useState<Record<Exclude<TraceCoverageSortOption, 'trace'>, [number, number]>>(defaultTraceCoverageFilterValues);

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 50

    const [scrollbarWidth, setScrollbarWidth] = useState(0);


  
  useEffect(() => {
    const getScrollbarWidth = () => {
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll';
      document.body.appendChild(outer);

      const inner = document.createElement('div');
      outer.appendChild(inner);

      const width = outer.offsetWidth - inner.offsetWidth;

      document.body.removeChild(outer);

      return width;
    };

    setScrollbarWidth(getScrollbarWidth());
  }, []);

  const trace_coverages = report.coverage?.trace_coverages || []
  //const trace_coverages = generateRandomData(1000)

  const sortedAndFilteredData = sortAndFilterTraceCoverages(trace_coverages, filterValues, sortBy, sortOrder)
  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage)

  // Adjust currentPage if it exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [currentPage, totalPages]);

  const paginatedData = sortedAndFilteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <Card className="w-full h-[600px] mt-6">
      <CardContent className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2">
                              <GenericSortPopover onSortChange={(option, order) => {
                                  setSortBy(option);
                                  setSortOrder(order);
                              }} sortBy={sortBy} sortOrder={sortOrder} options={['coverage_a', 'trace', 'coverage_b']}/>
                              <GenericFilterPopover onFilterChange={(metric, value) => {
                                  setFilterValues({
                                      ...filterValues,
                                      [metric]: value
                                  });
                              }} filterValues={filterValues} resetFilters={() => setFilterValues(defaultTraceCoverageFilterValues)} options={['coverage_a', 'coverage_b']}/>
                          
                          </div>
          <div>
            Showing {paginatedData.length} of {sortedAndFilteredData.length} results
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden scrollbar-gutter-stable">
          <Table className="w-full">
            <TableHeader className="block" style={{ paddingRight: `${scrollbarWidth}px` }}>
              <TableRow className="flex">
                <TableHead className="border-r w-1/3 flex-shrink-0 sticky top-0 pt-2 text-center bg-white z-10">Coverage Set A</TableHead>
                <TableHead className="border-r w-1/3 flex-shrink-0 sticky top-0 pt-2 text-center bg-white z-10">Traces</TableHead>
                <TableHead className="w-1/3 flex-shrink-0 sticky top-0 pt-2 text-center bg-white z-10">Coverage Set B</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="block max-h-[400px] overflow-y-auto">
              {paginatedData.map((item, index) => (
                <TableRow key={index} className="flex">
                  <TableCell className="border-r w-1/3 flex-shrink-0 text-center">{item.coverage_a.toFixed(4)}</TableCell>
                  <TableCell className="border-r w-1/3 flex-shrink-0 text-center">{item.trace}</TableCell>
                  <TableCell className="w-1/3 flex-shrink-0 text-center">{item.coverage_b.toFixed(4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination className="mt-4 flex items-center space-x-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          {/* First Page */}
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(1)}
          >
            1
          </Button>

          {/* Ellipsis after first page */}
          {currentPage > 4 && (
            <PaginationEllipsis />
          )}

          {/* Pages Around Current Page */}
          {Array.from({ length: 5 }, (_, i) => {
            const pageNumber = currentPage - 2 + i;
            if (pageNumber > 1 && pageNumber < totalPages) {
              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            }
            return null;
          })}

          {/* Ellipsis before last page */}
          {currentPage < totalPages - 3 && (
            <PaginationEllipsis />
          )}

          {/* Last Page */}
          {totalPages > 1 && (
            <Button
              variant={currentPage === totalPages ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </Button>
          )}

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Pagination>
      </CardContent>
    </Card>
  )
}