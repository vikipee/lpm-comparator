import { useState } from 'react';
import {
  MatchingDetailsDialog,
  RankingDetailsDialog,
} from '@/components/EvaluationDialogs';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportData } from '@/types/Report';

export default function EvaluationReport({ report }: { report: ReportData }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <DominanceCountingCard report={report} />
      <RankSumAggregationCard report={report} />
    </div>
  );
}

const DominanceCountingCard = ({ report }: { report: ReportData }) => {
  const [isFitness, setIsFitness] = useState(true);
  const [similarityType, setSimilarityType] = useState<
    'leven_sym' | 'leven_asym_1' | 'leven_asym_2'
  >('leven_sym');

  const evaluation = isFitness
    ? report.fitness_evaluation
    : report.precision_evaluation;

  const dominanceCounting = evaluation?.dominance_counting;

  const dominanceCount = dominanceCounting
    ? dominanceCounting[similarityType]
    : undefined;

  // Decide which set is better
  let winner = '';
  if (dominanceCount) {
    if ((dominanceCount.dom_count_a || 0) > (dominanceCount.dom_count_b || 0)) {
      winner = 'A';
    } else if (
      (dominanceCount.dom_count_a || 0) < (dominanceCount.dom_count_b || 0)
    ) {
      winner = 'B';
    } else {
      winner = 'Tie';
    }
  }

  return (
    <Card className="mt-4 flex-1">
      <CardHeader>
        <CardTitle>Dominance Counting</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label
                htmlFor="fitness-switch"
                className={isFitness ? 'font-bold underline' : 'text-gray-500'}
              >
                Fitness
              </Label>
              <Switch
                id="fitness-switch"
                checked={!isFitness}
                onCheckedChange={(checked) => setIsFitness(!checked)}
              />
              <Label
                htmlFor="fitness-switch"
                className={!isFitness ? 'font-bold underline' : 'text-gray-500'}
              >
                Precision
              </Label>
            </div>
            <Select
              value={similarityType}
              onValueChange={(v) =>
                setSimilarityType(
                  v as 'leven_sym' | 'leven_asym_1' | 'leven_asym_2',
                )
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Matching" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leven_sym">Levenshtein Symmetric</SelectItem>
                <SelectItem value="leven_asym_1">
                  Levenshtein Asymmetric 1
                </SelectItem>
                <SelectItem value="leven_asym_2">
                  Levenshtein Asymmetric 2
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 text-center">
          {dominanceCount ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center space-x-4">
                <div
                  className={`text-3xl font-bold px-4 py-2 rounded border border-chart-2 ${
                    winner === 'A'
                      ? 'bg-[hsl(var(--chart-2))] text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {dominanceCount.dom_count_a ?? 0}
                </div>
                <div className="text-xl font-semibold">vs</div>
                <div
                  className={`text-3xl font-bold px-4 py-2 rounded border border-chart-3 ${
                    winner === 'B'
                      ? 'bg-[hsl(var(--chart-3))] text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {dominanceCount.dom_count_b ?? 0}
                </div>
              </div>
              {winner && winner !== 'Tie' && (
                <div className="mt-2">
                  <span>
                    Set{' '}
                    <span
                      style={{
                        color:
                          winner === 'A'
                            ? 'hsl(var(--chart-2))'
                            : 'hsl(var(--chart-3))',
                      }}
                    >
                      {winner}
                    </span>{' '}
                    has a higher dominance
                  </span>
                </div>
              )}
              {winner === 'Tie' && (
                <div className="mt-2">
                  <span>Both sets are equal in dominance</span>
                </div>
              )}
            </div>
          ) : (
            <div>No data available</div>
          )}
        </div>
        <div className="mt-6 text-center">
          {dominanceCount && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost">Inspect Details</Button>
              </DialogTrigger>
              <MatchingDetailsDialog
                report={report}
                isFitness={isFitness}
                setIsFitness={setIsFitness}
                similarityType={similarityType}
                setSimilarityType={setSimilarityType}
              />
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const RankSumAggregationCard = ({ report }: { report: ReportData }) => {
  const [isFitness, setIsFitness] = useState(true);

  const evaluation = isFitness
    ? report.fitness_evaluation
    : report.precision_evaluation;

  const rankAggregation = evaluation?.rank_aggregation;

  let winner = '';
  if (rankAggregation) {
    if (
      (rankAggregation.normalized_rank_sum_a || 0) <
      (rankAggregation.normalized_rank_sum_b || 0)
    ) {
      // Lower rank sum is better
      winner = 'A';
    } else if (
      (rankAggregation.normalized_rank_sum_a || 0) >
      (rankAggregation.normalized_rank_sum_b || 0)
    ) {
      winner = 'B';
    } else {
      winner = 'Tie';
    }
  }

  return (
    <Card className="mt-4 flex-1">
      <CardHeader>
        <CardTitle>Rank Sum Aggregation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Label
              htmlFor="fitness-switch-rank"
              className={isFitness ? 'font-bold underline' : 'text-gray-500'}
            >
              Fitness
            </Label>
            <Switch
              id="fitness-switch-rank"
              checked={!isFitness}
              onCheckedChange={(checked) => setIsFitness(!checked)}
            />
            <Label
              htmlFor="fitness-switch-rank"
              className={!isFitness ? 'font-bold underline' : 'text-gray-500'}
            >
              Precision
            </Label>
          </div>
        </div>
        <div className="mt-4 text-center">
          {rankAggregation ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center space-x-4">
                <div
                  className={`text-3xl font-bold px-4 py-2 rounded border border-chart-2 ${
                    winner === 'A'
                      ? 'bg-[hsl(var(--chart-2))] text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {rankAggregation.normalized_rank_sum_a?.toFixed(2) ?? 0}
                </div>
                <div className="text-xl font-semibold">vs</div>
                <div
                  className={`text-3xl font-bold px-4 py-2 rounded border border-chart-3 ${
                    winner === 'B'
                      ? 'bg-[hsl(var(--chart-3))] text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {rankAggregation.normalized_rank_sum_b?.toFixed(2) ?? 0}
                </div>
              </div>
              {winner && winner !== 'Tie' && (
                <div className="mt-2">
                  <span>
                    Set{' '}
                    <span
                      style={{
                        color:
                          winner === 'A'
                            ? 'hsl(var(--chart-2))'
                            : 'hsl(var(--chart-3))',
                      }}
                    >
                      {winner}
                    </span>{' '}
                    has a better rank sum
                  </span>
                </div>
              )}
              {winner === 'Tie' && (
                <div className="mt-2">
                  <span>Both sets have equal rank sums</span>
                </div>
              )}
            </div>
          ) : (
            <div>No data available</div>
          )}
        </div>
        <div className="mt-6 text-center">
          {rankAggregation && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost">Inspect Details</Button>
              </DialogTrigger>
              <RankingDetailsDialog
                report={report}
                isFitness={isFitness}
                setIsFitness={setIsFitness}
              />
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
