export type similarityMatrix = number[][];

export interface SimilarityMeasures {
  trace_similarity?: {
    overall: number;
    matrix: similarityMatrix;
  };
  eventually_follows_similarity?: {
    overall: number;
    matrix: similarityMatrix;
  };
  trace_similarity_perfect?: {
    overall: number;
    matrix: similarityMatrix;
  };
  transition_adjacency_similarity?: {
    overall: number;
    matrix: similarityMatrix;
  };
}

export interface DominanceCount {
  dom_count_a?: number;
  dom_count_b?: number;
  matching: [string, string][];
}

interface Evaluation {
  dominance_counting?: {
    leven_sym?: DominanceCount;
    leven_asym_1?: DominanceCount;
    leven_asym_2?: DominanceCount;
  };
  rank_aggregation?: {
    rank_sum_a?: number;
    rank_sum_b?: number;
    normalized_rank_sum_a?: number;
    normalized_rank_sum_b?: number;
    ranking_ids?: {
      side: number;
      id: string;
      rank: number;
    }[];
  };
}

export interface LocalProcessModel {
  id: string;
  name: string;
  fitness: number;
  precision: number;
  coverage: number;
  index: number;
}

export interface Trace {
  trace: string;
  coverage_a: number;
  coverage_b: number;
  duplicate_coverage_a: number;
  duplicate_coverage_b: number;
  id: number;
}

export interface ReportData {
  message?: string;
  similarity?: SimilarityMeasures;
  coverage?: {
    coverage_a: number;
    duplicate_coverage_a: number;
    coverage_b: number;
    duplicate_coverage_b: number;
    trace_coverages?: Trace[];
  };
  fitness_evaluation?: Evaluation;
  precision_evaluation?: Evaluation;
  lpms_a: LocalProcessModel[];
  lpms_b: LocalProcessModel[];
  event_log?: string[][];
}
