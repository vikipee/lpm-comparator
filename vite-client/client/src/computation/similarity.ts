import { SimilarityMeasure } from '@/components/SimilaritySelection';
import { ReportData } from '@/types/Report';

export function getSimilarLPMs(
  report: ReportData,
  side: number,
  lpmIdx: number,
  threshold: number,
  similarityMeasure: SimilarityMeasure,
) {
  const similarityData = report.similarity?.[similarityMeasure];

  const similarityMatrix =
    typeof similarityData === 'object' ? similarityData.matrix : undefined;

  if (!similarityMatrix) {
    return [];
  }

  const similarityVals =
    side === 1
      ? similarityMatrix?.[lpmIdx]
      : similarityMatrix?.map((row) => row[lpmIdx]);

  if (!similarityVals) return [];

  const lpms = side === 1 ? report.lpms_b : report.lpms_a;

  const mostSimilar = similarityVals
    .map((similarity, idx) => ({
      lpm_id: lpms[idx].id,
      name: lpms[idx].name,
      similarity,
    }))
    .filter((sim) => sim.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);

  return mostSimilar;
}

export function getDataForVennDiagram(
  similarityMatrix: number[][],
  threshold: number,
) {
  // Calculate the number of elements that are only in one set and the intersection.
  // An LPM is considered to be in the intersection if there is an LPM in the other set, which has a similarity greater than or equal to the threshold.
  let numSetA = 0;
  let numSetB = 0;
  let numIntersection = 0;

  for (let i = 0; i < similarityMatrix.length; i++) {
    const row = similarityMatrix[i];
    const hasSimilarInB = row.some((similarity) => similarity >= threshold);
    if (hasSimilarInB) {
      numIntersection++;
    } else {
      numSetA++;
    }
  }

  for (let j = 0; j < similarityMatrix[0].length; j++) {
    const col = similarityMatrix.map((row) => row[j]);
    const hasSimilarInA = col.some((similarity) => similarity >= threshold);
    if (hasSimilarInA) {
      numIntersection++;
    } else {
      numSetB++;
    }
  }

  return { numSetA, numIntersection, numSetB };
}
