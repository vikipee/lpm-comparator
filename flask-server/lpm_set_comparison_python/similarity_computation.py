from .lpm import LPM, LPMSet
from typing import List, Callable
import numpy as np
from scipy.optimize import linear_sum_assignment
from difflib import SequenceMatcher
from pm4py.algo.clustering.trace_attribute_driven.leven_dist.leven_dist_calc import leven_preprocess

def compute_trace_similarity_perfect(lpm_a: LPM, lpm_b: LPM):
    traces_a = lpm_a.get_traces()
    traces_b = lpm_b.get_traces()

    union_traces = traces_a.union(traces_b)
    intersection_traces = traces_a.intersection(traces_b)

    return len(intersection_traces) / len(union_traces)

def compute_trace_similarity_leven(lpm_a: LPM, lpm_b: LPM):
    traces_a = lpm_a.get_traces()
    traces_b = lpm_b.get_traces()

    if len(traces_a) == 0 or len(traces_b) == 0:
        return 0

    similarity_matrix = np.zeros((len(traces_a), len(traces_b)))

    for i, trace_a in enumerate(traces_a):
        for j, trace_b in enumerate(traces_b):
                str1, str2 = leven_preprocess(list(trace_a), list(trace_b))
                normalized_inverted_levenshtein = SequenceMatcher(None, str1, str2).ratio()
                similarity_matrix[i, j] = normalized_inverted_levenshtein
    
    row_ind, col_ind = linear_sum_assignment(similarity_matrix, maximize=True)
    trace_gain = similarity_matrix[row_ind, col_ind].sum()

    return 2 * trace_gain / (len(traces_a) + len(traces_b))

def compute_eventually_follows_similarity(lpm_a: LPM, lpm_b: LPM):
    eventually_follows_a = lpm_a.get_eventually_follows_set()
    eventually_follows_b = lpm_b.get_eventually_follows_set()

    intersection_eventually_follows = eventually_follows_a.intersection(eventually_follows_b)

    denominator =  (len(eventually_follows_a) + len(eventually_follows_b))
    if denominator == 0:
        return 0

    return 2 * len(intersection_eventually_follows) / denominator

def compute_pairwise_similarity_measures(set_a: LPMSet, set_b: LPMSet, similarity_fn: Callable[[LPM, LPM], float]):
    similarity_matrix = []

    for lpm_a in set_a.lpms:
        row = []
        for lpm_b in set_b.lpms:
            trace_similarity = similarity_fn(lpm_a, lpm_b)
            row.append(trace_similarity)
        similarity_matrix.append(row)
    
    return similarity_matrix

def compute_similarity_measures(set_a: LPMSet, set_b: LPMSet):
    #print(compute_trace_similarity_leven(set_a.lpms[0], set_b.lpms[0]))
    print(np.array(compute_pairwise_similarity_measures(set_a, set_b, compute_eventually_follows_similarity)))
    print(np.array(compute_pairwise_similarity_measures(set_a, set_b, compute_trace_similarity_leven)))