import concurrent.futures
import time

from matplotlib import use
from .lpm import LPMSet, LPM
from typing import Tuple, List
import numpy as np
import pm4py
from lpm_set_comparison_python import utils
from functools import partial

def compute_coverage_multi_processing_setwise(set: LPMSet, traces: List[Tuple[str]], executor: concurrent.futures.ProcessPoolExecutor):
    partial_model_coverage = partial(compute_model_coverage, traces=traces)
    model_coverage_and_masks = list(executor.map(partial_model_coverage, set.lpms))
    events_covered, model_coverage = zip(*model_coverage_and_masks)
    return compute_coverage_from_masks(events_covered), model_coverage
    

def compute_coverage_multi_processing(set_a: LPMSet, set_b: LPMSet, traces: List[Tuple[str]], executor: concurrent.futures.ProcessPoolExecutor):
    time_1 = time.perf_counter()
    (coverage_a, duplicate_coverage_a, trace_coverages_a, combined_mask_a), model_coverage_a = compute_coverage_multi_processing_setwise(set_a, traces, executor)
    time_2 = time.perf_counter()
    (coverage_b, duplicate_coverage_b, trace_coverages_b, combined_mask_b), model_coverage_b = compute_coverage_multi_processing_setwise(set_b, traces, executor)
    time_3 = time.perf_counter()

    variants_idx = utils.get_indices_of_variants(traces)
    variants = [", ".join(traces[i]) for i in variants_idx]

    short_trace_strings = [utils.get_short_trace_string(trace) for trace in traces]

    trace_coverages = [{"id": i, "trace": short_trace_strings[i],"coverage_a": trace_coverages_a[i][0], "duplicate_coverage_a": trace_coverages_a[i][1], "coverage_b": trace_coverages_b[i][0], "duplicate_coverage_b": trace_coverages_b[i][1],} for i in variants_idx]
    
    coverages = {
        "coverage_a": coverage_a,
        "duplicate_coverage_a": duplicate_coverage_a,
        "model_coverage_a": model_coverage_a,
        "coverage_b": coverage_b,
        "duplicate_coverage_b": duplicate_coverage_b,
        "model_coverage_b": model_coverage_b,
        "trace_coverages": trace_coverages
    }

    masks = {
        "mask_a": combined_mask_a,
        "mask_b": combined_mask_b
    }

    for i, lpm in enumerate(set_a.lpms):
        lpm.coverage = model_coverage_a[i]
    
    for i, lpm in enumerate(set_b.lpms):
        lpm.coverage = model_coverage_b[i]

    times = {
        "model_coverage_a": time_2 - time_1,
        "model_coverage_b": time_3 - time_2
    }

    return coverages, masks, variants, times    

def compute_coverage(set_a: LPMSet, set_b: LPMSet, traces: List[Tuple[str]]):
    coverage_a, duplicate_coverage_a, coverage_b, duplicate_coverage_b = 0, 0, 0, 0
    partial_model_coverage = partial(compute_model_coverage, traces=traces)

    time_1 = time.perf_counter()
    events_covered_a, model_coverage_a = zip(*list(map(partial_model_coverage, set_a.lpms)))
    coverage_a, duplicate_coverage_a, trace_coverages_a, combined_mask_a = compute_coverage_from_masks(events_covered_a)
    time_2 = time.perf_counter()

    events_covered_b, model_coverage_b = zip(*list(map(partial_model_coverage, set_b.lpms)))
    coverage_b, duplicate_coverage_b, trace_coverages_b, combined_mask_b = compute_coverage_from_masks(events_covered_b)
    time_3 = time.perf_counter()

    variants_idx = utils.get_indices_of_variants(traces)
    variants = [", ".join(traces[i]) for i in variants_idx]

    short_trace_strings = [utils.get_short_trace_string(trace) for trace in traces]

    trace_coverages = [{"id": i, "trace": short_trace_strings[i],"coverage_a": trace_coverages_a[i][0], "duplicate_coverage_a": trace_coverages_a[i][1], "coverage_b": trace_coverages_b[i][0], "duplicate_coverage_b": trace_coverages_b[i][1],} for i in variants_idx]
    
    results = {
        "coverage_a": coverage_a,
        "duplicate_coverage_a": duplicate_coverage_a,
        "model_coverage_a": model_coverage_a,
        "coverage_b": coverage_b,
        "duplicate_coverage_b": duplicate_coverage_b,
        "model_coverage_b": model_coverage_b,
        "trace_coverages": trace_coverages
    }

    masks = {
        "mask_a": combined_mask_a,
        "mask_b": combined_mask_b
    }

    times = {
        "model_coverage_a": time_2 - time_1,
        "model_coverage_b": time_3 - time_2
    }

    return results, masks, variants, times

