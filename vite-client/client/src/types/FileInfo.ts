export interface FileInfo {
    name: string
    size: number
    type: string
    id: string
    file: File
  }

type pair = [number, number]

interface SimilarityMeasures {
    trace_similarity?: number;
    eventually_follows_similarity?: number;
    trace_similarity_perfect?: number;
    a_subset_b?: boolean;
    b_subset_a?: boolean;
    matchings?: {
        leven_sym? : pair[];
        leven_asym_1? : pair[];
        leven_asym_2? : pair[];
    };
}

interface Coverage {
    coverage_a?: number;
    duplicate_coverage_a?: number;
    model_coverage_a?: number[];
    coverage_b?: number;
    duplicate_coverage_b?: number;
    model_coverage_b?: number[];
}

interface Conformance {
    fitness_precision_values_a?: pair[];
    fitness_precision_values_b?: pair[];
}

interface Aggregation {
    weighted_harmonic_mean?: pair;
    dominance_counting?: {
        leven_sym?: pair;
        leven_asym_1?: pair;
        leven_asym_2?: pair;
    };
    rank_aggregation?: {
        rank_sum_a?: number;
        rank_sum_b?: number;
        normalized_rank_sum_a?: number;
        normalized_rank_sum_b?: number;
    };
}

export interface ReportData {
    xes?: string;
    similarity?: SimilarityMeasures;
    coverage?: Coverage;
    conformance?: Conformance;
    fitness_aggregation?: Aggregation;
    precision_aggregation?: Aggregation;
}
