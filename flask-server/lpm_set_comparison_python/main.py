from .conformance_computation import compute_conformance_measures
from .similarity_computation import compute_similarity_measures
from typing import List, Optional
from .lpm import LPM
from pm4py.objects.log.obj import EventLog

def calculate_report(
    lpms_a: List[LPM],
    lpms_b: List[LPM],
    event_log: Optional[EventLog]
):
    # Create a dictionary to store the results of the comparison
    report = {}

    compute_similarity_measures()

    if event_log is not None:
        #compute_conformance_measures()
        report["xes"] = {
            "traces": len(event_log)
        }
    # Calculate the comparison results
    # Compare the LPMS from Side A and Side B
    # Compare the event log with the LPMS from Side A and Side B
    # Store the results in the report dictionary

    total_places_a = 0
    total_transitions_a = 0
    total_arcs_a = 0
    for lpm in lpms_a:
        total_arcs_a += len(lpm.net.arcs)
        total_places_a += len(lpm.net.places)
        total_transitions_a += len(lpm.net.transitions)
    
    total_places_b = 0
    total_transitions_b = 0
    total_arcs_b = 0
    for lpm in lpms_b:
        total_arcs_b += len(lpm.net.arcs)
        total_places_b += len(lpm.net.places)
        total_transitions_b += len(lpm.net.transitions)

    report = {
        "lpms_a": {
            "total_places": total_places_a,
            "total_transitions": total_transitions_a,
            "total_arcs": total_arcs_a
        },
        "lpms_b": {
            "total_places": total_places_b,
            "total_transitions": total_transitions_b,
            "total_arcs": total_arcs_b
        }
    }

    return report