def compute_conformance_measures_multi_processing(set_a: LPMSet, set_b: LPMSet, traces: List[Tuple[str]], executor: concurrent.futures.ProcessPoolExecutor, use_TBR=True):
    partial_fitness_precision_on_traces = partial(compute_fitness_precision_on_subtraces, traces=traces, use_TBR=use_TBR)
    time_1 = time.perf_counter()
    fitness_precision_a = list(executor.map(partial_fitness_precision_on_traces, set_a.lpms))
    time_2 = time.perf_counter()
    fitness_precision_b = list(executor.map(partial_fitness_precision_on_traces, set_b.lpms))
    time_3 = time.perf_counter()

    for i, lpm in enumerate(set_a.lpms):
        lpm.fitness = fitness_precision_a[i][0]
        lpm.precision = fitness_precision_a[i][1]
    
    for i, lpm in enumerate(set_b.lpms):
        lpm.fitness = fitness_precision_b[i][0]
        lpm.precision = fitness_precision_b[i][1]

    fitness_times_a = [val[2] for val in fitness_precision_a]
    avg_fitness_time_a = sum(fitness_times_a) / len(fitness_times_a)
    precision_times_a = [val[3] for val in fitness_precision_a]
    avg_precision_time_a = sum(precision_times_a) / len(precision_times_a)
    fitness_times_b = [val[2] for val in fitness_precision_b]
    avg_fitness_time_b = sum(fitness_times_b) / len(fitness_times_b)
    precision_times_b = [val[3] for val in fitness_precision_b]
    avg_precision_time_b = sum(precision_times_b) / len(precision_times_b)

    times = {
        "fitness_precision_a": time_2 - time_1,
        "fitness_precision_b": time_3 - time_2,
        "avg_fitness_time_a": avg_fitness_time_a,
        "avg_precision_time_a": avg_precision_time_a,
        "avg_fitness_time_b": avg_fitness_time_b,
        "avg_precision_time_b": avg_precision_time_b,
        "fitness_times_a": fitness_times_a,
        "precision_times_a": precision_times_a,
        "fitness_times_b": fitness_times_b,
        "precision_times_b": precision_times_b
    }

    return times

def compute_conformance_measures(set_a: LPMSet, set_b: LPMSet, traces: List[Tuple[str]], use_TBR=True):
    partial_fitness_precision_on_traces = partial(compute_fitness_precision_on_subtraces, traces=traces, use_TBR=use_TBR)

    time_1 = time.perf_counter()
    fitness_precision_a = list(map(partial_fitness_precision_on_traces, set_a.lpms))
    time_2 = time.perf_counter()
    fitness_precision_b = list(map(partial_fitness_precision_on_traces, set_b.lpms))
    time_3 = time.perf_counter()
    
    fitness_times_a = [val[2] for val in fitness_precision_a]
    avg_fitness_time_a = sum(fitness_times_a) / len(fitness_times_a)
    precision_times_a = [val[3] for val in fitness_precision_a]
    avg_precision_time_a = sum(precision_times_a) / len(precision_times_a)
    fitness_times_b = [val[2] for val in fitness_precision_b]
    avg_fitness_time_b = sum(fitness_times_b) / len(fitness_times_b)
    precision_times_b = [val[3] for val in fitness_precision_b]
    avg_precision_time_b = sum(precision_times_b) / len(precision_times_b)

    times = {
        "fitness_precision_a": time_2 - time_1,
        "fitness_precision_b": time_3 - time_2,
        "avg_fitness_time_a": avg_fitness_time_a,
        "avg_precision_time_a": avg_precision_time_a,
        "avg_fitness_time_b": avg_fitness_time_b,
        "avg_precision_time_b": avg_precision_time_b,
        "fitness_times_a": fitness_times_a,
        "precision_times_a": precision_times_a,
        "fitness_times_b": fitness_times_b,
        "precision_times_b": precision_times_b
    }

    return times

