from flask import Flask, request, jsonify, session
from flask_session import Session
from file_importer import convert_files
from lpm_set_comparison_python.main import calculate_report
from lpm_set_comparison_python.lpm import LPMSet

app = Flask(__name__)

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_THRESHOLD'] = 100
Session(app)

@app.route('/upload', methods=['POST'])
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
    
    #TODO Maybe have that as a separate api endpoint with parameters, and store the converted lpms for the session
    report = calculate_report(lpmset_a, lpmset_b, event_log)
    session['report'] = report
    session['lpmset_a'] = LPMSet.serialize(lpmset_a)
    session['lpmset_b'] = LPMSet.serialize(lpmset_b)
    #session['event_log'] = event_log
    print(f"Report: {report}")
    return jsonify(report)


@app.route('/report', methods=['GET'])
def get_report():
    report = session.get('report')
    serialized_lpms_a = session.get('lpmset_a')
    serialized_lpms_b = session.get('lpmset_b')

    lpmset_a : LPMSet = LPMSet.deserialize(serialized_lpms_a) if serialized_lpms_a else None
    lpmset_b = LPMSet.deserialize(serialized_lpms_b) if serialized_lpms_b else None

    #if lpmset_a is not None:
        #print(lpmset_a.get_eventually_follows_set())

    if report is None:
        return jsonify({"error": "No report found"}), 404
    return jsonify(report)

if __name__ == '__main__':
    app.run(debug=True)