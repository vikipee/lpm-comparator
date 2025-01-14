from flask import Flask, request, jsonify, session, Response
from flask_session import Session
from file_importer import convert_files
from lpm_set_comparison_python.main import calculate_report
import secrets
from file_storage import get_export_json, import_json, save_computations, load_computations, load_report, delete_files

app = Flask(__name__)

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_THRESHOLD'] = 100
Session(app)

@app.route('/api/upload', methods=['POST'])
def upload_files():
    pnml_files_side_a = request.files.getlist('pnml_side_a')
    pnml_files_side_b = request.files.getlist('pnml_side_b')
    xes_file = request.files.get('xes_file')

    try:
        lpmset_a, lpmset_b, event_log = convert_files(pnml_files_side_a, pnml_files_side_b, xes_file)
    except Exception as e:
        if "Error processing XES file" in str(e):
            return jsonify({"error": str(e)}), 400
        elif "PNML files for both Side A and Side B are required" in str(e):
            return jsonify({"error": str(e)}), 400
        elif "Invalid file extension" in str(e):
            return jsonify({"error": str(e)}), 400
        elif "Error processing PNML file" in str(e):
            return jsonify({"error": str(e)}), 400
        else:
            return jsonify({"error": "An error occurred while processing the files"}), 500
    
    session_id = session.get('id')
    if session_id is None:
        session_id = secrets.token_hex(16)
        session['id'] = session_id

    save_computations(session_id, lpmset_a, lpmset_b, event_log)

    return jsonify({"message": "Files uploaded successfully"})

@app.route('/api/report/compute', methods=['GET'])
def compute_report():
    session_id = session.get('id')
    if session_id is None:
        return jsonify({"error": "No session found"}), 404
    
    lpmset_a, lpmset_b, event_log, _, _ = load_computations(session_id)
    
    return Response(calculate_report(lpmset_a, lpmset_b, event_log, session_id), content_type='text/event-stream')

@app.route('/api/report/current', methods=['GET'])
def get_report():
    session_id = session.get('id')
    if session_id is None:
        return jsonify({"message": "No session found"})
    
    report = load_report(session_id)

    if report is None:
        return jsonify({"message": "No report found"})
    return jsonify(report)

@app.route('/api/report', methods=['DELETE'])
def reset_report():
    session_id = session.get('id')
    if session_id is not None:
        delete_files(session_id)
    session.clear()
    return jsonify({"message": "Session cleared"})

@app.route('/api/export', methods=['GET'])
def export_report():
    session_id = session.get('id')
    if session_id is None:
        return jsonify({"error": "No session found"}), 404
    
    try:
        export = get_export_json(session_id)
    except Exception as e:
        return jsonify({"error": "An error occurred while exporting the report"}), 500

    return jsonify(export)

@app.route('/api/import', methods=['POST'])
def import_report():
    session_id = session.get('id')
    if session_id is None:
        session_id = secrets.token_hex(16)
        session['id'] = session_id
    
    try:
        exported_report =  request.json
        report = import_json(session_id, exported_report)
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred while importing the report"}), 500

    return jsonify(report)

@app.route('/api/petrinet/<int:side>/<string:lpm_id>', methods=['GET'])
def get_petrinet_vis(side, lpm_id):
    session_id = session.get('id')
    if session_id is None:
        return jsonify({"error": "No session found"}), 404
    
    lpmset_a, lpmset_b, _, _, _ = load_computations(session_id)
    if side == 1:
        lpm = lpmset_a.get_lpm_by_id(lpm_id)
    else:
        lpm = lpmset_b.get_lpm_by_id(lpm_id)
    
    if lpm is None:
        return jsonify({"error": "LPM not found"}), 404
    
    path_to_svg = lpm.get_vis(session_id)

    with open(path_to_svg, 'r', encoding='utf-8') as file:
        svg_content = file.read()

    return jsonify({"vis": svg_content})

@app.route('/api/tracecoverage/<int:trace_id>', methods=['GET'])
def get_trace_coverage(trace_id):
    session_id = session.get('id')
    
    if session_id is None:
        return jsonify({"error": "No session found"}), 404
    
    _, _, event_log, other_computations, _ = load_computations(session_id)

    if event_log is None:
        return jsonify({"error": "No event log found"}), 404
    
    if trace_id >= len(event_log):
        return jsonify({"error": "Trace not found"}), 404
    
    masks = other_computations["masks"]
    
    full_trace = event_log[trace_id]
    mask_a = masks["mask_a"][trace_id]
    mask_b = masks["mask_b"][trace_id]

    covered_events_trace = []

    for i, event in enumerate(full_trace):
        covered_a = 0
        if mask_a[i]:
            covered_a = mask_a[i]
        
        covered_b = 0
        if mask_b[i]:
            covered_b = mask_b[i]

        covered_events_trace.append({
            "event": event,
            "covered_a": covered_a,
            "covered_b": covered_b
        })
    
    print(covered_events_trace)
    return jsonify(covered_events_trace)

@app.route('/api/trace', methods=['POST'])
def get_variants_with_query():
    data = request.json
    search_query = data.get('searchQuery', '')
    print(search_query)

    session_id = session.get('id')

    if session_id is None:
        return jsonify({"error": "No session found"}), 404
    
    _, _, _, other_computations, _ = load_computations(session_id)

    variants : str = other_computations["variants"]

    # Get indices of variants that match the search query

    search_parts = search_query.lower().split('#')

    matching_indices = [
        i for i, variant in enumerate(variants)
        if all(part in variant.lower() for part in search_parts)
    ]

    print(matching_indices)
    return jsonify(matching_indices)

if __name__ == '__main__':
    #If in docker, run the server with host 0.0.0.0, to allow access from outside the container, otherwise remove host
    app.run(debug=True)
    #app.run(host='0.0.0.0', port=5000, debug=True)