def compute_coverage_from_masks(log_coverage_masks: List[List[np.ndarray]]):
    #Combine all masks
    combined_masks = None
    for mask in log_coverage_masks:
        if combined_masks is None:
            combined_masks = mask
        else:
            for i, trace_mask in enumerate(mask):
                combined_masks[i] += trace_mask
    
    total_events = 0
    total_covered_events = 0
    total_duplicate_events = 0
    trace_coverages = []
    for trace_coverage in combined_masks:

        covered_events = np.where(trace_coverage >= 1, 1, 0).sum()
        duplicate_coverage = np.where(trace_coverage > 1, 1, 0).sum()

        total_events += len(trace_coverage)
        total_covered_events += covered_events
        total_duplicate_events += duplicate_coverage
        
        if len(trace_coverage) > 0:
            single_trace_coverage = covered_events / len(trace_coverage)
            duplicate_trace_coverage = duplicate_coverage / len(trace_coverage)
            trace_coverages.append((single_trace_coverage, duplicate_trace_coverage))
        else:
            trace_coverages.append((0, 0))
    
    if total_events == 0:
        return 0, 0
    coverage = total_covered_events / total_events
    duplicate_coverage = total_duplicate_events / total_events

    return coverage, duplicate_coverage, trace_coverages, combined_masks

def compute_model_coverage(model: LPM, traces: List[Tuple[str]]):
    covered_events = []
    total_events = 0
    total_covered_events = 0
    for trace in traces:
        covered_events.append(compute_replayable_events_on_trace_model(trace, model))
        total_events += len(trace)
        total_covered_events += covered_events[-1].sum()
    model.coverage = total_covered_events / total_events
    print(f"Model coverage: {model.coverage}")
    return covered_events, model.coverage

def compute_replayable_events_on_trace_model(trace: Tuple[str], model: LPM):
    covered_events = np.zeros(len(trace))

    projected_trace = utils.get_projected_trace_on_model(trace, model)

    for i, event in enumerate(projected_trace):
        if event is not None and covered_events[i] == 0:
            # Check if the event can be relax replayed on the model
            replayable_indices = can_event_be_replayed_on_model(i, trace, model)
            if replayable_indices is not None:
                for index in replayable_indices:
                    covered_events[index] = 1

    return covered_events

def can_event_be_replayed_on_model(event_idx, trace: Tuple[str], model: LPM):
    #Check for all traces if the event can be replayed and stop as soon as it is possible
    #Always try if the next event could be the event_idx
    replayable_indices = set()
    for lpm_trace in model.get_traces():
        if lpm_trace is None or trace[event_idx] not in lpm_trace:
            continue

        cur_trace_idx = 0
        index_set = []
        last_trace_index_before_skip = None
        last_lpm_index_before_skip = None
        i = 0
        while i < len(lpm_trace):
            lpm_event = lpm_trace[i]
            if cur_trace_idx >= len(trace):
                if last_trace_index_before_skip is None:
                    index_set = []
                    break
                else:
                    index_set = index_set[:index_set.index(event_idx)]
                    cur_trace_idx = last_trace_index_before_skip
                    last_trace_index_before_skip = None
                    
                    while cur_trace_idx < len(trace) and trace[cur_trace_idx] != lpm_event:
                        cur_trace_idx += 1

                    if cur_trace_idx>= len(trace) or trace[cur_trace_idx] != lpm_event or cur_trace_idx == event_idx:
                        index_set = []
                        break

                    index_set.append(cur_trace_idx)
                    cur_trace_idx += 1
                    i += 1
                    continue

            if lpm_event == trace[event_idx] and cur_trace_idx <= event_idx:
                index_set.append(event_idx)
                if cur_trace_idx < event_idx:
                    last_trace_index_before_skip = cur_trace_idx
                    last_lpm_index_before_skip = i
                cur_trace_idx = event_idx + 1
                if cur_trace_idx >= len(trace) and last_lpm_index_before_skip is not None:
                    i = last_lpm_index_before_skip
                    continue
            else:
                while cur_trace_idx < len(trace) and trace[cur_trace_idx] != lpm_event:
                    cur_trace_idx += 1
                if cur_trace_idx >= len(trace):
                    if last_trace_index_before_skip is not None:
                        i = last_lpm_index_before_skip
                        continue
                    else:
                        index_set = []
                        break
                
                index_set.append(cur_trace_idx)
                cur_trace_idx += 1
            i += 1
                
        if len(index_set) > 0:
            replayable_indices.update(index_set)
        
        if event_idx in replayable_indices:
            return list(replayable_indices)
                
    return list(replayable_indices) 

