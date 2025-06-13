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
pip install flask          # Web framework for our API
pip install flask-cors     # Allows frontend to talk to backend (different ports)
pip install nltk          # Natural language processing library
pip install PyPDF2        # PDF text extraction
pip install python-dotenv # Environment variables management

Step 2: Basic Flask API - Your First REST Endpoint

# Import the tools we need
from flask import Flask, request, jsonify  # Flask for web server, request for incoming data, jsonify for JSON responses
from flask_cors import CORS                # Allows our React app to talk to this Flask app

# Create our Flask application instance
app = Flask(__name__)

# Enable CORS - this is crucial! Without it, browsers block requests between localhost:3000 and localhost:5000
# CORS = Cross-Origin Resource Sharing
CORS(app)

# Our first endpoint - a health check
# @app.route creates a URL endpoint that responds to HTTP requests
@app.route('/health', methods=['GET'])  # GET request to /health
def health_check():
    """
    This endpoint tells us if our backend is running correctly.
    Every good API needs a health check endpoint for debugging.
    """
    return jsonify({"status": "Backend is running!", "message": "Flask server is healthy"})

# Our main endpoint that will eventually handle PDF processing
@app.route('/summarize', methods=['POST'])  # POST because we're sending file data
def summarize_pdf():
    """
    This will be our main endpoint for processing PDFs.
    We use POST because we're sending data (the PDF file) to the server.
    For now, it just returns a placeholder response.
    """
    # TODO: We'll implement PDF processing here in the next phase
    return jsonify({
        "summary": "PDF processing coming soon!", 
        "status": "endpoint ready"
    })

# This runs our Flask app when we execute this file directly
if __name__ == '__main__':
    # debug=True gives us helpful error messages and auto-reloads on code changes
    # port=5000 sets which port our backend runs on (different from frontend)
    app.run(debug=True, port=5000)

Creates a web server that listens on port 5000
Provides two endpoints: /health (for testing) and /summarize (our main feature)
Handles CORS so our frontend can communicate with it
Returns JSON responses (the standard for modern APIs)

Step 3: Next.js Frontend - Understanding React File Handling
frontend/src/app/page.tsx:


