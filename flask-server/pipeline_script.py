import json
from pathlib import Path
import time
from file_importer import convert_stored_pnml_files, convert_stored_xes_file
from lpm_set_comparison_python.main import calculate_report
from file_storage import export_from_objects

CONFIG_FILE = 'pipeline/config.json'

def read_config(file_path):
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"Error: Config file '{file_path}' not found.")
        return None
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return None

def main():
    #Read configurations
    print("Reading configurations...")
    configs= read_config(CONFIG_FILE)["config"]

    if configs is None:
        return
    
    print("Configurations read successfully.")

    times = {}

    for config in configs:
        print(f"Processing configuration: {config["output"]}")

        path_side_a = Path(f"pipeline/lpm_sets/{config["set_a"]}")
        path_side_b = Path(f"pipeline/lpm_sets/{config["set_b"]}")

        pnml_files_side_a = list(path_side_a.glob('*.pnml')) + list(path_side_a.glob('*.apnml'))
        pnml_files_side_b = list(path_side_b.glob('*.pnml')) + list(path_side_b.glob('*.apnml'))
        xes_file = Path(f"pipeline/event_logs/{config["event_log"]}")

        lpms_a = convert_stored_pnml_files(pnml_files_side_a)
        lpms_b = convert_stored_pnml_files(pnml_files_side_b)
        traces = convert_stored_xes_file(xes_file)

        print("Processing data...")
        start_time = time.perf_counter()
        gen_obj = calculate_report(lpms_a, lpms_b, traces, "id", pipeline=True)
        [set_a, set_b, event_log, other_computations, report, report_times] = next(gen_obj)
        report_times["total_time"] = time.perf_counter() - start_time

        times[config["output"]] = report_times

        print("Data processed successfully.")

        print("Exporting data...")
        json_export = export_from_objects(set_a, set_b, event_log, other_computations, report)

        with open(f"pipeline/reports/{config["output"]}.json", "w") as file:
            json.dump(json_export, file)

        with open(f"pipeline/reports/times_{config["output"]}.json", "w") as file:
            json.dump(report_times, file)

    with open("pipeline/times.json", "w") as file:
        json.dump(times, file)

if __name__ == '__main__':
    print("Starting pipeline script...")
    main()