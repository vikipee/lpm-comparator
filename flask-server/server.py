from flask import Flask, request, jsonify, session, Response
from flask_session import Session
from file_importer import convert_files
from lpm_set_comparison_python.main import calculate_report
import secrets
from file_storage import save_computations, load_computations, load_report, delete_files

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
    
    lpmset_a, lpmset_b, event_log, _ = load_computations(session_id)
    
    return Response(calculate_report(lpmset_a, lpmset_b, event_log, session_id), content_type='text/event-stream')

@app.route('/api/report/current', methods=['GET'])
def get_report():
    session_id = session.get('id')
    if session_id is None:
        return jsonify({"error": "No session found"}), 404
    
    report = load_report(session_id)

    if report is None:
        return jsonify({"error": "No report found"}), 404
    return jsonify(report)

@app.route('/api/report', methods=['DELETE'])
def reset_report():
    session_id = session.get('id')
    if session_id is not None:
        delete_files(session_id)
    session.clear()
    return jsonify({"message": "Session cleared"})

if __name__ == '__main__':
    app.run(debug=True)