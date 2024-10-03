from flask import Flask, request, jsonify
from file_importer import convert_files
from lpm_set_comparison_python.main import calculate_report

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_files():
    pnml_files_side_a = request.files.getlist('pnml_side_a')
    pnml_files_side_b = request.files.getlist('pnml_side_b')
    xes_file = request.files.get('xes_file')

    try:
        lpms_a, lpms_b, event_log = convert_files(pnml_files_side_a, pnml_files_side_b, xes_file)
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
    report = calculate_report(lpms_a, lpms_b, event_log)
    print(f"Report: {report}")
    return jsonify(report)

if __name__ == '__main__':
    app.run(debug=True)