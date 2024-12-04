import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

// Define interfaces for the response data structure
interface BasicInfo {
  total_places: number;
  total_transitions: number;
  total_arcs: number;
}

interface SimilarityMeasures {
  trace_similarity: string;
  eventually_follows_similarity: string;
  trace_similarity_perfect: string;
  a_subset_b?: string;
}

interface ConformanceMeasures {
  coverage_a?: string;
  coverage_b?: string;
  duplicate_coverage_a?: string;
  duplicate_coverage_b?: string;
}

interface ResponseData {
  basic: {
    lpms_a: BasicInfo;
    lpms_b: BasicInfo;
  };
  xes?: string;
  similarity?: SimilarityMeasures;
  conformance?: ConformanceMeasures;
}

const FileUpload: React.FC = () => {
  // State for file inputs
  const [pnmlFilesSideA, setPnmlFilesSideA] = useState<File[]>([]); // Side A .pnml files
  const [pnmlFilesSideB, setPnmlFilesSideB] = useState<File[]>([]); // Side B .pnml files
  const [xesFile, setXesFile] = useState<File | null>(null); // Optional .xes file

  // State for feedback and response
  const [uploadProgress, setUploadProgress] = useState<string | null>(null); // Track upload progress
  const [responseData, setResponseData] = useState<ResponseData | null>(null); // Hold server response
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error messages

  // Make GET request after reloading the page
  useEffect(() => {
    axios
      .get<ResponseData>('/api/report')
      .then((response) => {
        setResponseData(response.data);
      })
      .catch((error) => {
        if (error.response?.status === 500) {
          setErrorMessage('Internal server error');
        } else {
          setErrorMessage('An error occurred while fetching the report.');
        }
      });
  }, []);

  // Handle .pnml files for Side A
  const handlePnmlFilesSideAChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPnmlFilesSideA(Array.from(e.target.files));
    }
  };

  // Handle .pnml files for Side B
  const handlePnmlFilesSideBChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPnmlFilesSideB(Array.from(e.target.files));
    }
  };

  // Handle .xes file
  const handleXesFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setXesFile(e.target.files[0]);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData();

    // Append multiple .pnml files for Side A
    pnmlFilesSideA.forEach((file) => {
      formData.append('pnml_side_a', file);
    });

    // Append multiple .pnml files for Side B
    pnmlFilesSideB.forEach((file) => {
      formData.append('pnml_side_b', file);
    });

    // Optionally append the .xes file
    if (xesFile) {
      formData.append('xes_file', xesFile);
    }

    try {
      const response = await axios.post<ResponseData>('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(`${percentCompleted}%`);
          }
        },
      });

      // Handle success response
      setResponseData(response.data);
      setUploadProgress(null);
      setErrorMessage(null);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'File upload failed');
      setUploadProgress(null);
    }
  };

  return (
    <div>
      <h2>Upload Multiple .pnml Files and Optional .xes File</h2>
      <form onSubmit={handleFileUpload}>
        <h3>Side A (.pnml Files)</h3>
        <input
          type="file"
          accept=".pnml, .apnml"
          multiple
          onChange={handlePnmlFilesSideAChange}
        />

        <h3>Side B (.pnml Files)</h3>
        <input
          type="file"
          accept=".pnml, .apnml"
          multiple
          onChange={handlePnmlFilesSideBChange}
        />

        <h3>Optional .xes File</h3>
        <input type="file" accept=".xes" onChange={handleXesFileChange} />

        <button type="submit">Upload</button>
      </form>

      {uploadProgress && <p>Uploading: {uploadProgress}</p>}
      {responseData && (
  <div>
    <h2>Server Response:</h2>
    {responseData.basic?.lpms_a && (
      <p>
        Side A - Places: {responseData.basic.lpms_a.total_places}, Transitions:{" "}
        {responseData.basic.lpms_a.total_transitions}, Arcs:{" "}
        {responseData.basic.lpms_a.total_arcs}
      </p>
    )}
    {responseData.basic?.lpms_b && (
      <p>
        Side B - Places: {responseData.basic.lpms_b.total_places}, Transitions:{" "}
        {responseData.basic.lpms_b.total_transitions}, Arcs:{" "}
        {responseData.basic.lpms_b.total_arcs}
      </p>
    )}
    {responseData.xes && <p>Event Log Length: {responseData.xes}</p>}
    {responseData.similarity && (
      <>
        <h3>Similarity Measures</h3>
        <p>Trace Sim (Leven): {responseData.similarity.trace_similarity}</p>
        <p>Eventually Follows Sim: {responseData.similarity.eventually_follows_similarity}</p>
        <p>Exact Trace Sim: {responseData.similarity.trace_similarity_perfect}</p>
        {responseData.similarity.a_subset_b === "True" && <p>Set A is a subset of Set B</p>}
      </>
    )}
    {responseData.conformance && (
      <>
        <h3>Conformance Measures</h3>
        {responseData.conformance.coverage_a && <p>Coverage A: {responseData.conformance.coverage_a}</p>}
        {responseData.conformance.coverage_b && <p>Coverage B: {responseData.conformance.coverage_b}</p>}
        {responseData.conformance.duplicate_coverage_a && <p>Duplicate Coverage A: {responseData.conformance.duplicate_coverage_a}</p>}
        {responseData.conformance.duplicate_coverage_b && <p>Duplicate Coverage B: {responseData.conformance.duplicate_coverage_b}</p>}
      </>
    )}
  </div>
)}

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default FileUpload;
