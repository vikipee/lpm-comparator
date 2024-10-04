import os
from werkzeug.utils import secure_filename
import pm4py
from lpm_set_comparison_python.lpm import LPM, LPMSet

UPLOAD_FOLDER = './uploads'

ALLOWED_EXTENSIONS_PNML = {'pnml', 'apnml'}
ALLOWED_EXTENSIONS_XES = {'xes'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def convert_pnml_files(pnml_files):
    """Converts the uploaded PNML files to Petri nets.

        Parameters
        ----------
        pnml_files : list of FileStorage
            The list of PNML files to be converted.

        Returns
        -------
        LPMSet
            The set of Petri nets.
        
    """
    lpms = []
    for pnml_file in pnml_files:
        if pnml_file and allowed_file(pnml_file.filename, ALLOWED_EXTENSIONS_PNML):
            filename = secure_filename(pnml_file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            pnml_file.save(filepath)
            try:
                net, im, fm = pm4py.read_pnml(filepath)
                lpm = LPM(net, im, fm)
                lpms.append(lpm)
                os.remove(filepath)
            except Exception as e:
                raise Exception(f"Error processing PNML file: {str(e)}")
        else:
            raise Exception(f"Invalid file extension for {pnml_file.filename}. Allowed extensions are {ALLOWED_EXTENSIONS_PNML}")
    return LPMSet(lpms)

def convert_xes_file(xes_file):
    """Converts the uploaded XES file to an event log.

        Parameters
        ----------
        xes_file : FileStorage
            The XES file to be converted.

        Returns
        -------
        EventLog
            The event log.
        
    """
    if xes_file and allowed_file(xes_file.filename, ALLOWED_EXTENSIONS_XES):
        filename = secure_filename(xes_file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        xes_file.save(filepath)
        try:
            event_log = pm4py.read_xes(filepath)
            os.remove(filepath)
            return event_log
        except Exception as e:
            raise Exception(f"Error processing XES file: {str(e)}")
    else:
        raise Exception(f"Invalid file extension for {xes_file.filename}. Allowed extensions are {ALLOWED_EXTENSIONS_XES}")

def convert_files(pnml_files_side_a, pnml_files_side_b, xes_file):
    """Converts the uploaded files to the required format for processing.

        If the arguments pnml_files_side_a and pnml_files_side_b are not empty, the function will convert them to petrinets.

        Parameters
        ----------
        pnml_files_side_a : list of FileStorage
            The list of PNML files for Side A.
        
        pnml_files_side_b : list of FileStorage
            The list of PNML files for Side B.
        
        xes_file : FileStorage, optional
            The XES file to be converted to an event log.
            

        Raises
        ------
        NotImplementedError
            If no sound is set for the animal or passed in as a
            parameter.
        
    """
    # Ensure there are PNML files for both sides
    if len(pnml_files_side_a) == 0 or len(pnml_files_side_b) == 0:
            raise Exception(f"PNML files for both Side A and Side B are required")
    
    # Create upload folder if it doesn't exist
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    lpmset_a = convert_pnml_files(pnml_files_side_a)
    lpmset_b = convert_pnml_files(pnml_files_side_b)
    event_log = convert_xes_file(xes_file) if xes_file else None

    return lpmset_a, lpmset_b, event_log
