import { ReportData } from "@/types/Report";

export function getSimilarLPMs(report: ReportData, side: number, lpmIdx: number, threshold: number, ) {
    const similarityMatrix = report.similarity?.trace_similarity?.matrix;

    const similarityVals = side === 1 ? similarityMatrix?.[lpmIdx] : similarityMatrix?.map(row => row[lpmIdx]);
    
    if (!similarityVals) return [];

    const lpms = side === 1 ? report.lpms_b : report.lpms_a;

    const mostSimilar = similarityVals
        .map((similarity, idx) => ({ lpm_id: lpms[idx].id, name: lpms[idx].name, similarity }))
        .filter(sim => sim.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity);

    return mostSimilar;
}