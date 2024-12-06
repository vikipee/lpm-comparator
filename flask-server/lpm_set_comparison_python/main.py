from .conformance_computation import compute_conformance_measures, compute_coverage
from .similarity_computation import compute_similarity_measures
from .aggregation import get_aggregated_measures
from typing import List, Optional
from .lpm import LPMSet
from pm4py.objects.log.obj import EventLog
import json
from file_storage import save_computations

def calculate_report(
    set_a: LPMSet,
    set_b: LPMSet,
    event_log: Optional[EventLog],
    session_id: str
):
    # Create a dictionary to store the results of the comparison
    report = {}

    yield f"data: {json.dumps({'state': 'IN_PROGRESS', 'message': 'Computing similarity...'})}\n\n"
    similarity_report = compute_similarity_measures(set_a, set_b)

    report["similarity"] = similarity_report
    print("Computed similarity measures")

    if event_log is not None:
        yield f"data: {json.dumps({'state': 'IN_PROGRESS', 'message': 'Computing coverage...'})}\n\n"
        report["coverage"] = compute_coverage(set_a, set_b, event_log)
        print("Computed coverage")

        yield f"data: {json.dumps({'state': 'IN_PROGRESS', 'message': 'Computing conformance...'})}\n\n"
        report["conformance"] = compute_conformance_measures(set_a, set_b, event_log)
        print("Computed conformance measures")

        yield f"data: {json.dumps({'state': 'IN_PROGRESS', 'message': 'Computing aggregations...'})}\n\n"
        matchings = similarity_report["matchings"]
        report["fitness_aggregation"] = get_aggregated_measures(set_a, set_b, matchings, measure="fitness")
        report["precision_aggregation"] = get_aggregated_measures(set_a, set_b, matchings, measure="precision")
        print("Computed aggregations")

    save_computations(session_id, set_a, set_b, event_log, report)
    yield f"data: {json.dumps({'state': 'COMPLETED', 'progress': 100, 'message': 'Task completed', 'report': report})}\n\n"
    print(f"Report: {report}")