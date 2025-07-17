import { useState, useRef } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
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
import { parse } from "papaparse";

const Converter = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [error, setError] = useState("");
  const [srtContent, setSrtContent] = useState("");
  const [hasHeaders, setHasHeaders] = useState(false);
  const [headers, setHeaders] = useState({
    startTime: "start_time",
    endTime: "end_time",
    text: "subtitle_text",
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
        setError("");
      },
      error: () => setError("Error parsing CSV file."),
    });
  };

  const resetFileInput = () => {
    setFileInputKey(fileInputKey + 1);
    setCsvFile(null);
    setCsvFileName("");
    fileInputRef.current.value = "";
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

  const handleSampleDownload = () => {
    const sampleCsv = hasHeaders
      ? `"${headers.startTime}","${headers.endTime}","${headers.text}"\n"00:00:01,000","00:00:03,000","Hello, world!"\n"00:00:04,000","00:00:06,000","This is a sample subtitle."`
      : `"00:00:01,000","00:00:03,000","Hello, world!"\n"00:00:04,000","00:00:06,000","This is a sample subtitle."`;
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_subtitle.csv";
    link.click();
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
    setHeaders({
      startTime: "start_time",
      endTime: "end_time",
      text: "subtitle_text",
    });
    resetFileInput();
  };

  return (
    <Container
      className="converter-card w-100 mx-auto p-4 bg-light shadow rounded"
      style={{ maxWidth: "900px" }}
    >
      <h1 className="mb-4 d-flex align-items-center">
        <FontAwesomeIcon icon={faFileCsv} className="me-2" />
        CSV to SRT Converter
      </h1>
      <Form>
        <Form.Group controlId="formFile" className="mb-4">
          <Form.Label className="d-flex align-items-center">
            <FontAwesomeIcon icon={faUpload} className="me-2" />
            Upload CSV File
          </Form.Label>
          <Form.Control
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            key={fileInputKey}
            className="w-100"
          />
        </Form.Group>
        <Form.Group controlId="formBasicCheckbox" className="mb-4">
          <Form.Check
            type="checkbox"
            label="CSV has headers"
            checked={hasHeaders}
            onChange={(e) => setHasHeaders(e.target.checked)}
          />
        </Form.Group>
        {hasHeaders && (
          <>
            {["startTime", "endTime", "text"].map((header) => (
              <Form.Group key={header} controlId={header} className="mb-4">
                <Form.Label>{`${
                  header.charAt(0).toUpperCase() + header.slice(1)
                } Header`}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={`Enter the header name for ${header}`}
                  value={headers[header]}
                  onChange={handleHeaderChange}
                  className="w-100"
                />
              </Form.Group>
            ))}
          </>
        )}
        {error && (
          <Alert variant="danger" className="mb-4">
            <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
            {error}
          </Alert>
        )}
        {srtContent && (
          <Alert variant="success" className="mb-4">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            SRT conversion successful.
          </Alert>
        )}
        <div className="d-flex flex-nowrap gap-2">
          <Button
            variant="primary"
            onClick={handleConvert}
            className="btn-sm me-2"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="me-1" />
            Convert to SRT
          </Button>
          {srtContent && (
            <Button
              variant="success"
              onClick={handleDownload}
              className="btn-sm me-2"
            >
              <FontAwesomeIcon icon={faDownload} className="me-1" />
              Download SRT
            </Button>
          )}
          <Button
            variant="info"
            onClick={handleSampleDownload}
            className="btn-sm me-2"
          >
            <FontAwesomeIcon icon={faDownload} className="me-1" />
            Sample CSV
          </Button>
          <Button variant="secondary" onClick={handleReset} className="btn-sm">
            <FontAwesomeIcon icon={faSync} className="me-1" />
            Reset
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default Converter;
