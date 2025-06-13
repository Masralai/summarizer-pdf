Project Overview & Learning Objectives

How React and Next.js handle file uploads and API communication
How Flask creates REST APIs and processes files
How NLTK works for natural language processing
How frontend and backend communicate through HTTP requests
File processing and text extraction techniques

The Architecture (and why we chose it):

Next.js Frontend: Handles user interface, file uploads, and displaying results. Next.js gives us server-side rendering and easy API routes if needed.
Flask Backend: Processes the heavy lifting - PDF parsing and text summarization. Python is perfect for NLP tasks.
NLTK: Natural Language Toolkit for text processing and summarization algorithms.

## Phase 1: Foundation Setup - Understanding Each Component

Step 1: Environment Setup (Why we do this first)
Backend Environment:
pip install flask # Web framework for our API
pip install flask-cors # Allows frontend to talk to backend (different ports)
pip install nltk # Natural language processing library
pip install PyPDF2 # PDF text extraction
pip install python-dotenv # Environment variables management

Step 2: Basic Flask API - Your First REST Endpoint

# Import the tools we need

from flask import Flask, request, jsonify # Flask for web server, request for incoming data, jsonify for JSON responses
from flask_cors import CORS # Allows our React app to talk to this Flask app

# Create our Flask application instance

app = Flask(**name**)

# Enable CORS - this is crucial! Without it, browsers block requests between localhost:3000 and localhost:5000

# CORS = Cross-Origin Resource Sharing

CORS(app)

# Our first endpoint - a health check

# @app.route creates a URL endpoint that responds to HTTP requests

@app.route('/health', methods=['GET']) # GET request to /health
def health_check():
"""
This endpoint tells us if our backend is running correctly.
Every good API needs a health check endpoint for debugging.
"""
return jsonify({"status": "Backend is running!", "message": "Flask server is healthy"})

# Our main endpoint that will eventually handle PDF processing

@app.route('/summarize', methods=['POST']) # POST because we're sending file data
def summarize_pdf():
"""
This will be our main endpoint for processing PDFs.
We use POST because we're sending data (the PDF file) to the server.
For now, it just returns a placeholder response.
""" # TODO: We'll implement PDF processing here in the next phase
return jsonify({
"summary": "PDF processing coming soon!",
"status": "endpoint ready"
})

# This runs our Flask app when we execute this file directly

if **name** == '**main**': # debug=True gives us helpful error messages and auto-reloads on code changes # port=5000 sets which port our backend runs on (different from frontend)
app.run(debug=True, port=5000)

Creates a web server that listens on port 5000
Provides two endpoints: /health (for testing) and /summarize (our main feature)
Handles CORS so our frontend can communicate with it
Returns JSON responses (the standard for modern APIs)

Step 3: Next.js Frontend - Understanding React File Handling
frontend/src/app/page.tsx:

'use client' // This tells Next.js this is a client-side component (needed for useState)

import { useState } from 'react' // React hook for managing component state
import axios from 'axios' // HTTP client for making API requests (we'll install this)

export default function Home() {
// State management - these variables will re-render the component when they change
const [file, setFile] = useState<File | null>(null) // Stores the selected PDF file
const [summary, setSummary] = useState<string>('') // Stores the summarization result
const [isLoading, setIsLoading] = useState<boolean>(false) // Tracks if we're processing
const [error, setError] = useState<string>('') // Stores any error messages

// Function to handle file selection
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
/\*\*
_ This runs when user selects a file.
_ event.target.files is an array-like object of selected files.
_ We take the first file ([0]) since we only allow single file selection.
_/
const selectedFile = event.target.files?.[0] || null
setFile(selectedFile)

    // Clear previous results when new file is selected
    setSummary('')
    setError('')

    console.log('File selected:', selectedFile?.name, 'Size:', selectedFile?.size, 'bytes')

}

