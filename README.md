# PDF Summarizer: AI-Powered Document Summarization

A full-stack web application designed to intelligently condense PDF documents into concise summaries using various Natural Language Processing (NLP) algorithms and cutting-edge AI models. Built with a modern React/Next.js frontend and a robust Flask backend.

---

## Key Features

This application empowers users to quickly grasp the essence of lengthy PDF documents through a range of powerful features:

- **Diverse Summarization Algorithms:**
  - **Frequency-Based:** Ideal for general content, focusing on most recurring terms.
  - **TF-IDF (Term Frequency-Inverse Document Frequency):** Emphasizes unique and important words, great for technical texts.
  - **TextRank Algorithm:** A sophisticated graph-based method for highly coherent and context-aware summaries.
  - **Gemini 2.0 Flash API:** State-of-the-art AI-powered summarization with natural language understanding and contextual awareness.
- **Intuitive User Interface:** A sleek, responsive, and easy-to-use experience built with React and TypeScript.
- **Real-time Processing:** Get instant summaries thanks to efficient PDF text extraction and on-the-fly NLP.
- **Advanced AI Integration:** Leverage Google's latest Gemini 2.0 Flash model for human-like summary generation.
- **Robust Error Handling:** Clear feedback for invalid inputs or processing issues.
- **Scalable RESTful API:** A well-defined backend for seamless communication and future expansion.

---

##  Get Started

Follow these simple steps to set up and run the PDF Summarizer on your local machine.

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v14 or higher (for frontend)
- **npm** or **yarn** (for frontend package management)
- **Python**: v3.8 or higher (for backend)
- **pip** (Python package manager, usually comes with Python)
- **Google AI API Key**: Required for Gemini 2.0 Flash integration

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

   # Set up environment variables for Gemini API
   # Create a .env file in the backend directory
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
   
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

4. **API Key Configuration:**

   To use the Gemini 2.0 Flash summarization:
   - Visit [Google AI Studio](https://ai.google.dev/) to obtain your API key
   - Add your API key to the `.env` file in the backend directory:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

---

##  Technologies Utilized

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
- **Google Generative AI**: Integration with Gemini 2.0 Flash API for advanced AI-powered summarization.
- **python-dotenv**: Environment variable management for secure API key handling.

---

##  Summarization Algorithms Explained

Each algorithm offers a unique approach to condensing text, making them suitable for different types of documents and desired summary characteristics.

| Algorithm           | How it Works                                                                                                                                      | Best Suited For                                                  | Speed              | Quality              |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------- | :----------------- | :------------------- |
| **Frequency-Based** | Ranks sentences based on the frequency of important words.                                                                                        | General articles, quick overviews.                               | ⚡⚡⚡ (Fast)      | ⭐⭐ (Basic)         |
| **TF-IDF**          | Evaluates word importance by comparing term frequency in a document to its inverse document frequency across a corpus.                            | Technical documents, research papers, specialized content.       | ⚡⚡ (Moderate)    | ⭐⭐⭐ (Good)        |
| **TextRank**        | A graph-based ranking algorithm (like PageRank for text) that identifies central sentences based on their semantic similarity to other sentences. | Complex documents, highly interconnected ideas, narrative texts. | ⚡ (Comprehensive) | ⭐⭐⭐⭐ (Excellent) |
| **Gemini 2.0 Flash** | Google's advanced multimodal AI model that understands context, nuance, and generates human-like summaries with natural language processing.      | All document types, conversational summaries, detailed analysis. | ⚡⚡ (Fast)       | ⭐⭐⭐⭐⭐ (Outstanding) |

---

##  Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Required for Gemini 2.0 Flash API
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Flask configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

---

##  Usage Tips

### Choosing the Right Algorithm:

- **Quick Overviews**: Use **Frequency-Based** for fast, basic summaries
- **Technical Documents**: Use **TF-IDF** for research papers, manuals, and specialized content
- **Academic Papers**: Use **TextRank** for papers with interconnected concepts
- **Best Quality**: Use **Gemini 2.0 Flash** for the most natural, contextually aware summaries
- **All-Purpose**: **Gemini 2.0 Flash** works excellently across all document types

### Performance Considerations:

- Traditional algorithms (Frequency, TF-IDF, TextRank) process documents locally
- Gemini 2.0 Flash requires internet connection and API quota
- For large documents, consider chunking strategies when using the Gemini API

---

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

