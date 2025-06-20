"use client"; //(needed for useState)
import { use, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button"


interface summaryStats {
  original_length: number;
  summary_length: number;
  original_word_count: number;
  summary_word_count: number;
  original_sentences: number;
  summary_sentences: number;
  compression_ratio: number;
}

interface summaryResp {
  success: boolean;
  filename: string;
  summary: string;
  algorithm_used: string;
  statistics: summaryStats;
  params: {
    algorithm: string;
    num_sentences: number;
  };
}

interface Algorithm {
  name: string;
  desc: string;
  best_for: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null); //Stores PDF file
  const [summary, setSummary] = useState<string>(""); //stores summary
  const [isLoading, setIsLoading] = useState<boolean>(false); // tracks processing
  const [error, setError] = useState<string>(""); //stores error messages

  const [algorithm, setAlgorithm] = useState<string>("frequency");
  const [numSentences, setNumSentences] = useState<number>(3);
  const [summaryStats, setSummaryStats] = useState<summaryStats | null>(null);
  const [algorithmUsed, setAlgorithmUsed] = useState<string>("");
  const [availableAlgorithms, setAvailableAlgorithms] = useState<
    Record<string, Algorithm>
  >({});
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  //handles file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setSummary("");
    setError("");

    console.log(
      "file selected",
      selectedFile?.name,
      "size:",
      selectedFile?.size,
      "bytes"
    );
  };

  //to test backend connection
  const testConnection = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:5000/health");

      alert(`Backend says: ${response.data.status} `);
      console.log("Backend response:", response.data);
    } catch (error) {
      console.log("connection falied:", error);
      setError(
        "cannot connect to backend . Make sure flask server is running on port 5000"
      );
    } finally {
      setIsLoading(false);
    }
  };

  //handle pdf summarization
  const handleSubmit = async () => {
    if (!file) {
      setError("please select a PDF file first");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("please selct a valid PDF file");
      return;
    }

    //clear prev results
    setError("");
    setSummary("");
    setIsLoading(true);

    try {
      const formData = new FormData(); //standard way to send files via HTTP
      formData.append("file", file);
      formData.append("algorithm", algorithm);
      formData.append("num_sentences", numSentences.toString());
      console.log("sending file to backend:", file.name);
      console.log("parameters: ", { algorithm, numSentences });

      //POST request to our summarize endpoint
      const response = await axios.post<summaryResp>(
        "http://localhost:5000/summarize",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", //Tells server we're sending a file
          },
          //to track upload progress
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percentCompleted);
            console.log(`upload progress : ${percentCompleted}%`);
          },
        }
      );

      if (response.data.success) {
        setSummary(response.data.summary);
        setSummaryStats(response.data.statistics);
        setAlgorithmUsed(response.data.algorithm_used);
        console.log("summary generated", {
          algorithm: response.data.algorithm_used,
          stats: response.data.statistics,
        });
      } else {
        setError("Failed to generate summary");
      }
    } catch (error: any) {
      console.error("Error processing PDF:", error);

      //error handling
      if (error.response) {
        setError(error.response.data.error || "server error occured");
      } else if (error.request) {
        setError("Cannot connect to server. Make sure the backend is running.");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  //server status
  const serverStat = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:5000/status");

      alert(`Backend says: ${response.data.time},\n${response.data.version} `);
      console.log("Backend response:", response.data);
    } catch (error) {
      console.log("connection falied:", error);
      setError(
        "cannot connect to backend . Make sure flask server is running on port 5000"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto p-8 max-w-4xl">
        {/* Main heading */}
        <h1 className="text-4xl font-bold mb-2 text-center text-white">PDF <span className="text-[#1DCD9F]">Summarizer</span>
                    </h1>
        <p className="text-gray-400 text-center mb-8">
          Upload a PDF and get it summarized
        </p>  

        {/* Connection test section */}

        {/* <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2 text-blue-400">
          Backend Connection Test
        </h2>
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isLoading ? "Testing..." : "Test Backend Connection"}
        </button>
  
        <p className="text-sm text-gray-600 mt-2">
          to verify backend is running
        </p>
      </div> */}
        {/* server status*/}
        {/* <button onClick={serverStat} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400">Server Status</button> */}



        {/*config section */}
        <div className="mb-6 p-6 bg-[#222222] rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-300">
            Summarization Settings
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Algorithm Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                                Summarization Algorithm
                            </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1DCD9F] focus:border-[#1DCD9F] text-white transition-all duration-200"
              >
                <option value="frequency">Frequency Analysis (Fast)</option>
                <option value="tfidf">TF-IDF (Balanced)</option>
                <option value="textrank">TextRank (Advanced)</option>
                <option value="llm">LLM-Based (Advanced)</option>
              </select>

              {/* Algorithm description */}
              {availableAlgorithms[algorithm] && (
                <div className="mt-2 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-700">
                    <strong>{availableAlgorithms[algorithm].name}:</strong>{" "}
                    {availableAlgorithms[algorithm].desc}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Best for: {availableAlgorithms[algorithm].best_for}
                  </p>
                </div>
              )}
            </div>

            {/* Summary Length Control */}
            {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary Length: {numSentences} sentences
            </label>
            <input
              type="range"
              min="2"
              max="10"
              value={numSentences}
              onChange={(e) => setNumSentences(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2 (Brief)</span>
              <span>6 (Balanced)</span>
              <span>10 (Detailed)</span>
            </div>
          </div> */}
          </div>
        </div>

        {/* File upload section */}
        <div className="mb-6 p-6 bg-[#222222] border-2 border-gray-300 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-slate-300">Select PDF file</h2>

          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
           className="w-full bg-gray-800 border my-2 border-gray-600 rounded-lg text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1DCD9F] file:text-black file:font-medium hover:file:bg-[#169976] transition-all duration-200"
                    />

          {/* Show selected file info */}
          {/* {file && (
            <div className="mb-4 p-3 bg-slate-600 rounded">
              <p className="text-sm text-[#222222]">
                <strong>Selected:</strong>
                {file.name}
                <span className="text-gray-600">
                  ({Math.round(file.size / 1024)}KB)
                </span>
              </p>
            </div>
          )} */}

          {/* Upload Progress */}
          {isLoading && uploadProgress > 0 && (
                        <div className="mt-6">
                            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-[#1DCD9F] to-[#169976] h-3 rounded-full transition-all duration-300 shadow-lg"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-gray-400 mt-2 text-center">
                                Uploading: {uploadProgress}%
                            </p>
                        </div>
                    )}
          {/* Process Button */}
          <Button 
            onClick={handleSubmit}
            disabled={!file || isLoading}
            className="bg-[#1DCD9F] text-black hover:bg-[#169976]"
          >
            {isLoading ? "Processing..." : "Summarize PDF"}
          </Button>
        </div>

        {/* Error info*/}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Summary Statistics */}
        {/* {summaryStats && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Summary Statistics
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-gray-700">Algorithm Used</h4>
              <p className="text-2xl font-bold text-blue-600">
                {algorithmUsed}
              </p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-gray-700">Compression Ratio</h4>
              <p className="text-2xl font-bold text-green-600">
                {summaryStats.compression_ratio}%
              </p>
              <p className="text-sm text-gray-500">Original to summary</p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-gray-700">Word Reduction</h4>
              <p className="text-2xl font-bold text-purple-600">
                {summaryStats.original_word_count} →{" "}
                {summaryStats.summary_word_count}
              </p>
              <p className="text-sm text-gray-500">
                Saved{" "}
                {summaryStats.original_word_count -
                  summaryStats.summary_word_count}{" "}
                words
              </p>
            </div>
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-gray-700">Sentences</h4>
              <p className="text-lg">
                <span className="font-bold text-gray-800">
                  {summaryStats.original_sentences}
                </span>
                <span className="text-gray-500"> → </span>
                <span className="font-bold text-blue-600">
                  {summaryStats.summary_sentences}
                </span>
              </p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-gray-700">Characters</h4>
              <p className="text-lg">
                <span className="font-bold text-gray-800">
                  {summaryStats.original_length.toLocaleString()}
                </span>
                <span className="text-gray-500"> → </span>
                <span className="font-bold text-green-600">
                  {summaryStats.summary_length.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </div>
      )} */}

        {/* Enhanced Summary Display */}
        {summary && (
          <div className="mt-8 p-8 bg-[#222222] border border-gray-700 rounded-xl shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-slate-200">Summary</h2>
              <div className="flex space-x-2">
                {/* Copy to Clipboard Button */}
                <Button
                  onClick={() => navigator.clipboard.writeText(summary)}
                >
                  Copy
                </Button>
                {/*  Download as Text Button */}
                <Button
                  onClick={() => {
                    const element = document.createElement("a");
                    const file = new Blob([summary], { type: "text/plain" });
                    element.href = URL.createObjectURL(file);
                    element.download = `${file?.name || "document"}_summary.txt`;
                    document.body.appendChild(element); // Required for this to work in FireFox
                    element.click();
                    document.body.removeChild(element);
                  }}

                >
                  Download
                </Button>
              </div>
            </div>

            <div className="prose max-w-none">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 shadow-inner">
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-lg">
                  {summary}
                </p>
              </div>
            </div>

            {/* Summary metadata */}
            {algorithmUsed && (
              <div className="mt-6 pt-6 border-t border-gray-600">
                <p className="text-gray-400">
                  Generated using <strong className="text-[#1DCD9F]">{algorithmUsed}</strong> 
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Tips Section */}
        <div className="mt-8 p-6 bg-[#222222] border border-gray-700 rounded-lg">
          <h3 className="text-2xl font-semibold mb-3 text-slate-300">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <strong className="text-[#1DCD9F]">Frequency Analysis:</strong>
              <span className="text-gray-300"> Best for general documents, fastest processing</span>
            </li>
            <li>
              <strong className="text-[#1DCD9F]">TF-IDF:</strong>
              <span className="text-gray-300"> Great for technical documents, identifies key concepts</span>
            </li>
            <li>
              <strong className="text-[#1DCD9F]">TextRank:</strong>
              <span className="text-gray-300"> Best for academic papers, finds interconnected ideas</span>
            </li>
            <li>
              <strong className="text-[#1DCD9F]">LLM-based:</strong>
              <span className="text-gray-300"> Detailed and versatile approach for everyday tasks</span>
            </li>

          </ul>
        </div>
      </div>
    </div>
  );
}
