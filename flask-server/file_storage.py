import os
import json
from lpm_set_comparison_python.lpm import LPMSet
from enum import Enum
import pickle


class FileType(Enum):
    LPMSetA = 1
    LPMSetB = 2
    LOG = 3
    REPORT = 4

def save_computations(session_id, lpmset_a, lpmset_b, event_log, report=None):
    write_file(FileType.LPMSetA, LPMSet.serialize(lpmset_a), session_id, is_json=False)
    write_file(FileType.LPMSetB, LPMSet.serialize(lpmset_b), session_id, is_json=False)
    write_file(FileType.LOG, pickle.dumps(event_log), session_id, is_json=False)

    if report is not None:
        write_file(FileType.REPORT, report, session_id, is_json=True)

def load_report(session_id):
    return read_file(FileType.REPORT, session_id, is_json=True)

def load_computations(session_id):
    serialized_lpms_a = read_file(FileType.LPMSetA, session_id, is_json=False)
    serialized_lpms_b = read_file(FileType.LPMSetB, session_id, is_json=False)
    serialized_event_log = read_file(FileType.LOG, session_id, is_json=False)
    report = read_file(FileType.REPORT, session_id, is_json=True)

    lpmset_a : LPMSet = LPMSet.deserialize(serialized_lpms_a) if serialized_lpms_a else None
    lpmset_b : LPMSet = LPMSet.deserialize(serialized_lpms_b) if serialized_lpms_b else None
    event_log = pickle.loads(serialized_event_log) if serialized_event_log else None

    return lpmset_a, lpmset_b, event_log, report

def delete_files(session_id):
    if os.path.exists(f"uploads/{session_id}"):
        for file in os.listdir(f"uploads/{session_id}"):
            os.remove(f"uploads/{session_id}/{file}")
        os.rmdir(f"uploads/{session_id}")

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