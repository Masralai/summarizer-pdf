# PDF Summarizer

A full-stack web application that condenses PDF documents into concise summaries using multiple NLP algorithms and Gemini AI. Next.js frontend + Flask backend, containerized with Docker.

---

## Table of Contents

- [Features](#features)
- [Stack](#stack)
- [Quick Start](#quick-start)
  - [Docker (recommended)](#docker-recommended)
  - [Manual](#manual)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Algorithms](#algorithms)
- [Development](#development)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Testing](#testing)
- [Project Structure](#project-structure)

---

## Features

- **Four summarization algorithms**: Frequency, TF-IDF, TextRank, and Gemini AI
- **PDF text extraction** with fallback and artifact cleaning
- **Adjustable precision** — control summary length from 2 to 10 sentences
- **Statistics dashboard** — compression ratio, word count reduction
- **Clipboard and text export** for summaries
- **Backend health monitoring** — frontend shows system status at a glance
- **Docker Compose** — one-command local deployment

---

## Stack

### Frontend

| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 15 | App router, SSR |
| React | 19 | UI components |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | — | Base components |
| Axios | 1.9 | HTTP client |
| Lucide | 0.518 | Icons |

### Backend

| Library | Version | Purpose |
|---------|---------|---------|
| Flask | 3.1 | REST API |
| pypdf | 5.2 | PDF text extraction |
| NLTK | 3.9 | Tokenization, stopwords |
| scikit-learn | 1.6 | TF-IDF, cosine similarity |
| NumPy | 2.2 | Numerical computing |
| google-generativeai | 0.8 | Gemini API client |
| Pydantic | 2.10 | Request validation |
| Gunicorn | 23 | Production WSGI server |

### Infrastructure

- Docker + Docker Compose
- GitHub Actions CI/CD

---

## Quick Start

### Docker (recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/summarizer-pdf.git
cd summarizer-pdf

# Configure your API key
cp backend/.env.example backend/.env
# Edit backend/.env and set GOOGLE_API_KEY

# Start both services
docker compose up --build
```

Frontend: [http://localhost:3000](http://localhost:3000)  
Backend API: [http://localhost:5000](http://localhost:5000)

To stop:

```bash
docker compose down
```

### Manual

#### Prerequisites

- **Node.js** 18+ with npm
- **Python** 3.12 with pip
- **Google AI API key** — get one at [ai.google.dev](https://ai.google.dev)

#### Backend

```bash
cd backend

# Install uv if not already installed
# curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies (uv creates .venv automatically)
uv sync

# Download NLTK data
uv run python setup_nltk.py

# Configure environment
cp .env.example .env
# Edit .env — set GOOGLE_API_KEY

# Run the server
uv run python app.py
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create `backend/.env` (copy from `backend/.env.example`):

```env
# Required
GOOGLE_API_KEY=your_gemini_api_key_here

# Optional
ALLOWED_ORIGINS=http://localhost:3000
PORT=5000
FLASK_DEBUG=False
MAX_UPLOAD_SIZE_MB=10
```

| Variable | Required | Default | Description |
|---------|----------|---------|-------------|
| `GOOGLE_API_KEY` | Yes | — | Gemini API key from Google AI Studio |
| `ALLOWED_ORIGINS` | No | `*` | Comma-separated CORS origins |
| `PORT` | No | `5000` | Backend port |
| `FLASK_DEBUG` | No | `False` | Enable Flask debug mode |
| `MAX_UPLOAD_SIZE_MB` | No | `10` | Max PDF upload size in MB |

---

## API Reference

### `POST /summarize`

Upload a PDF and receive a summary.

**Request:** `multipart/form-data`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `file` | PDF file | required | The PDF to summarize |
| `algorithm` | string | `llm` | `frequency`, `tfidf`, `textrank`, `llm` |
| `num_sentences` | integer | `3` | Summary length (2–10) |

**Response:**

```json
{
  "success": true,
  "filename": "document.pdf",
  "summary": "The document discusses...",
  "algorithm_used": "TF-IDF",
  "statistics": {
    "original_length": 12450,
    "summary_length": 892,
    "original_word_count": 1892,
    "summary_word_count": 134,
    "compression_ratio": 7.16
  },
  "parameters": {
    "algorithm": "tfidf",
    "num_sentences": 3
  }
}
```

**Error responses:**

| Status | Body |
|--------|------|
| `400` | `{ "error": "No file uploaded" }` |
| `400` | `{ "error": "Invalid file type. Please upload a PDF." }` |
| `400` | `{ "error": "File too large. Maximum size is 10MB." }` |
| `400` | `{ "error": "Insufficient text content in PDF for summarization." }` |

### `GET /health`

Service health check. Returns `200` if the service is running.

```json
{ "status": "healthy", "timestamp": "...", "service": "pdf-summarizer-backend" }
```

### `GET /status`

Extended server status with available algorithms.

### `GET /algorithms`

Metadata about each summarization algorithm for the frontend.

---

## Algorithms

| Algorithm | How it works | Best for | Speed | Quality |
|-----------|-------------|---------|-------|---------|
| **Frequency** | Ranks sentences by frequency of important words | General documents, quick summaries | Fast | Basic |
| **TF-IDF** | Scores words by importance relative to document | Technical papers, manuals | Moderate | Good |
| **TextRank** | Graph-based ranking by sentence similarity | Academic papers, narratives | Slow | Excellent |
| **Neural (Gemini)** | Generative AI with contextual understanding | All document types | Fast | Outstanding |

**Recommendation:** Use **Frequency** for speed, **TextRank** for quality on academic papers, and **Neural** for the best overall results.

---

## Development

### Frontend

```bash
cd frontend

npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run format       # Format with Prettier
npm run test         # Run Vitest tests (watch mode)
npm run test:run     # Run tests once
```

### Backend

```bash
cd backend

# Run development server
uv run python app.py

# Run production server
uv run gunicorn app:app

# Run tests
uv run python -m pytest tests/ -v
```

---

## Testing

### Frontend (Vitest)

```bash
cd frontend
npm run test:run
```

5 unit tests covering page rendering, algorithm selection, upload zone, and form state.

### Backend (pytest)

```bash
cd backend
python -m pytest tests/ -v
```

31 tests covering:
- All 4 summarization algorithms
- Request validation (pydantic schemas)
- API routes (health, status, algorithms, summarize)
- File validation (type, size, empty)

---

## Project Structure

```
summarizer-pdf/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Main application component
│   │   │   ├── layout.tsx     # Root layout with fonts
│   │   │   └── globals.css    # Tailwind + custom styles
│   │   ├── components/
│   │   │   ├── error-boundary.tsx
│   │   │   └── ui/            # shadcn/ui base components
│   │   ├── lib/
│   │   │   └── utils.ts       # Utility functions
│   │   └── types/
│   │       └── api.ts         # Shared API type definitions
│   ├── vitest.config.ts
│   ├── package.json
│   └── Dockerfile
├── backend/
│   ├── app.py                # Flask app + routes
│   ├── adv_summ.py           # Summarization algorithms
│   ├── schemas.py            # Pydantic validation
│   ├── setup_nltk.py         # NLTK data download script
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── tests/                # pytest suite
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```