def compute_fitness_precision_on_subtraces(model: LPM, traces, use_TBR=True):
    subtraces = utils.get_subtraces_for_model(traces, model)

    if len(subtraces) == 0:
        model.fitness = 0
        model.precision = 0
        return 0, 0
    
    print(f"Length of subtraces: {len(subtraces)}")
    print(f"Number variants: {len(set(subtraces))}")

    event_log = utils.create_event_log_from_traces(list(subtraces))

    if use_TBR:
        time_1 = time.perf_counter()
        fitness = pm4py.conformance.fitness_token_based_replay(event_log, model.net, model.im, model.fm)["log_fitness"]
        time_2 = time.perf_counter()
        precision = pm4py.conformance.precision_token_based_replay(event_log, model.net, model.im, model.fm)
        time_3 = time.perf_counter()
        model.fitness = fitness
        model.precision = precision
    else:
        time_1 = time.perf_counter()
        fitness =  pm4py.fitness_alignments(event_log, model.net, model.im, model.fm)["averageFitness"]
        time_2 = time.perf_counter()
        precision = pm4py.precision_alignments(event_log, model.net, model.im, model.fm)
        time_3 = time.perf_counter()
        model.fitness = fitness
        model.precision = precision

    #fitness =  pm4py.fitness_alignments(event_log, model.net, model.im, model.fm)["averageFitness"]
    #precision = pm4py.precision_alignments(event_log, model.net, model.im, model.fm)

    #fitness =  pm4py.conformance.fitness_footprints(event_log, model.net, model.im, model.fm)
    #precision = pm4py.conformance.precision_footprints(event_log, model.net, model.im, model.fm)

    #fitness = pm4py.conformance.fitness_alignments(event_log, model.net, model.im, model.fm)
    #precision = pm4py.conformance.precision_alignments(event_log, model.net, model.im, model.fm)
    

    return fitness, precision, time_2 - time_1, time_3 - time_2

"""
Replaying can either be done using standard replying techniques but on subsequences or as a relaxed replay. However, how do you then compute the coverage? All events that are part of a trace of a model.
So for relaxed replay: Instead of computing an alignment, we can filter all traces to contain that event


Isnt relaxed replay for calculating coverage the same as computing alignment? NO
If the event is in an synchronous moves in an alignment, then it can be relaxed replayed if there arent any move on model moves.
If the event can be relaxed replayed there can also always be an alignment, that just skips the event on th model whenever the event isnt contained in the relaxed subtrace.
However, it might not always be in the optimal alignment.

=> Do relaxed replay: Input: one trace, models, output the list of events that are part of an relaxed replay.
    Then this can be done for all traces and all models and return a dictionary where the key is the event and the value is the number of models that can relax replay the event.
    Then the coverage and duplicate coverage can be easily calculated.


    => Calculate all possible subsequences of a trace => Way to many??
    Other possibility: Go through all events of a trace (have dictionary (Events, Bool)) and try to relax replay subsequences of that trace. While doing that update the dictionary if another event can be relaxed replayed.
    Use log projections that only contain activities that are part of the model.
    Problem: Still in worst-case all subsequences of a trace have to be considered. => 2^n
    Heuristic: Maximum length of traces in model => So only consider subsequences of that twice that length.
"""