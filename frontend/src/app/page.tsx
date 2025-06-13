"use client"; //(needed for useState)
import { use, useState } from "react";
import axios from "axios";

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
    console.log('Ready to process file:', {
      name: file.name,
      size: file.size,
      type: file.type
    })
    alert(`File "${file.name}" ready for processing `)
  }




  return (
    <div className="container mx-auto p-8 amx-w-4xl">
      {/* Main heading */}
      <h1 className="text-4xl font-bold mb-2 text-center">PDF summarizer</h1>
      <p className="text-gray-600 text-center mb-8">Upload a PDF and get it summarized</p>
    
      {/* Connection test section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Backend Connection Test</h2>
        <button onClick={testConnection} disabled={isLoading} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400">{isLoading ? 'Testing...': 'Test Backend Connection'}</button>
        <p className="text-sm text-gray-600 mt-2">to verify backend is running</p>
      </div>


    </div>
    
  
  )
}
