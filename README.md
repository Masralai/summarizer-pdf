# 📄 PDF Summarizer: AI-Powered Document Summarization

A full-stack web application designed to intelligently condense PDF documents into concise summaries using various Natural Language Processing (NLP) algorithms. Built with a modern React/Next.js frontend and a robust Flask backend.

[![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen)](https://github.com/Masralai/pdf-summarizer)
[![Frontend: React 18+ / Next.js](https://img.shields.io/badge/Frontend-React%2018%2B%20%2F%20Next.js-blue)](https://nextjs.org/)
[![Backend: Flask 2.0+ / Python 3.8+](https://img.shields.io/badge/Backend-Flask%202.0%2B%20%2F%20Python%203.8%2B-green)](https://flask.palletsprojects.com/)
[![Language: TypeScript 4.0+](https://img.shields.io/badge/Language-TypeScript%204.0%2B-blue)](https://www.typescriptlang.org/)

---

## ✨ Key Features

This application empowers users to quickly grasp the essence of lengthy PDF documents through a range of powerful features:

- **Diverse Summarization Algorithms:**
  - **Frequency-Based:** Ideal for general content, focusing on most recurring terms.
  - **TF-IDF (Term Frequency-Inverse Document Frequency):** Emphasizes unique and important words, great for technical texts.
  - **TextRank Algorithm:** A sophisticated graph-based method for highly coherent and context-aware summaries.
- **Intuitive User Interface:** A sleek, responsive, and easy-to-use experience built with React and TypeScript.
- **Real-time Processing:** Get instant summaries thanks to efficient PDF text extraction and on-the-fly NLP.
- **Robust Error Handling:** Clear feedback for invalid inputs or processing issues.
- **Scalable RESTful API:** A well-defined backend for seamless communication and future expansion.

---

---

## 🚀 Get Started

Follow these simple steps to set up and run the PDF Summarizer on your local machine.

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v14 or higher (for frontend)
- **npm** or **yarn** (for frontend package management)
- **Python**: v3.8 or higher (for backend)
- **pip** (Python package manager, usually comes with Python)

### Installation Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/pdf-summarizer.git
   cd pdf-summarizer
   ```

2. **Backend Setup:**

   ```bash
   # Navigate into the backend directory
   cd backend

   # Create a Python virtual environment
   python -m venv venv

   # Activate the virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   # Install Python dependencies
   pip install -r requirements.txt

   # Download necessary NLTK data (punkt for tokenization, stopwords for filtering)
   python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

   # Start the Flask development server
   python app.py
   ```

   The backend API will be accessible at: `http://localhost:5000`

3. **Frontend Setup:**

   ```bash
   # Open a new terminal window and navigate to the frontend directory
   cd frontend

   # Install Node.js dependencies
   npm install
   # OR
   yarn install

   # Start the Next.js development server
   npm run dev
   # OR
   yarn dev
   ```

   The frontend application will be available at: `http://localhost:3000`

---

## ⚙️ Technologies Utilized

This project leverages a modern and robust tech stack for both its frontend and backend components.

### Frontend (User Interface)

- **React 18+**: The core library for building dynamic user interfaces with Hooks.
- **TypeScript**: Provides type safety and enhances code quality and maintainability.
- **Next.js**: A powerful React framework for production-ready applications, enabling Server-Side Rendering (SSR) and routing.
- **Axios**: A promise-based HTTP client for making API requests to the backend.
- **Tailwind CSS**: A utility-first CSS framework for rapid and consistent UI development.

### Backend (API & NLP Processing)

- **Flask**: A lightweight and flexible Python web framework.
- **PyPDF2**: Used for efficient extraction of text content from PDF documents.
- **NLTK (Natural Language Toolkit)**: Essential for tokenization, stop word removal, and other NLP tasks.
- **Scikit-learn**: Provides robust implementations for machine learning algorithms, specifically for TF-IDF calculation.
- **NumPy**: Fundamental package for numerical computing in Python, underpinning Scikit-learn.
- **Flask-CORS**: Handles Cross-Origin Resource Sharing, allowing the frontend to communicate with the backend.

---

## 🧠 Summarization Algorithms Explained

Each algorithm offers a unique approach to condensing text, making them suitable for different types of documents and desired summary characteristics.

| Algorithm           | How it Works                                                                                                                                      | Best Suited For                                                  | Speed              | Quality              |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------- | :----------------- | :------------------- |
| **Frequency-Based** | Ranks sentences based on the frequency of important words.                                                                                        | General articles, quick overviews.                               | ⚡⚡⚡ (Fast)      | ⭐⭐ (Basic)         |
| **TF-IDF**          | Evaluates word importance by comparing term frequency in a document to its inverse document frequency across a corpus.                            | Technical documents, research papers, specialized content.       | ⚡⚡ (Moderate)    | ⭐⭐⭐ (Good)        |
| **TextRank**        | A graph-based ranking algorithm (like PageRank for text) that identifies central sentences based on their semantic similarity to other sentences. | Complex documents, highly interconnected ideas, narrative texts. | ⚡ (Comprehensive) | ⭐⭐⭐⭐ (Excellent) |

---

## 🌐 API Endpoints

The backend exposes a clear RESTful API for interaction.

### 1. Health Check

Verifies if the backend server is running and responsive.

- **Endpoint**: `/health`
- **Method**: `GET`
- **Response (JSON)**:

  ```json
  {
    "status": "Backend is running!"
  }
  ```

### 2. PDF Summarization

Uploads a PDF and generates a summary based on the specified algorithm and sentence count.

- **Endpoint**: `/summarize`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file`: The PDF document to be summarized (required).
  - `algorithm`: The summarization algorithm to use. Accepted values: `frequency`, `tfidf`, `textrank` (required).
  - `num_sentences`: The desired number of sentences in the generated summary (optional, default: 3).
- **Response (JSON)**:

  ```json
  {
    "success": true,
    "summary": "This is the generated summary text from your PDF document, providing a concise overview of the main points.",
    "algorithm_used": "textrank",
    "processing_time": 2.15
  }
  ```

  - **Error Response Example:**

    ```json
    {
      "success": false,
      "error": "No PDF file provided or unsupported file type."
    }
    ```

---