// Function to test our backend connection
const testConnection = async () => {
/\*\*
_ This function tests if our backend is running by calling the /health endpoint.
_ It's a good debugging tool and demonstrates basic API communication.
\*/
try {
setIsLoading(true)
// axios.get makes an HTTP GET request to our Flask backend
const response = await axios.get('http://localhost:5000/health')

      // If successful, show the backend's response
      alert(`Backend says: ${response.data.status}`)
      console.log('Backend response:', response.data)

    } catch (error) {
      // If it fails, show an error (backend probably not running)
      console.error('Connection failed:', error)
      setError('Cannot connect to backend. Make sure Flask server is running on port 5000.')
    } finally {
      setIsLoading(false)  // Always stop loading, whether success or failure
    }

}

// Function to handle PDF summarization (placeholder for now)
const handleSubmit = async () => {
/\*\*
_ This will eventually send the PDF to our backend for processing.
_ For now, it just validates that a file is selected.
\*/
if (!file) {
setError('Please select a PDF file first.')
return
}

    // Validate file type (basic client-side validation)
    if (file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.')
      return
    }

    console.log('Ready to process file:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // TODO: In next phase, we'll implement actual file upload to backend
    alert(`File "${file.name}" ready for processing! (Implementation coming next phase)`)

}

// The component's render function - what users see
return (
<div className="container mx-auto p-8 max-w-4xl">
{/_ Main heading _/}
<h1 className="text-4xl font-bold mb-2 text-center">PDF Summarizer</h1>
<p className="text-gray-600 text-center mb-8">Upload a PDF and get an AI-powered summary</p>

      {/* Connection test section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">🔧 Backend Connection Test</h2>
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Testing...' : 'Test Backend Connection'}
        </button>
        <p className="text-sm text-gray-600 mt-2">Click this to verify your Flask backend is running</p>
      </div>

      {/* File upload section */}
      <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">📄 Select PDF File</h2>

        {/* File input - browsers style this differently, but it's functional */}
        <input
          type="file"
          accept=".pdf"           // Only allow PDF files
          onChange={handleFileChange}
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
              <strong>Selected:</strong> {file.name}
              <span className="text-gray-600"> ({Math.round(file.size / 1024)} KB)</span>
            </p>
          </div>
        )}

        {/* Process button */}
        <button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
        >
          {isLoading ? 'Processing...' : 'Summarize PDF'}
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">❌ Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Summary display (for future use) */}
      {summary && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-green-800">📝 Summary</h2>
          <div className="prose max-w-none">
            <p className="text-gray-800 leading-relaxed">{summary}</p>
          </div>
        </div>
      )}
    </div>

)
}

Your First Learning Milestone 🎯
Goal: Understand how frontend and backend communicate
What you should accomplish:

Start Flask backend: Run python app.py in the backend folder
Start Next.js frontend: Run npm run dev in the frontend folder
Test the connection: Click "Test Backend Connection" button
Understand the flow:

Frontend makes HTTP request to localhost:5000/health
Flask backend receives request and sends JSON response
Frontend displays the response

Learning Questions (answer these to yourself):

What happens if you stop the Flask server and click "Test Backend Connection"?
Why do we need CORS? Try commenting out CORS(app) and see what happens.
What's the difference between GET and POST requests? Why do we use GET for /health and POST for /summarize?
Challenge Task: Add a new endpoint to your Flask backend called /status that returns information about the server (like current time, Python version, etc.). Then add a button to your frontend that calls this endpoint.
i compelted the challenge you gave; i used import sys import datetime  and put them in retun jsonify and now the alert correctly shows that, so the challenge is done

---
Phase 2: PDF Processing & Text Extraction
Now let's make your app actually read PDF files! This phase focuses on understanding file handling, text extraction, and basic NLP concepts.

Step 1: Understanding PDF Text Extraction
First, let's set up NLTK properly:

"""
This script downloads the NLTK data we need for text processing.
NLTK requires certain datasets to be downloaded before use.
Run this file once to set up NLTK properly.
"""
import nltk

# Download required NLTK data
# punkt: sentence tokenizer (splits text into sentences)
# stopwords: common words like "the", "and", "is" that we often ignore in NLP
# wordnet: dictionary for word meanings and synonyms
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

print("NLTK setup complete!")

Step 2: Enhanced Backend with PDF Processing
backend/app.py (updated with detailed explanations):

