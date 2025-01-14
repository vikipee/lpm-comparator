// Evaluation.tsx

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
import { DominanceCount, ReportData } from '@/types/Report';

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

  const dominanceCount: DominanceCount | undefined =
    evaluation?.dominance_counting
      ? evaluation.dominance_counting[similarityType]
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
    <div className="bg-white rounded-lg shadow p-6 flex-1">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dominance Counting</h2>
        <div className="flex items-center space-x-4">
          {/* Switch to toggle between Fitness and Precision */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="fitness-switch">Fitness</Label>
            <Switch
              id="fitness-switch"
              checked={isFitness}
              onCheckedChange={(checked) => setIsFitness(checked)}
            />
          </div>
          {/* Select for similarity matching type */}
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
          <div className="flex items-center justify-center space-x-4">
            <div className="text-3xl font-bold">
              {dominanceCount.dom_count_a ?? 0}
            </div>
            <div className="text-xl font-semibold">vs</div>
            <div className="text-3xl font-bold">
              {dominanceCount.dom_count_b ?? 0}
            </div>
          </div>
        ) : (
          <div>No data available</div>
        )}
        {winner && winner !== 'Tie' && (
          <div className="mt-2">
            <span>
              Set{' '}
              <span
                className={winner === 'A' ? 'text-teal-600' : 'text-orange-600'}
              >
                {winner}
              </span>{' '}
              has higher dominance
            </span>
          </div>
        )}
        {winner === 'Tie' && (
          <div className="mt-2">
            <span>Both sets are equal in dominance</span>
          </div>
        )}
      </div>
      <div className="mt-6 text-center">
        {dominanceCount && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="text-blue-600 hover:underline">
                Inspect Details
              </Button>
            </DialogTrigger>
            <MatchingDetailsDialog
              matching={dominanceCount.matching}
              lpmsA={report.lpms_a}
              lpmsB={report.lpms_b}
              isFitness={isFitness}
            />
          </Dialog>
        )}
      </div>
    </div>
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
    <div className="bg-white rounded-lg shadow p-6 flex-1">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rank Sum Aggregation</h2>
        <div className="flex items-center">
          {/* Switch to toggle between Fitness and Precision */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="fitness-switch-rank">Fitness</Label>
            <Switch
              id="fitness-switch-rank"
              checked={isFitness}
              onCheckedChange={(checked) => setIsFitness(checked)}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        {rankAggregation ? (
          <div className="flex items-center justify-center space-x-4">
            <div className="text-3xl font-bold">
              {rankAggregation.normalized_rank_sum_a?.toFixed(2) ?? 0}
            </div>
            <div className="text-xl font-semibold">vs</div>
            <div className="text-3xl font-bold">
              {rankAggregation.normalized_rank_sum_b?.toFixed(2) ?? 0}
            </div>
          </div>
        ) : (
          <div>No data available</div>
        )}
        {winner && winner !== 'Tie' && (
          <div className="mt-2">
            <span>
              Set{' '}
              <span
                className={winner === 'A' ? 'text-teal-600' : 'text-orange-600'}
              >
                {winner}
              </span>{' '}
              has better rank sum
            </span>
          </div>
        )}
        {winner === 'Tie' && (
          <div className="mt-2">
            <span>Both sets have equal rank sums</span>
          </div>
        )}
      </div>
      <div className="mt-6 text-center">
        {rankAggregation && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="text-blue-600 hover:underline">
                Inspect Details
              </Button>
            </DialogTrigger>
            <RankingDetailsDialog
              rankingIds={rankAggregation.ranking_ids ?? []}
              lpmsA={report.lpms_a}
              lpmsB={report.lpms_b}
              isFitness={isFitness}
            />
          </Dialog>
        )}
      </div>
    </div>
  );
};
