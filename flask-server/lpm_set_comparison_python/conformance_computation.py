from .lpm import LPMSet, LPM
from pm4py.objects.log.obj import EventLog
from typing import Tuple, List
import numpy as np
import pm4py
from lpm_set_comparison_python import utils
import concurrent.futures
from functools import partial
import time

def compute_conformance_measures(set_a: LPMSet, set_b: LPMSet, event_log: EventLog):
    traces = utils.get_traces_from_event_log(event_log)

    coverage_a, duplicate_coverage_a, coverage_b, duplicate_coverage_b = 0, 0, 0, 0


    coverage_a, duplicate_coverage_a = compute_event_coverage(traces, set_a)
    print("Coverage A: ", coverage_a)
    coverage_b, duplicate_coverage_b = compute_event_coverage(traces, set_b)
    print("Coverage B: ", coverage_b)
    
    fitness_precision_values_a = []
    fitness_precision_values_b = []

    partial_fitness_precision_on_traces = partial(compute_fitness_precision_on_subtraces, traces=traces)
    with concurrent.futures.ProcessPoolExecutor(max_workers=10) as executor:
            print("Start computing fitness and precision values for set A")
            start_time = time.time()
            fitness_precision_values_a = list(executor.map(partial_fitness_precision_on_traces, set_a.lpms))
            end_time = time.time()
            print(f"Computing time in seconds: {(end_time - start_time)}")

            print("Start computing fitness and precision values for set B")
            start_time = time.time()
            fitness_precision_values_b = list(executor.map(partial_fitness_precision_on_traces, set_b.lpms))
            end_time = time.time()
            print(f"Computing time in seconds: {(end_time - start_time)}")
    
    
    results = {
        "coverage_a": coverage_a,
        "duplicate_coverage_a": duplicate_coverage_a,
        "fitness_precision_values_a": fitness_precision_values_a,
        "coverage_b": coverage_b,
        "duplicate_coverage_b": duplicate_coverage_b,
        "fitness_precision_values_b": fitness_precision_values_b
    }
    return results

def compute_event_coverage(traces: List[Tuple[str]], lpms: LPMSet):
    trace_events_coverage = compute_replayable_events_on_log(traces, lpms)
    #print(f"\n\nTrace events coverage: {trace_events_coverage}\n---------------------------------------------------\n\n")
    total_events = 0
    total_covered_events = 0
    total_duplicate_events = 0
    for trace_coverage in trace_events_coverage:

        covered_events = np.where(trace_coverage >= 1, 1, 0).sum()
        duplicate_coverage = np.where(trace_coverage > 1, 1, 0).sum()

        total_events += len(trace_coverage)
        total_covered_events += covered_events
        total_duplicate_events += duplicate_coverage
    
    if total_events == 0:
        return 0, 0
    coverage = total_covered_events / total_events
    duplicate_coverage = total_duplicate_events / total_events

    return coverage, duplicate_coverage

def compute_replayable_events_on_log(traces: List[Tuple[str]], lpms: LPMSet):
    trace_events_coverage = None
    for lpm in lpms.lpms:
        if trace_events_coverage is None:
            trace_events_coverage = compute_replayable_events_on_log_model(traces, lpm)
        else:
            replayable_events = compute_replayable_events_on_log_model(traces, lpm)
            for i, trace_coverage in enumerate(replayable_events):
                trace_events_coverage[i] += trace_coverage

    return trace_events_coverage

def compute_replayable_events_on_log_model(log: List[Tuple[str]], model: LPM):
    covered_events = []
    total_events = 0
    total_covered_events = 0
    for trace in log:
        covered_events.append(compute_replayable_events_on_trace_model(trace, model))
        total_events += len(trace)
        total_covered_events += covered_events[-1].sum()
    model.coverage = total_covered_events / total_events
    print(f"Model coverage: {model.coverage}")
    return covered_events

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

def compute_fitness_precision_on_subtraces(model: LPM, traces):
    subtraces = utils.get_subtraces_for_model(traces, model)

    if len(subtraces) == 0:
        model.fitness = 0
        model.precision = 0
        return 0, 0
    
    print(f"Length of subtraces: {len(subtraces)}")
    print(f"Number variants: {len(set(subtraces))}")

    event_log = utils.create_event_log_from_traces(list(set(subtraces)))

    #fitness =  pm4py.fitness_alignments(event_log, model.net, model.im, model.fm)["averageFitness"]
    #precision = pm4py.precision_alignments(event_log, model.net, model.im, model.fm)

    #fitness =  pm4py.conformance.fitness_footprints(event_log, model.net, model.im, model.fm)
    #precision = pm4py.conformance.precision_footprints(event_log, model.net, model.im, model.fm)

    #fitness = pm4py.conformance.fitness_alignments(event_log, model.net, model.im, model.fm)
    #precision = pm4py.conformance.precision_alignments(event_log, model.net, model.im, model.fm)

    fitness = pm4py.conformance.fitness_token_based_replay(event_log, model.net, model.im, model.fm)["log_fitness"]
    precision = pm4py.conformance.precision_token_based_replay(event_log, model.net, model.im, model.fm)
    model.fitness = fitness
    model.precision = precision

    return fitness, precision

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