from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2  # For reading PDF files
import nltk    # Natural language processing
from nltk.corpus import stopwords  # Common words to filter out
from nltk.tokenize import sent_tokenize, word_tokenize  # Split text into sentences and words
from nltk.frequency import FreqDist  # Count word frequencies
import sys
import datetime
import io  # For handling file streams

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint - confirms server is running"""
    return jsonify({"status": "Backend is running!", "message": "Flask server is healthy"})

@app.route('/status', methods=['GET'])
def server_status():
    """Your challenge endpoint - shows server information"""
    return jsonify({
        "current_time": datetime.datetime.now().isoformat(),
        "python_version": sys.version,
        "server_status": "running",
        "nltk_available": True
    })

def extract_text_from_pdf(pdf_file):
    """
    Extract text from a PDF file using PyPDF2.
    
    Args:
        pdf_file: File object containing PDF data
    
    Returns:
        str: Extracted text from all pages
    """
    try:
        # Create a PDF reader object from the file
        # We use io.BytesIO because the file comes as bytes from the web request
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
        
        # Initialize empty string to store all text
        text = ""
        
        # Loop through each page in the PDF
        for page_num, page in enumerate(pdf_reader.pages):
            # Extract text from current page
            page_text = page.extract_text()
            text += page_text + "\n"  # Add newline between pages
            
            print(f"Extracted {len(page_text)} characters from page {page_num + 1}")
        
        print(f"Total text extracted: {len(text)} characters")
        return text
        
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def basic_summarize(text, num_sentences=3):
    """
    Create a basic summary using frequency analysis.
    This is a simple summarization algorithm that:
    1. Finds the most common important words
    2. Scores sentences based on these words
    3. Returns the highest-scoring sentences
    
    Args:
        text (str): The text to summarize
        num_sentences (int): Number of sentences to include in summary
    
    Returns:
        str: The summarized text
    """
    try:
        # Step 1: Clean and prepare the text
        # Convert to lowercase for consistency
        text_lower = text.lower()
        
        # Step 2: Split text into sentences
        # sent_tokenize intelligently splits text at sentence boundaries
        sentences = sent_tokenize(text)
        print(f"Found {len(sentences)} sentences in the document")
        
        # Step 3: Split text into words and remove stopwords
        # word_tokenize splits text into individual words
        words = word_tokenize(text_lower)
        
        # Get English stopwords (common words like "the", "and", "is")
        stop_words = set(stopwords.words('english'))
        
        # Filter out stopwords and non-alphabetic tokens
        filtered_words = [word for word in words if word.isalpha() and word not in stop_words]
        print(f"Filtered {len(words)} words down to {len(filtered_words)} meaningful words")
        
        # Step 4: Calculate word frequencies
        # FreqDist counts how often each word appears
        word_freq = FreqDist(filtered_words)
        
        # Get the most common words (these are likely important topics)
        most_common_words = word_freq.most_common(10)
        print(f"Most common words: {most_common_words}")
        
        # Step 5: Score each sentence based on important words
        sentence_scores = {}
        
        for sentence in sentences:
            # Convert sentence to lowercase and split into words
            sentence_words = word_tokenize(sentence.lower())
            
            # Calculate score: how many important words does this sentence contain?
            score = 0
            for word in sentence_words:
                if word in word_freq:
                    # Add the frequency of this word to the sentence score
                    score += word_freq[word]
            
            # Store the score for this sentence
            sentence_scores[sentence] = score
        
        # Step 6: Select the top-scoring sentences
        # Sort sentences by score (highest first)
        ranked_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Take the top N sentences
        top_sentences = [sentence for sentence, score in ranked_sentences[:num_sentences]]
        
        # Join them back into a summary
        summary = ' '.join(top_sentences)
        
        print(f"Generated summary with {len(top_sentences)} sentences")
        return summary
        
    except Exception as e:
        print(f"Error in summarization: {str(e)}")
        raise Exception(f"Failed to create summary: {str(e)}")

@app.route('/summarize', methods=['POST'])
def summarize_pdf():
    """
    Main endpoint for PDF summarization.
    Expects a PDF file in the request and returns a summary.
    """
    try:
        # Step 1: Check if a file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        # Check if file is actually selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Step 2: Validate file type
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Please upload a PDF file'}), 400
        
        print(f"Processing file: {file.filename}")
        
        # Step 3: Extract text from PDF
        pdf_content = file.read()  # Read the file content as bytes
        extracted_text = extract_text_from_pdf(pdf_content)
        
        # Check if we got any text
        if not extracted_text or len(extracted_text.strip()) < 50:
            return jsonify({'error': 'Could not extract enough text from PDF. The file might be image-based or corrupted.'}), 400
        
        # Step 4: Create summary
        summary = basic_summarize(extracted_text)
        
        # Step 5: Return the results
        return jsonify({
            'success': True,
            'filename': file.filename,
            'original_length': len(extracted_text),
            'summary_length': len(summary),
            'summary': summary,
            'word_count': len(extracted_text.split()),
            'summary_word_count': len(summary.split())
        })
        
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        return jsonify({'error': f'Error processing PDF: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

Step 3: Update Frontend to Handle File Uploads
frontend/src/app/page.tsx (update the handleSubmit function):

// Update the handleSubmit function in your existing file
const handleSubmit = async () => {
  /**
   * This function now actually sends the PDF to our backend for processing.
   * It uses FormData to send files via HTTP POST request.
   */
  if (!file) {
    setError('Please select a PDF file first.')
    return
  }

  // Validate file type (basic client-side validation)
  if (file.type !== 'application/pdf') {
    setError('Please select a valid PDF file.')
    return
  }

  // Clear previous results
  setError('')
  setSummary('')
  setIsLoading(true)

  try {
    // FormData is the standard way to send files via HTTP
    // It's like filling out a web form with file attachments
    const formData = new FormData()
    formData.append('file', file)  // 'file' matches what our Flask backend expects

    console.log('Sending file to backend:', file.name)

    // Make POST request to our summarize endpoint
    const response = await axios.post('http://localhost:5000/summarize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',  // Tells server we're sending a file
      },
      // Optional: track upload progress
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
        console.log(`Upload Progress: ${percentCompleted}%`)
      }
    })

    // If successful, display the summary
    if (response.data.success) {
      setSummary(response.data.summary)
      console.log('Summary generated:', {
        originalLength: response.data.original_length,
        summaryLength: response.data.summary_length,
        wordCount: response.data.word_count,
        summaryWordCount: response.data.summary_word_count
      })
    } else {
      setError('Failed to generate summary')
    }

  } catch (error: any) {
    console.error('Error processing PDF:', error)
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      setError(error.response.data.error || 'Server error occurred')
    } else if (error.request) {
      // Network error
      setError('Cannot connect to server. Make sure the backend is running.')
    } else {
      // Other error
      setError('An unexpected error occurred')
    }
  } finally {
    setIsLoading(false)  // Always stop loading
  }
}


Learning Milestone 2 🎯
Goal: Understand PDF processing and basic NLP

What you should accomplish:

Run the NLTK setup: Execute python setup_nltk.py
Test with a real PDF: Find a PDF file (like a research paper or article) and try summarizing it
Understand the process:
File upload → PDF text extraction → Word frequency analysis → Sentence scoring → Summary generation
Learning Questions:

What happens if you upload a very short PDF vs a long one?
Why do we remove stopwords? Try commenting out the stopword filtering and see how it affects the summary.
What's the difference between text extraction and summarization?

 am getting this error, Error processing PDF: Failed to create summary: ** Resource [93mpunkt_tab[0m not found. Please use the NLTK Downloader to obtain the resource: [31m>>> import nltk >>> nltk.download('punkt_tab') [0m For more information see: https://www.nltk.org/data.html Attempted to load [93mtokenizers/punkt_tab/english/[0m Searched in: - 'C:\\Users\\devde/nltk_data' - 'C:\\Python312\\nltk_data' - 'C:\\Python312\\share\\nltk_data' - 'C:\\Python312\\lib\\nltk_data' - 'C:\\Users\\devde\\AppData\\Roaming\\nltk_data' - 'C:\\nltk_data' - 'D:\\nltk_data' - 'E:\\nltk_data'

Perfect! This is a common NLTK issue. The error occurs because NLTK has updated its tokenizer models, and we need to download the newer punkt_tab model instead of just punkt.
































































































































