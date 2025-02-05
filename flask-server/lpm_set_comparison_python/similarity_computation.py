import random
from .lpm import LPM, LPMSet
from typing import Callable
import numpy as np
from scipy.optimize import linear_sum_assignment
from difflib import SequenceMatcher
from pm4py.algo.clustering.trace_attribute_driven.leven_dist.leven_dist_calc import leven_preprocess
import networkx as nx
from .utils import graph_edit_distance
import time

def compute_trace_similarity_perfect(lpm_a: LPM | LPMSet, lpm_b: LPM | LPMSet):
    traces_a = lpm_a.get_traces()
    traces_b = lpm_b.get_traces()

    union_traces = traces_a.union(traces_b)
    intersection_traces = traces_a.intersection(traces_b)

    return len(intersection_traces) / len(union_traces)

def compute_trace_similarity_leven(lpm_a: LPM | LPMSet, lpm_b: LPM | LPMSet):
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

def compute_eventually_follows_similarity(lpm_a: LPM | LPMSet, lpm_b: LPM | LPMSet):
    eventually_follows_a = lpm_a.get_eventually_follows_set()
    eventually_follows_b = lpm_b.get_eventually_follows_set()

    intersection_eventually_follows = eventually_follows_a.intersection(eventually_follows_b)

    denominator =  (len(eventually_follows_a) + len(eventually_follows_b))
    if denominator == 0:
        return 0

    return 2 * len(intersection_eventually_follows) / denominator

def compute_transition_adjancency_similarity(lpm_a: LPM | LPMSet, lpm_b: LPM | LPMSet):
    tar_a = lpm_a.get_transition_adjacency_set()
    tar_b = lpm_b.get_transition_adjacency_set()

    intersection_tar = tar_a.intersection(tar_b)

    denominator =  (len(tar_a) + len(tar_b))
    if denominator == 0:
        return 0
    
    return 2 * len(intersection_tar) / denominator

def compute_normalized_ged_sim(lpm_a: LPM, lpm_b: LPM, timeout=0.5):
    g1 = lpm_a.get_graph()
    g2 = lpm_b.get_graph()
    
    ged = graph_edit_distance(g1, g2, timeout=timeout)
    ged_g1_empty = graph_edit_distance(g1, nx.empty_graph(), timeout=timeout)
    ged_g2_empty = graph_edit_distance(g2, nx.empty_graph(), timeout=timeout)

    if ged is None or ged_g1_empty is None or ged_g2_empty is None:
        return 0

    return 1- ( ged / (ged_g1_empty + ged_g2_empty))

def compute_pairwise_similarity_measures(set_a: LPMSet, set_b: LPMSet, similarity_fn: Callable[[LPM, LPM], float]):
    similarity_matrix = []

    for lpm_a in set_a.lpms:
        row = []
        for lpm_b in set_b.lpms:
            similarity = similarity_fn(lpm_a, lpm_b)
            row.append(similarity)
        similarity_matrix.append(row)
    
    return similarity_matrix

def check_subset(similarity_matrix: np.ndarray, sim_threshold= 0.9, subset_threshold=1):
    #Returns (Bool, Bool), where the first element is True if the first set is a subset of the second set, and the second element is True if the second set is a subset of the first set.
    sm = similarity_matrix.copy()
    
    row_max = np.max(sm, axis=1)
    col_max = np.max(sm, axis=0)

    row_max = np.where(row_max > sim_threshold, 1, 0)
    col_max = np.where(col_max > sim_threshold, 1, 0)

    row_ratio = np.sum(row_max) / len(row_max)
    col_ratio = np.sum(col_max) / len(col_max)

    return row_ratio >= subset_threshold, col_ratio >= subset_threshold

def create_symmetric_optimal_matching(similarity_matrix: np.ndarray):
    """Creates a symmetric optimal matching from a similarity matrix
        Returns a list of tuples, where each tuple is a pair of indices that are matched.
    """
    row_ind, col_ind = linear_sum_assignment(similarity_matrix, maximize=True)
    return list(zip(row_ind.tolist(), col_ind.tolist()))

def create_asymmetric_optimal_matching(similarity_matrix: np.ndarray):
    """Creates an asymmetric optimal matching from a similarity matrix
        Returns a list of tuples, where each tuple is a pair of indices that are matched.
        Each row is matched to the column with the highest similarity.
    """
    matches = []
    for i in range(similarity_matrix.shape[0]):
        j = int(np.argmax(similarity_matrix[i]))
        matches.append((i, j))
    return matches

    

