from .lpm import LPMSet, LPM
from pm4py.objects.log.obj import EventLog
from typing import Tuple
import numpy as np

def compute_conformance_measures(set_a: LPMSet, set_b: LPMSet, event_log: EventLog):
    coverage_a, duplicate_coverage_a = compute_event_coverage(event_log, set_a)
    coverage_b, duplicate_coverage_b = compute_event_coverage(event_log, set_b)

    results = {
        "coverage_a": coverage_a,
        "duplicate_coverage_a": duplicate_coverage_a,
        "coverage_b": coverage_b,
        "duplicate_coverage_b": duplicate_coverage_b
    }
    return results

def compute_event_coverage(event_log: EventLog, lpms: LPMSet):
    trace_events_coverage = compute_replayable_events_on_log(event_log, lpms)
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

def compute_replayable_events_on_log(event_log: EventLog, lpms: LPMSet):
    traces = get_traces_from_event_log(event_log)
    trace_events_coverage = [None] * len(traces)
    for i, trace in enumerate(traces):
        trace_events_coverage[i] = compute_replayable_events_on_trace_set(trace, lpms)

def compute_replayable_events_on_trace_set(trace: Tuple[str], lpms: LPMSet):
    covered_events = np.zeros(len(trace))

    for lpm in lpms.lpms:
        covered_events += compute_replayable_events_on_trace_model(trace, lpm)

    return covered_events

def compute_replayable_events_on_trace_model(trace: Tuple[str], model: LPM):
    covered_events = np.zeros(len(trace))

    projected_trace = get_projected_trace_on_model(trace, model)

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
        if trace[event_idx] not in lpm_trace:
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

                    while trace[cur_trace_idx] != lpm_event:
                        cur_trace_idx += 1

                    if trace[cur_trace_idx] != lpm_event or cur_trace_idx == event_idx:
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

def get_traces_from_event_log(event_log: EventLog):
    traces = []
        
    for trace in event_log:
        trace_events = [event['concept:name'] for event in trace]
        traces.append(tuple(trace_events))
    
    return traces

def get_projected_trace_on_model(trace: Tuple[str], model: LPM):
    model_activities = [transition.label for transition in model.net.transitions]
    print(model_activities)
    
    projected_trace = []
    for event in trace:
        if event in model_activities:
            projected_trace.append(event)
        else:
            projected_trace.append(None)

    return tuple(projected_trace)

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