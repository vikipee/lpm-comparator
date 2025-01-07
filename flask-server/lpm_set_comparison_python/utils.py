from re import L
from pm4py.objects.log.obj import EventLog, Trace, Event
from typing import List, Tuple
from lpm_set_comparison_python.lpm import LPM

def create_event_log_from_traces(traces_list):
    event_log = EventLog()
    for trace_tuple in traces_list:
        trace = Trace()
        for activity in trace_tuple:
            if activity is None:
                continue
            event = Event({"concept:name": activity})
            trace.append(event)
        event_log.append(trace)
    return event_log

def get_traces_from_event_log(event_log):
    traces = []
    grouped = event_log.groupby('case:concept:name') 
    
    for case_id, trace in grouped:
        trace_events = trace['concept:name'].tolist() 
        traces.append(tuple(trace_events))
    
    return traces

def get_subtraces_for_model(traces, model: LPM):
    #Return a list of subtraces that start with an event that is a start event in the model and end with an event that is an end event in the model
    start_activities = set([trace[0] for trace in model.get_traces()])
    end_activities = set([trace[-1] for trace in model.get_traces()])

    subtraces = []
    for trace in traces:
        start_indices = [i for i, event in enumerate(trace) if event in start_activities]
        end_indices = [i for i, event in enumerate(trace) if event in end_activities]
        
        for start_idx in start_indices:
            for end_idx in end_indices:
                if start_idx < end_idx:
                    subtraces.append(get_projected_trace_on_model(trace[start_idx:end_idx+1], model))
    
    return subtraces


def get_projected_trace_on_model(trace: Tuple[str], model: LPM):
    model_activities = [transition.label for transition in model.net.transitions]
    
    projected_trace = []
    for event in trace:
        if event in model_activities:
            projected_trace.append(event)
        else:
            projected_trace.append(None)

    return tuple(projected_trace)

def get_short_trace_string(trace: Tuple[str]):
    result = ""

    if len(trace) > 3:
        result = f"{trace[0]}, {trace[1]}, ... , {trace[-1]}"
    else:
        result =  ", ".join(trace)
    
    if len(result) > 50:
        result = result[:50] + "..."
    
    return result

def get_indices_of_variants(traces: List[Tuple[str]]):
    # Create a dictionary to store the indices of each variant
    variant_indices = {}
    
    # Iterate over the traces and their indices
    for index, trace in enumerate(traces):
        # Convert the trace to a string representation
        trace_str = str(trace)
        
        # If the trace is not in the dictionary
        if trace_str not in variant_indices:
            variant_indices[trace_str] = index

    # Convert the dictionary to a list of indices
    indices = list(variant_indices.values())

    return indices