def compute_similarity_measures(set_a: LPMSet, set_b: LPMSet):
    #print(compute_trace_similarity_leven(set_a.lpms[0], set_b.lpms[0]))
    #print(np.array(compute_pairwise_similarity_measures(set_a, set_b, compute_eventually_follows_similarity)))
    #print(np.array(compute_pairwise_similarity_measures(set_a, set_b, compute_trace_similarity_leven)))
    #print(compute_trace_similarity_leven(set_a, set_b))
    #print(compute_eventually_follows_similarity(set_a, set_b))
    #print(compute_trace_similarity_perfect(set_a, set_b))

    print("Computing similarity measures")
    time_1 = time.perf_counter()
    similarity_matrix_leven = compute_pairwise_similarity_measures(set_a, set_b, compute_trace_similarity_leven)
    time_2 = time.perf_counter()
    overall_trace_sim = compute_trace_similarity_leven(set_a, set_b),
    time_3 = time.perf_counter()
    print("Computed trace similarity")
    similarity_matrix_eventually_follows = compute_pairwise_similarity_measures(set_a, set_b, compute_eventually_follows_similarity)
    time_4 = time.perf_counter()
    overall_eventually_follows_sim = compute_eventually_follows_similarity(set_a, set_b)
    time_5 = time.perf_counter()
    print("Computing trace similarity perfect")
    similarity_matrix_perfect = compute_pairwise_similarity_measures(set_a, set_b, compute_trace_similarity_perfect)
    time_6 = time.perf_counter()
    overall_perfect_sim = compute_trace_similarity_perfect(set_a, set_b)
    time_7 = time.perf_counter()
    print("Computed trace similarity perfect")
    similarity_matrix_tar = compute_pairwise_similarity_measures(set_a, set_b, compute_transition_adjancency_similarity)
    time_8 = time.perf_counter()
    overall_tar_sim = compute_transition_adjancency_similarity(set_a, set_b)
    time_9 = time.perf_counter()

    print("\n\n\n\nComputing GED similarity")
    similarity_matrix_ged = compute_pairwise_similarity_measures(set_a, set_b, compute_normalized_ged_sim)
    time_10 = time.perf_counter()

    #Estimate ged time without timeout
    time_for_approx_ged = 0
    for i in range(10):
        random_lpm_a = set_a.lpms[random.randint(0, len(set_a.lpms)-1)]
        random_lpm_b = set_b.lpms[random.randint(0, len(set_b.lpms)-1)]
        time_start = time.perf_counter()
        compute_normalized_ged_sim(random_lpm_a, random_lpm_b, timeout=600)
        time_for_approx_ged += time.perf_counter() - time_start
    time_for_approx_ged /= 10
    time_for_approx_ged *= (len(set_a.lpms) * len(set_b.lpms))

    #Create matchings
    matchings = {}
    similarity_matrix_leven_np = np.array(similarity_matrix_leven)
    matchings["leven_sym"] = create_symmetric_optimal_matching(similarity_matrix_leven_np)
    matchings["leven_asym_1"] = create_asymmetric_optimal_matching(similarity_matrix_leven_np)
    #matchings["leven_asym_2"] = create_asymmetric_optimal_matching(simlarity_matrix_leven.T)
    
    results = {
        "trace_similarity": {
            "overall": overall_trace_sim,
            "matrix": similarity_matrix_leven
        },
        "eventually_follows_similarity": {
            "overall": overall_eventually_follows_sim,
            "matrix": similarity_matrix_eventually_follows
        },
        "trace_similarity_perfect": {
            "overall": overall_perfect_sim,
            "matrix": similarity_matrix_perfect
        },
        "transition_adjacency_similarity": {
            "overall": overall_tar_sim,
            "matrix": similarity_matrix_tar
        },
        "ged_similarity": {
            "matrix": similarity_matrix_ged
        }
    }

    times = {
        "trace_similarity": time_2 - time_1,
        "overall_trace_sim": time_3 - time_2,
        "eventually_follows_similarity": time_4 - time_3,
        "overall_eventually_follows_sim": time_5 - time_4,
        "trace_similarity_perfect": time_6 - time_5,
        "overall_trace_sim_perfect": time_7 - time_6,
        "transition_adjacency_similarity": time_8 - time_7,
        "overall_tar_sim": time_9 - time_8,
        "ged_similarity_capped": time_10 - time_9,
        "approx_ged": time_for_approx_ged
    }

    return results, matchings, times