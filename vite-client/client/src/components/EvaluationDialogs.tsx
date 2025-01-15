import { useState, useEffect } from 'react';
import { LocalProcessModel, ReportData } from '@/types/Report';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function MatchingDetailsDialog({
  report,
  isFitness: initialIsFitness,
  setIsFitness,
  similarityType: initialSimilarityType,
  setSimilarityType,
}: {
  report: ReportData;
  isFitness: boolean;
  setIsFitness: React.Dispatch<React.SetStateAction<boolean>>;
  similarityType: 'leven_sym' | 'leven_asym_1' | 'leven_asym_2';
  setSimilarityType: React.Dispatch<
    React.SetStateAction<'leven_sym' | 'leven_asym_1' | 'leven_asym_2'>
  >;
}) {
  const [isFitness, setLocalIsFitness] = useState(initialIsFitness);
  const [similarityType, setLocalSimilarityType] = useState(
    initialSimilarityType,
  );

  useEffect(() => {
    setLocalIsFitness(initialIsFitness);
  }, [initialIsFitness]);

  useEffect(() => {
    setLocalSimilarityType(initialSimilarityType);
  }, [initialSimilarityType]);

  const evaluation = isFitness
    ? report.fitness_evaluation
    : report.precision_evaluation;

  const dominanceCounting = evaluation?.dominance_counting;

  const dominanceCount = dominanceCounting
    ? dominanceCounting[similarityType]
    : undefined;

  const matching = dominanceCount?.matching ?? [];

  const lpmsA = report.lpms_a;
  const lpmsB = report.lpms_b;

  const getLPMById = (id: string, lpms: LocalProcessModel[]) =>
    lpms.find((lpm) => lpm.id === id);

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Matching Details</DialogTitle>
      </DialogHeader>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Label
            htmlFor="fitness-switch-dialog"
            className={isFitness ? 'font-bold underline' : 'text-gray-500'}
          >
            Fitness
          </Label>
          <Switch
            id="fitness-switch-dialog"
            checked={!isFitness}
            onCheckedChange={(checked) => {
              setLocalIsFitness(!checked);
              setIsFitness(!checked);
            }}
          />
          <Label
            htmlFor="fitness-switch-dialog"
            className={!isFitness ? 'font-bold underline' : 'text-gray-500'}
          >
            Precision
          </Label>
        </div>
        <Select
          value={similarityType}
          onValueChange={(v) => {
            setLocalSimilarityType(
              v as 'leven_sym' | 'leven_asym_1' | 'leven_asym_2',
            );
            setSimilarityType(
              v as 'leven_sym' | 'leven_asym_1' | 'leven_asym_2',
            );
          }}
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
      <div className="mt-6 overflow-auto max-h-96">
        {dominanceCount && matching.length > 0 ? (
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1/5 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Set A
                </th>
                <th className="w-1/5 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isFitness ? 'Fitness' : 'Precision'}
                </th>
                <th className="w-1/5 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="w-1/5 px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isFitness ? 'Fitness' : 'Precision'}
                </th>
                <th className="w-1/5 px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Set B
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {matching.map((pair, idx) => {
                const lpmA = getLPMById(pair[0], lpmsA);
                const lpmB = getLPMById(pair[1], lpmsB);
                const valueA = isFitness ? lpmA?.fitness : lpmA?.precision;
                const valueB = isFitness ? lpmB?.fitness : lpmB?.precision;
                let winner = '';

                if (valueA !== undefined && valueB !== undefined) {
                  if (valueA > valueB) winner = 'A';
                  else if (valueA < valueB) winner = 'B';
                  else winner = 'Tie';
                }

                return (
                  <tr key={idx} className="text-sm">
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {lpmA?.name ?? 'N/A'}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-lg font-semibold text-chart-2">
                        {valueA !== undefined ? valueA.toFixed(4) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      {winner && (
                        <span
                          className={`font-semibold ${
                            winner === 'A'
                              ? 'text-[hsl(var(--chart-2))]'
                              : winner === 'B'
                                ? 'text-[hsl(var(--chart-3))]'
                                : 'text-gray-500'
                          }`}
                        >
                          {winner === 'Tie' ? 'Tie' : `Winner: ${winner}`}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <div className="text-lg font-semibold text-chart-3">
                        {valueB !== undefined ? valueB.toFixed(4) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right">
                      <div className="font-medium text-gray-900">
                        {lpmB?.name ?? 'N/A'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-gray-500">
            No matching data available for the selected similarity type.
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export function RankingDetailsDialog({
  report,
  isFitness: initialIsFitness,
  setIsFitness,
}: {
  report: ReportData;
  isFitness: boolean;
  setIsFitness: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isFitness, setLocalIsFitness] = useState(initialIsFitness);

  useEffect(() => {
    setLocalIsFitness(initialIsFitness);
  }, [initialIsFitness]);

  const evaluation = isFitness
    ? report.fitness_evaluation
    : report.precision_evaluation;

  const lpmsA = report.lpms_a;
  const lpmsB = report.lpms_b;

  const rankingIds = evaluation?.rank_aggregation?.ranking_ids ?? [];

  const getLPM = (rankItem: { side: number; id: string }) =>
    rankItem.side === 1
      ? lpmsA.find((lpm) => lpm.id === rankItem.id)
      : lpmsB.find((lpm) => lpm.id === rankItem.id);

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Ranking Details</DialogTitle>
      </DialogHeader>
      <div className="flex items-center space-x-2 mt-4">
        <Label
          htmlFor="fitness-switch-ranking-dialog"
          className={isFitness ? 'font-bold underline' : 'text-gray-500'}
        >
          Fitness
        </Label>
        <Switch
          id="fitness-switch-ranking-dialog"
          checked={!isFitness}
          onCheckedChange={(checked) => {
            setLocalIsFitness(!checked);
            setIsFitness(!checked);
          }}
        />
        <Label
          htmlFor="fitness-switch-ranking-dialog"
          className={!isFitness ? 'font-bold underline' : 'text-gray-500'}
        >
          Precision
        </Label>
      </div>
      <div className="mt-6 overflow-auto max-h-96">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-1/4 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="w-1/2 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LPM Name
              </th>
              <th className="w-1/4 px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isFitness ? 'Fitness' : 'Precision'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rankingIds.map((rankItem, idx) => {
              const lpm = getLPM(rankItem);
              const value = isFitness ? lpm?.fitness : lpm?.precision;
              const setColor =
                rankItem.side === 1
                  ? 'text-[hsl(var(--chart-2))]'
                  : 'text-[hsl(var(--chart-3))]';

              return (
                <tr key={idx} className="text-sm">
                  <td className="px-2 py-2">{rankItem.rank}</td>
                  <td className={`px-2 py-2 ${setColor}`}>
                    <div className="font-medium">{lpm?.name ?? 'N/A'}</div>
                  </td>
                  <td className="px-2 py-2 text-right">
                    <div className="font-medium">
                      {value !== undefined ? value.toFixed(2) : 'N/A'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DialogContent>
  );
}
