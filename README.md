# PDF Summarizer Web App

## 📝 Description
This is a **PDF Summarizer Web App** built using **Next.js, TailwindCSS, and Flask**. The backend processes PDF files using **PyMuPDF** (fitz) to extract text and summarize it before returning the result to the frontend.

## 🎮 Features
- Upload and process PDF files
- Extract text using **PyMuPDF**
- Summarize extracted text using NLP techniques
- Responsive UI with **Next.js and TailwindCSS**
- Fast and efficient backend with **Flask**

## 🛠️ Technologies Used
### Frontend:
- **React & Next.js** - Frontend framework with API routes
- **TailwindCSS** - Styling and responsiveness
- **TypeScript** - Type safety and maintainability

### Backend:
- **Flask** - Lightweight Python web framework for API
- **PyMuPDF (fitz)** - PDF text extraction library
- **NLTK** - Text summarization
- **Requests** - Handling API requests

## 📚 Installation
### Clone the Repository
```sh
git clone https://github.com/your-username/pdf-summarizer.git
```
```sh
cd pdf-summarizer
```

### Install Frontend Dependencies
```sh
npm install
```

### Install Backend Dependencies
Ensure you have **Python 3.8+** installed.
```sh
pip install flask pymupdf nltk
```

### Start the Flask Backend
```sh
python main.py
```

### Start the Next.js Frontend
```sh
npm run dev
```

## 🚀 How to Use
1. Open the app in a browser.
2. Upload a PDF file.
3. The backend extracts and summarizes text.
4. The summarized text is displayed on the UI.
