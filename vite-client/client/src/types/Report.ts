type pair = [number, number]

export type similarityMatrix = number[][]

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
    a_subset_b?: boolean;
    b_subset_a?: boolean;
    matchings?: {
        leven_sym? : pair[];
        leven_asym_1? : pair[];
        leven_asym_2? : pair[];
        overall?: 0;
        matrix?: undefined;
    };
}

export interface Aggregation {
    weighted_harmonic_mean?: pair;
    arithmetic_avg?: pair;
    geometric_mean?: pair;
    harmonic_mean?: pair;
    weighted_arithmetic_avg?: pair;
    weighted_geometric_mean?: pair;
}

interface Evaluation {
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

export interface LocalProcessModel {
    id: string;
    name: string;
    fitness: number;
    precision: number;
    coverage: number;
    index: number;
}

export interface ReportData {
    message?: string;
    similarity?: SimilarityMeasures;
    coverage?: {
        coverage_a: number;
        duplicate_coverage_a: number;
        coverage_b: number;
        duplicate_coverage_b: number;
        trace_coverages?: {
            trace: string;
            coverage_a: number;
            coverage_b: number;
        }[];
    };
    fitness_aggregation?: Aggregation;
    precision_aggregation?: Aggregation;
    fitness_evaluation?: Evaluation;
    precision_evaluation?: Evaluation;
    lpms_a: LocalProcessModel[];
    lpms_b: LocalProcessModel[];
    event_log?: string[][];
}