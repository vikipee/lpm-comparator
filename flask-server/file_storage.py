import os
import json
import time
from lpm_set_comparison_python.lpm import LPMSet
from enum import Enum
import pickle
import base64

class FileType(Enum):
    LPMSetA = 1
    LPMSetB = 2
    LOG = 3
    OTHER = 4
    REPORT = 5
    
def save_computations(session_id, lpmset_a, lpmset_b, event_log, other_computations=None, report=None):
    write_file(FileType.LPMSetA, LPMSet.serialize(lpmset_a), session_id, is_json=False)
    write_file(FileType.LPMSetB, LPMSet.serialize(lpmset_b), session_id, is_json=False)
    write_file(FileType.LOG, pickle.dumps(event_log), session_id, is_json=False)

    if other_computations is not None:
        write_file(FileType.OTHER, pickle.dumps(other_computations), session_id, is_json=False)

    if report is not None:
        write_file(FileType.REPORT, report, session_id, is_json=True)

def load_report(session_id):
    return read_file(FileType.REPORT, session_id, is_json=True)

def load_computations(session_id):
    serialized_lpms_a = read_file(FileType.LPMSetA, session_id, is_json=False)
    serialized_lpms_b = read_file(FileType.LPMSetB, session_id, is_json=False)
    serialized_event_log = read_file(FileType.LOG, session_id, is_json=False)
    serialized_other_computations = read_file(FileType.OTHER, session_id, is_json=False)
    report = read_file(FileType.REPORT, session_id, is_json=True)
    lpmset_a : LPMSet = LPMSet.deserialize(serialized_lpms_a) if serialized_lpms_a else None
    lpmset_b : LPMSet = LPMSet.deserialize(serialized_lpms_b) if serialized_lpms_b else None
    event_log = pickle.loads(serialized_event_log) if serialized_event_log else None
    other_computations = pickle.loads(serialized_other_computations) if serialized_other_computations else None

    return lpmset_a, lpmset_b, event_log, other_computations, report

def load_other_computations(session_id):
    serialized_other_computations = read_file(FileType.OTHER, session_id, is_json=False)
    return pickle.loads(serialized_other_computations) if serialized_other_computations else None

def load_lpms_a(session_id):
    serialized_lpms_a = read_file(FileType.LPMSetA, session_id, is_json=False)
    return LPMSet.deserialize(serialized_lpms_a) if serialized_lpms_a else None

def load_lpms_b(session_id):
    serialized_lpms_b = read_file(FileType.LPMSetB, session_id, is_json=False)
    return LPMSet.deserialize(serialized_lpms_b) if serialized_lpms_b else None

def load_event_log(session_id):
    serialized_event_log = read_file(FileType.LOG, session_id, is_json=False)
    return pickle.loads(serialized_event_log) if serialized_event_log else None

def delete_files(session_id):
    if os.path.exists(f"uploads/{session_id}"):
        os.chmod(f"uploads/{session_id}", 0o777)

        if os.path.exists(f"uploads/{session_id}/svgs"):
            os.chmod(f"uploads/{session_id}/svgs", 0o777)
            for file in os.listdir(f"uploads/{session_id}/svgs"):
                os.remove(f"uploads/{session_id}/svgs/{file}")
            os.rmdir(f"uploads/{session_id}/svgs")

        for file in os.listdir(f"uploads/{session_id}"):
            os.remove(f"uploads/{session_id}/{file}")
        os.rmdir(f"uploads/{session_id}")

def get_string_from_binary(binary):
    return base64.b64encode(binary).decode("ascii")

def get_binary_from_string(string):
    return base64.b64decode(string)

def get_export_json(session_id):
    serialized_lpms_a = read_file(FileType.LPMSetA, session_id, is_json=False)
    serialized_lpms_b = read_file(FileType.LPMSetB, session_id, is_json=False)
    serialized_event_log = read_file(FileType.LOG, session_id, is_json=False)
    serialized_other_computations = read_file(FileType.OTHER, session_id, is_json=False)
    report = read_file(FileType.REPORT, session_id, is_json=True)

    return {
        "report": report,
        "lpmset_a": get_string_from_binary(serialized_lpms_a),
        "lpmset_b": get_string_from_binary(serialized_lpms_b),
        "event_log": get_string_from_binary(serialized_event_log),
        "other_computations": get_string_from_binary(serialized_other_computations)
    }

def export_from_objects(lpmset_a, lpmset_b, event_log, other_computations, report):
    serialized_lpms_a = LPMSet.serialize(lpmset_a)
    serialized_lpms_b = LPMSet.serialize(lpmset_b)
    serialized_event_log = pickle.dumps(event_log)
    serialized_other_computations = pickle.dumps(other_computations)

    return {
        "report": report,
        "lpmset_a": get_string_from_binary(serialized_lpms_a),
        "lpmset_b": get_string_from_binary(serialized_lpms_b),
        "event_log": get_string_from_binary(serialized_event_log),
        "other_computations": get_string_from_binary(serialized_other_computations)
    }

def import_json(session_id, json_data):
    lpmset_a = get_binary_from_string(json_data["lpmset_a"])
    lpmset_b = get_binary_from_string(json_data["lpmset_b"])
    event_log = get_binary_from_string(json_data["event_log"])
    other_computations = get_binary_from_string(json_data["other_computations"])
    report = json_data["report"]

    print("Imported report: ", report)

    write_file(FileType.LPMSetA, lpmset_a, session_id, is_json=False)
    write_file(FileType.LPMSetB, lpmset_b, session_id, is_json=False)
    write_file(FileType.LOG, event_log, session_id, is_json=False)
    write_file(FileType.OTHER, other_computations, session_id, is_json=False)
    write_file(FileType.REPORT, report, session_id, is_json=True)

    return report

def write_file(type:FileType, content, session_id, is_json):
    """
        First check if the file for the session exists, if it does, overwrite it.
        If it doesn't, create a new file.
    """
    if not os.path.exists(f"uploads/{session_id}"):
        os.makedirs(f"uploads/{session_id}")
    
    if is_json:
        filename = f"uploads/{session_id}/{type.name}.json"
        if os.path.exists(filename):
            os.remove(filename)
        with open(filename, "w") as file:
            json.dump(content, file)
    
    else: 
        filename = f"uploads/{session_id}/{type.name}.pkl"
        if os.path.exists(filename):
            os.remove(filename)
        with open(filename, "wb") as file:
            pickle.dump(content, file)


def read_file(type:FileType, session_id, is_json):
    if is_json:
        filename = f"uploads/{session_id}/{type.name}.json"
        if not os.path.exists(filename):
            return None
        with open(filename, "r") as file:
            return json.load(file)
    else:
        filename = f"uploads/{session_id}/{type.name}.pkl"
        if not os.path.exists(filename):
            return None
        with open(filename, "rb") as file:
            return pickle.load(file)