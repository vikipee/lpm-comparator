// EvaluationDialogs.tsx

import { useState, useEffect } from 'react';
import { DominanceCount, LocalProcessModel } from '@/types/Report';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export function MatchingDetailsDialog({
  matching,
  lpmsA,
  lpmsB,
  isFitness: initialIsFitness,
}: {
  matching: DominanceCount['matching'];
  lpmsA: LocalProcessModel[];
  lpmsB: LocalProcessModel[];
  isFitness: boolean;
}) {
  const [isFitness, setIsFitness] = useState(initialIsFitness);

  // Synchronize local isFitness with initialIsFitness
  useEffect(() => {
    setIsFitness(initialIsFitness);
  }, [initialIsFitness]);

  const getLPMById = (id: string, lpms: LocalProcessModel[]) =>
    lpms.find((lpm) => lpm.id === id);

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Matching Details</DialogTitle>
        <DialogDescription>
          View detailed comparison between LPMs. Switch between Fitness and
          Precision metrics.
        </DialogDescription>
      </DialogHeader>
      {/* Switch between Fitness and Precision */}
      <div className="flex items-center space-x-4 mt-4">
        <Label htmlFor="fitness-switch-dialog">Fitness</Label>
        <Switch
          id="fitness-switch-dialog"
          checked={isFitness}
          onCheckedChange={(checked) => setIsFitness(checked)}
        />
      </div>
      {/* Dialog Body */}
      <div className="mt-6 overflow-auto max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Set A LPM
              </th>
              <th className="px-6 py-3"></th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Set B LPM
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {lpmA?.name ?? 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(valueA ?? 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {winner && (
                      <span
                        className={`font-semibold ${
                          winner === 'A'
                            ? 'text-teal-600'
                            : winner === 'B'
                              ? 'text-orange-600'
                              : 'text-gray-500'
                        }`}
                      >
                        {winner === 'Tie' ? 'Tie' : `Winner: ${winner}`}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="font-medium text-gray-900">
                      {lpmB?.name ?? 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(valueB ?? 0).toFixed(2)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <DialogFooter>
        <Button type="button">Close</Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function RankingDetailsDialog({
  rankingIds,
  lpmsA,
  lpmsB,
  isFitness: initialIsFitness,
}: {
  rankingIds: {
    side: number;
    id: string;
  }[];
  lpmsA: LocalProcessModel[];
  lpmsB: LocalProcessModel[];
  isFitness: boolean;
}) {
  const [isFitness, setIsFitness] = useState(initialIsFitness);

  // Synchronize local isFitness with initialIsFitness
  useEffect(() => {
    setIsFitness(initialIsFitness);
  }, [initialIsFitness]);

  const getLPMById = (id: string, lpms: LocalProcessModel[]) =>
    lpms.find((lpm) => lpm.id === id);

  const getLPM = (rankItem: { side: number; id: string }) =>
    rankItem.side === 1
      ? getLPMById(rankItem.id, lpmsA)
      : getLPMById(rankItem.id, lpmsB);

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Ranking Details</DialogTitle>
        <DialogDescription>
          View the detailed ranking of LPMs. Switch between Fitness and
          Precision metrics.
        </DialogDescription>
      </DialogHeader>
      {/* Switch between Fitness and Precision */}
      <div className="flex items-center space-x-4 mt-4">
        <Label htmlFor="fitness-switch-ranking-dialog">Fitness</Label>
        <Switch
          id="fitness-switch-ranking-dialog"
          checked={isFitness}
          onCheckedChange={(checked) => setIsFitness(checked)}
        />
      </div>
      {/* Dialog Body */}
      <div className="mt-6 overflow-auto max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LPM Name
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isFitness ? 'Fitness' : 'Precision'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rankingIds.map((rankItem, idx) => {
              const lpm = getLPM(rankItem);
              const value = isFitness ? lpm?.fitness : lpm?.precision;
              const setColor =
                rankItem.side === 1 ? 'text-teal-600' : 'text-orange-600';

              return (
                <tr key={idx} className="text-sm">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className={`px-4 py-2 ${setColor}`}>
                    <div className="font-medium">{lpm?.name ?? 'N/A'}</div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {(value ?? 0).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <DialogFooter>
        <Button type="button">Close</Button>
      </DialogFooter>
    </DialogContent>
  );
}
