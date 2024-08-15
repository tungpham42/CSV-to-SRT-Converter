import React, { useState, useRef } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { parse } from "papaparse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileCsv,
  faUpload,
  faPaperPlane,
  faDownload,
  faSync,
  faExclamationCircle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

const Converter = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [error, setError] = useState("");
  const [srtContent, setSrtContent] = useState("");
  const [hasHeaders, setHasHeaders] = useState(false);
  const [headers, setHeaders] = useState({
    startTime: "",
    endTime: "",
    text: "",
  });

  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      setCsvFileName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleConvert = () => {
    if (!csvFile) {
      setError("Please upload a CSV file.");
      return;
    }

    if (
      hasHeaders &&
      (!headers.startTime || !headers.endTime || !headers.text)
    ) {
      setError("Please provide custom header names.");
      return;
    }

    parse(csvFile, {
      header: hasHeaders,
      complete: (results) => {
        const srtString = hasHeaders
          ? convertCSVToSRTWithHeaders(results.data)
          : convertCSVToSRTWithoutHeaders(results.data);
        setSrtContent(srtString);
        setError(""); // Clear error after successful conversion
      },
      error: () => setError("Error parsing CSV file."),
    });
  };

  const resetFileInput = () => {
    setFileInputKey(fileInputKey + 1);
    setCsvFile(null);
    setCsvFileName("");
    fileInputRef.current.value = ""; // Reset the actual file input element
  };

  const convertCSVToSRTWithHeaders = (data) => {
    return data.reduce((srt, row, index) => {
      if (row[headers.startTime] && row[headers.endTime] && row[headers.text]) {
        srt += `${index + 1}\n${row[headers.startTime]} --> ${
          row[headers.endTime]
        }\n${row[headers.text]}\n\n`;
      }
      return srt;
    }, "");
  };

  const convertCSVToSRTWithoutHeaders = (data) => {
    return data.reduce((srt, row, index) => {
      if (row.length >= 3) {
        srt += `${index + 1}\n${row[0]} --> ${row[1]}\n${row[2]}\n\n`;
      }
      return srt;
    }, "");
  };

  const handleDownload = () => {
    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${csvFileName}.srt`;
    link.click();
    handleReset();
  };

  const handleHeaderChange = (e) => {
    const { id, value } = e.target;
    setHeaders((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setCsvFile(null);
    setCsvFileName("");
    setError("");
    setSrtContent("");
    setHasHeaders(false);
    setHeaders({ startTime: "", endTime: "", text: "" });
    resetFileInput(); // Reset file input field
  };

  return (
    <Container className="col-xl-6 col-lg-6 col-md-8 col-sm-12 col-12">
      <h1 className="mt-5">
        <FontAwesomeIcon icon={faFileCsv} className="me-2" />
        CSV to SRT Converter
      </h1>
      <Form>
        <Form.Group key={fileInputKey} controlId="formFile" className="my-3">
          <Form.Label>
            <FontAwesomeIcon icon={faUpload} className="me-2" />
            Upload CSV File
          </Form.Label>
          <Form.Control
            size="md"
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            key={fileInputKey} // Ensure the key changes when resetting
          />
        </Form.Group>
        <Form.Group controlId="formBasicCheckbox" className="my-3">
          <Form.Check
            size="md"
            type="checkbox"
            label="CSV has headers"
            checked={hasHeaders}
            onChange={(e) => setHasHeaders(e.target.checked)}
          />
        </Form.Group>
        {hasHeaders && (
          <>
            {["startTime", "endTime", "text"].map((header) => (
              <Form.Group key={header} controlId={header} className="my-3">
                <Form.Label>{`${
                  header.charAt(0).toUpperCase() + header.slice(1)
                } Header`}</Form.Label>
                <Form.Control
                  size="md"
                  type="text"
                  placeholder={`Enter the header name for ${header}`}
                  value={headers[header]}
                  onChange={handleHeaderChange}
                />
              </Form.Group>
            ))}
          </>
        )}
        {error && (
          <Alert variant="danger">
            <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
            {error}
          </Alert>
        )}
        {srtContent && (
          <Alert variant="success">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            SRT conversion successful.
          </Alert>
        )}
        <Button size="md" variant="primary" onClick={handleConvert}>
          <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
          Convert to SRT
        </Button>
        {srtContent && (
          <Button
            size="md"
            variant="success"
            className="ms-3"
            onClick={handleDownload}
          >
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Download SRT
          </Button>
        )}
        <Button
          size="md"
          variant="secondary"
          className="ms-3"
          onClick={handleReset}
        >
          <FontAwesomeIcon icon={faSync} className="me-2" />
          Reset
        </Button>
      </Form>
    </Container>
  );
};

export default Converter;
