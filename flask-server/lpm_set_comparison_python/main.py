from .conformance_computation import compute_conformance_measures, compute_conformance_measures_multi_processing, compute_coverage, compute_coverage_multi_processing
from .similarity_computation import compute_similarity_measures
from .aggregation import get_evaluation_measures
from typing import List, Optional, Tuple
from .lpm import LPMSet
import json
from file_storage import save_computations
import concurrent.futures
import time
import atexit

def calculate_report(
    set_a: LPMSet,
    set_b: LPMSet,
    event_log: Optional[List[Tuple[str]]],
    session_id: str,
    pipeline: Optional[bool] = False
):
    # Create a dictionary to store the results of the comparison
    times = {}
    report = {}

    with concurrent.futures.ProcessPoolExecutor() as _executor:

        #Compute traces of LPMs first to not add time to similarity unnecessarily
        start_trace_a_time = time.perf_counter()
        traces_a = list(_executor.map(get_traces, set_a.lpms))
        print("Computed traces for set A",traces_a)
        for i, lpm in enumerate(set_a.lpms):
            lpm.traces = traces_a[i]
        
        times["traces_a"] = time.perf_counter() - start_trace_a_time
        print("Computed traces for set A")
        
        start_trace_b_time = time.perf_counter()
        traces_b = list(_executor.map(get_traces, set_b.lpms))
        for i, lpm in enumerate(set_b.lpms):
            lpm.traces = traces_b[i]
        
        times["traces_b"] = time.perf_counter() - start_trace_b_time
    print("Computed traces for set B")

    if not pipeline:
        yield f"data: {json.dumps({'state': 'IN_PROGRESS', 'message': 'Computing similarity...'})}\n\n"
    start_similarity_time = time.perf_counter()
    similarity_report, matchings, sim_times = compute_similarity_measures(set_a, set_b)
    time_similarity = time.perf_counter() - start_similarity_time

    report["similarity"] = similarity_report
    times["similarity"] = sim_times
    print("Computed similarity measures")

    if event_log is not None:
        if not pipeline:
            yield f"data: {json.dumps({'state': 'IN_PROGRESS', 'message': 'Computing coverage...'})}\n\n"
        if len(set_a.lpms) > 10 or len(set_b.lpms) > 10:
            #Use multiprocessing
            print("Using multiprocessing")
            start_coverage_time = time.perf_counter()
            report["coverage"], masks, variants, times["coverage"] = compute_coverage_multi_processing(set_a, set_b, event_log, _executor)
            time_coverage = time.perf_counter() - start_coverage_time
            print(f"Computed coverage in {time_coverage} seconds")

            if not pipeline:
                yield f"data: {json.dumps({'state': 'IN_PROGRESS', 'message': 'Computing conformance...'})}\n\n"

            start_conformance_time = time.perf_counter()
            times["conformance"] = compute_conformance_measures_multi_processing(set_a, set_b, event_log, _executor)
            time_conformance = time.perf_counter() - start_conformance_time
            print(f"Computed conformance measures in {time_conformance} seconds")
        else: 
            start_coverage_time = time.perf_counter()
            report["coverage"], masks, variants, times["coverage"] = compute_coverage(set_a, set_b, event_log)
            time_coverage = time.perf_counter() - start_coverage_time
            print("Computed coverage")

            if not pipeline:
                yield f"data: {json.dumps({'state': 'IN_PROGRESS', 'message': 'Computing conformance...'})}\n\n"
            
            start_conformance_time = time.perf_counter()
            times["conformance"] = compute_conformance_measures(set_a, set_b, event_log)
            time_conformance = time.perf_counter() - start_conformance_time
            print("Computed conformance measures")

        if not pipeline:
            yield f"data: {json.dumps({'state': 'IN_PROGRESS', 'message': 'Computing aggregations...'})}\n\n"
        
        report["fitness_evaluation"] = get_evaluation_measures(set_a, set_b, matchings, measure="fitness")
        report["precision_evaluation"] = get_evaluation_measures(set_a, set_b, matchings, measure="precision")
        print("Computed aggregations")

        lpms_a = []
        lpms_b = []
        for i, lpm in enumerate(set_a.lpms):
            lpms_a.append({
                "id": lpm.id,
                "name": lpm.name,
                "fitness": lpm.get_fitness(),
                "precision": lpm.get_precision(),
                "coverage": lpm.get_coverage(),
                "index": i
            })
        for i, lpm in enumerate(set_b.lpms):
            lpms_b.append({
                "id": lpm.id,
                "name": lpm.name,
                "fitness": lpm.get_fitness(),
                "precision": lpm.get_precision(),
                "coverage": lpm.get_coverage(),
                "index": i
            })
        report["lpms_a"] = lpms_a
        report["lpms_b"] = lpms_b
        #Event log only when needed (Too big)
        #report["event_log"] = event_log

    other_computations = {
        "masks": masks,
        "variants": variants,
    }
    if not pipeline:
        save_computations(session_id, set_a, set_b, event_log, other_computations, report)
        yield f"data: {json.dumps({'state': 'COMPLETED', 'progress': 100, 'message': 'Task completed', 'report': report})}\n\n"
    #print(f"Report: {report}")


    if pipeline:   
        times["similarity_total"] = time_similarity
        times["coverage_total"] = time_coverage
        times["conformance_total"] = time_conformance

        yield set_a, set_b, event_log, other_computations, report, times
    
def get_traces(lpm):
    return lpm.get_traces()