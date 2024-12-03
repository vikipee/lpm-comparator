import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileUpload = () => {
  // State for file inputs
  const [pnmlFilesSideA, setPnmlFilesSideA] = useState([]);  // Side A .pnml files
  const [pnmlFilesSideB, setPnmlFilesSideB] = useState([]);  // Side B .pnml files
  const [xesFile, setXesFile] = useState(null);  // Optional .xes file

  // State for feedback and response
  const [uploadProgress, setUploadProgress] = useState(null); // Track upload progress
  const [responseData, setResponseData] = useState(null);  // Hold server response
  const [errorMessage, setErrorMessage] = useState(null);  // Error messages

  //Make get request after reloading the page
  useEffect(() => {
      axios.get('/api/report').then((response) => {
        setResponseData(response.data);
      }).catch((error) => {
        if (error.status === 500) {
          setErrorMessage('Internal server error');
        } 
    });
  }, []);

  // Handle .pnml files for Side A
  const handlePnmlFilesSideAChange = (e) => {
    setPnmlFilesSideA(e.target.files);
  };

  // Handle .pnml files for Side B
  const handlePnmlFilesSideBChange = (e) => {
    setPnmlFilesSideB(e.target.files);
  };

  // Handle .xes file
  const handleXesFileChange = (e) => {
    setXesFile(e.target.files[0]);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();  // Prevent default form submission

    // Create a FormData object to hold the files
    const formData = new FormData();

    // Append multiple pnml files for Side A
    for (let i = 0; i < pnmlFilesSideA.length; i++) {
      formData.append('pnml_side_a', pnmlFilesSideA[i]);
    }

    // Append multiple pnml files for Side B
    for (let i = 0; i < pnmlFilesSideB.length; i++) {
      formData.append('pnml_side_b', pnmlFilesSideB[i]);
    }

    // Optionally append the .xes file
    if (xesFile) {
      formData.append('xes_file', xesFile);
    }

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',  // Set content type to multipart
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(`${percentCompleted}%`);
        },
      });

      // Handle success response
      setResponseData(response.data);
      console.log(response.data);  // Save response data in state
      setUploadProgress(null);  // Reset progress bar
      setErrorMessage(null);  // Clear error messages
    } catch (error) {
      // Handle error response
      setErrorMessage(error.response.data.error);  // Save error message in state
      setUploadProgress(null);
    }
  };

  return (
    <div>
      <h2>Upload Multiple .pnml Files and Optional .xes File</h2>
      <form onSubmit={handleFileUpload}>
        <h3>Side A (.pnml Files)</h3>
        <input type="file" accept=".pnml, .apnml" multiple onChange={handlePnmlFilesSideAChange} />

        <h3>Side B (.pnml Files)</h3>
        <input type="file" accept=".pnml, .apnml" multiple onChange={handlePnmlFilesSideBChange} />

        <h3>Optional .xes File</h3>
        <input type="file" accept=".xes" onChange={handleXesFileChange} />

        <button type="submit">Upload</button>
      </form>

      {uploadProgress && <p>Uploading: {uploadProgress}</p>}  {/* Show upload progress */}
      {responseData && (
        <div>
          <h2>Server Response:</h2>
          <p>Side A - Places: {responseData.basic.lpms_a.total_places}, Transitions: {responseData.basic.lpms_a.total_transitions}, Arcs: {responseData.basic.lpms_a.total_arcs}</p>
          <p>Side B - Places: {responseData.basic.lpms_b.total_places}, Transitions: {responseData.basic.lpms_b.total_transitions}, Arcs: {responseData.basic.lpms_b.total_arcs}</p>
          {responseData.xes && <p>Event Log Length: {responseData.xes}</p>}
          {responseData.similarity && (
            <>
            <h3>Similarity Measures</h3>
            <p>Trace Sim (Leven): {responseData.similarity.trace_similarity}</p>
            <p>Eventually Follows Sim: {responseData.similarity.eventually_follows_similarity}</p>
            <p>Exact Trace Sim: {responseData.similarity.trace_similarity_perfect}</p>
            {responseData.similarity.a_subset_b && responseData.similarity.a_subset_b === "True" && (
              <p>Set A is a subset of Set B</p>
            )}
            {responseData.similarity.a_subset_b && responseData.similarity.a_subset_b === "True" && (
              <p>Set A is a subset of Set B</p>
            )}
            </>
          )}
          {responseData.conformance && ( 
            <>
              <h3>Conformance Measures</h3>
              {responseData.conformance.coverage_a && <p>Coverage A: {responseData.conformance.coverage_a} </p>}
              {responseData.conformance.coverage_b && <p>Coverage B: {responseData.conformance.coverage_b} </p>}
              {responseData.conformance.duplicate_coverage_a && <p>Duplicate Coverage A: {responseData.conformance.duplicate_coverage_a} </p>}
              {responseData.conformance.duplicate_coverage_b && <p>Duplicate Coverage B: {responseData.conformance.duplicate_coverage_b} </p>}
              
            </>
          )}
          
        </div>
      )}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}  {/* Show error message */}
    </div>
  );
};

export default FileUpload;