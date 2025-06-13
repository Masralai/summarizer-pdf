"use client"; //(needed for useState)
import { use, useState } from "react";
import axios from "axios";
import Silk from './Silk/Silk';

export default function Home() {
  const [file, setFile] = useState<File | null>(null); //Stores PDF file
  const [summary, setSummary] = useState<string>(""); //stores summary
  const [isLoading, setIsLoading] = useState<boolean>(false); // tracks processing
  const [error, setError] = useState<string>(""); //stores error messages

  //handles file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
    setSummary('')
    setError('')

    console.log("file selected", selectedFile?.name, 'size:', selectedFile?.size, 'bytes')
  }

  //to test backend connection
  const testConnection = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('http://localhost:5000/health')

      alert(`Backend says: ${response.data.status} `)
      console.log('Backend response:', response.data)
    } catch (error) {
      console.log('connection falied:', error)
      setError('cannot connect to backend . Make sure flask server is running on port 5000')
    } finally {
      setIsLoading(false)
    }
  }

  //handle pdf summarization
  const handleSubmit = async () => {
    if (!file) {
      setError('please select a PDF file first')
      return
    }

    if (file.type !== 'application/pdf') {
      setError('please selct a valid PDF file')
      return
    }

    //clear prev results
    setError('')
    setSummary('')
    setIsLoading(true)

    try {
      const formData = new FormData() //standard way to send files via HTTP
      formData.append('file', file)
      console.log('sending file to backend:', file.name)

      //POST request to our summarize endpoint
      const response = await axios.post('http://localhost:5000/summarize', formData, {
        headers: {
          "Content-Type": 'multipart/form-data' //Tells server we're sending a file
        },
        //to track upload progress
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          console.log(`upload progress : ${percentCompleted}%`)
        }
      })

      if (response.data.success) {
        setSummary(response.data.summary)
        console.log('summary generated', {
          originallength: response.data.original_length,
          summaryLength: response.data.summary_length,
          wordCount: response.data.word_count,
          summaryWordCount: response.data.summary_word_count
        })
      } else {
        setError('Failed to generate summary')
      }

    } catch (error: any) {
      console.error('Error processing PDF:', error)

      //error handling
      if (error.response) {
        setError(error.response.data.error || 'server error occured')
      } else if (error.request) {
        setError('Cannot connect to server. Make sure the backend is running.')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }

  }

  //server status
  const serverStat = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('http://localhost:5000/status')

      alert(`Backend says: ${response.data.time},\n${response.data.version} `)
      console.log('Backend response:', response.data)
    } catch (error) {
      console.log('connection falied:', error)
      setError('cannot connect to backend . Make sure flask server is running on port 5000')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="container mx-auto p-8 amx-w-4xl">
      {/* <Silk
        speed={5}
        scale={1}
        color="#7B7481"
        noiseIntensity={1.5}
        rotation={0}
      ></Silk> */}

      {/* Main heading */}
      <h1 className="text-4xl font-bold mb-2 text-center">PDF summarizer</h1>
      <p className="text-gray-600 text-center mb-8">Upload a PDF and get it summarized</p>

      {/* Connection test section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Backend Connection Test</h2>
        <button onClick={testConnection} disabled={isLoading} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400">{isLoading ? 'Testing...' : 'Test Backend Connection'}</button>
        {/* server status*/}
        {/* <button onClick={serverStat} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400">Server Status</button> */}

        <p className="text-sm text-gray-600 mt-2">to verify backend is running</p>
      </div>

      {/* File upload section */}
      <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Select PDF file</h2>

        <input type="file" accept=".pdf" onChange={handleFileChange}
          className="mb-4 block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />

        {/* Show selected file info */}
        {file && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="text-sm">
              <strong>Selected:</strong>{file.name}
              <span className="text-gray-600">({Math.round(file.size / 1024)}KB)</span>
            </p>
          </div>
        )}

        {/* Process Button */}
        <button onClick={handleSubmit} disabled={!file || isLoading} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not allowed font-semibold">{isLoading ? 'Processing...' : 'summarize PDF'}</button>

      </div>

      {/* Error info*/}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-green-800">Summary</h2>
          <div className="prose max-w-none">
            <p className="text-gray-800 leading-relaxed">{summary}</p>
          </div>
        </div>
      )}





    </div>


  )
}
