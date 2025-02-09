import json
from pathlib import Path
import time
from lpm_set_comparison_python.conformance_computation import compute_conformance_measures, compute_conformance_measures_multi_processing, compute_coverage, compute_coverage_multi_processing
import concurrent
from file_importer import convert_stored_pnml_files, convert_stored_xes_file

CONFIG_FILE = 'pipeline/conformanceConfig.json'

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
    
    set_log_outputs = []

    for config in configs:
            print(f"Processing configuration: {config["output"]}")

            path = Path(f"pipeline/lpm_sets/{config["lpm_path"]}")

            pnml_files = list(path.glob('*.pnml')) + list(path.glob('*.apnml'))
            
            xes_file = Path(f"pipeline/event_logs/{config["event_log"]}")

            lpms = convert_stored_pnml_files(pnml_files)
            traces = convert_stored_xes_file(xes_file)

            set_log_outputs.append((lpms, traces, config["output"]))
    
    print("Configurations read successfully.")

    times = {}
    print("Starting multiprocessing...")
    with concurrent.futures.ProcessPoolExecutor() as executor:
        multiprocessing_times = {}
        #Compute something random to not count the time of the starting multiple processes
        lpms = set_log_outputs[0][0]
        compute_coverage_multi_processing(lpms, lpms, traces, executor)
        for lpms, traces, output in set_log_outputs:
            print(f"(Multi Processing configuration: {output}")
            start_time = time.perf_counter()
            compute_conformance_measures_multi_processing(lpms, lpms, traces, executor, use_TBR=True)
            multiprocessing_times[f"{output} - TBR"] = (time.perf_counter() - start_time) / 2.0

            start_time = time.perf_counter()
            compute_conformance_measures_multi_processing(lpms, lpms, traces, executor, use_TBR=False)
            multiprocessing_times[f"{output} - Alignments"] = (time.perf_counter() - start_time) / 2.0
        
        times["multiprocessing"] = multiprocessing_times
    
    single_processing_times = {}
    
    print("Starting single processing...")
    for lpms, traces, output in set_log_outputs:
        print(f"Processing configuration: {output}")

        start_time = time.perf_counter()
        compute_conformance_measures(lpms, lpms, traces)
        single_processing_times[f"{output}"] = (time.perf_counter() - start_time)/2.0
    
    times["single_processing"] = single_processing_times


    with open("pipeline/conformanceTimes.json", "w") as file:
        json.dump(times, file)

if __name__ == '__main__':
    print("Starting pipeline script...")
    main()