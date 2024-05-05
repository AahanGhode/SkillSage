import React, { useRef, useState } from "react";
import "./FileUpload.css";
import axios from "axios";
const FileUpload = () => {
  const inputRef = useRef();

  //State variables for tracking file-related information
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("select");

  //Handle file change event
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Function to trigger file input dialog
  const onChooseFile = () => {
    inputRef.current.click();
  };

  //Function to clear selected file
  const clearFileInput = () => {
    inputRef.current.value = "";
    setSelectedFile(null);
    setProgress(0); 
    setUploadStatus("select");
  };

  //Function to start processing the file
  const startProcessing = async () => {
    console.log("start processing")
    const response = await axios.post(
      "http://localhost:3001/startprocessing",
      { text: selectedFile.name }
    )
    console.log(response.data);
  }

  //Function to handle file upload
  const handleUpload = async () => {
    //If upload is already done, clear and return 
    if (uploadStatus === "done") {
      clearFileInput();
      return;
    }

    try {
      //Set upload status to 'uploading'
      setUploadStatus("uploading");

      //Create FormData and apppend the selected file
      const formData = new FormData();
      formData.append("file", selectedFile);

      //Make a POST request to the server with the file
      await axios.post(
        "http://localhost:3001/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            //Calculate upload progress
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        },
      );
      setUploadStatus("done");
    } catch (error) {
      setUploadStatus("select");
    }
  }

  return (
    <>
      {/* File input  element with a reference*/}
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept=".pdf,.txt"
      />

      {/* Button to trigger file input dialog */}
      {!selectedFile && (
        <button className="file-btn" onClick={onChooseFile}>
          <span className="material-symbols-outlined">upload</span> Upload File
        </button>
      )}

      {/* Display file information  and progress when a file is selected*/}
      {selectedFile && (
        <div>
          <div className="file-card">
            <span className="material-symbols-outlined icon">description</span>

            <div className="file-info">
              <div style={{ flex: 1 }}>
                {/*Display file name here and progress bar*/}
                <h6>{selectedFile.name}</h6>
                <div className="progress-bg">
                  <div className="progress" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/*Display clear button or upload progress/checkmark*/}
                {uploadStatus === "select" ? (
                  <button onClick={clearFileInput}>
                  <span className="material-symbols-outlined close-icon">
                    close
                  </span>
                </button>
                ) : (
                  <div className="check-circle">
                    {uploadStatus === "uploading" ? (
                      `${progress}%`
                    ) : uploadStatus === "done" ? (
                      <span
                        className="material-symbols-outlined"
                        style = {{ fontSize: "20px"}}
                      >
                        check
                      </span>
                    ) : null}
                  </div>
                )}

            </div>
          </div>

          {/*Button to finalize upload or clear section*/}
          <button className="upload-btn" onClick={uploadStatus === "done" ? startProcessing : handleUpload}>
            {uploadStatus === "select" || uploadStatus ==="uploading"
              ? "Upload"
              : "Done"}
          </button> 
        </div>
      )}
    </>
  );
};

export default FileUpload;