import os
import io
import sys
import logging
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
from dotenv import load_dotenv

# Local imports
from adv_summ import AdvSummarizer

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Security: In production, you should restrict origins
allowed_origins = os.environ.get('ALLOWED_ORIGINS', '*').split(',')
CORS(app, resources={r"/*": {"origins": allowed_origins}})

summarizer = AdvSummarizer()

@app.route('/health', methods=['GET'])
def health_check():
    """Service health check for monitoring tools."""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "service": "pdf-summarizer-backend"
    })

@app.route('/status', methods=['GET'])
def server_status():
    """Extended server status information."""
    return jsonify({
        "time": datetime.datetime.now().isoformat(),
        "python_version": sys.version.split()[0],
        "server_status": "running",
        "features": {
            "algorithms": ["frequency", "tfidf", "textrank", "llm"],
            "sentence_range": {"min": 2, "max": 10}
        }
    })

def extract_text_from_pdf(pdf_stream):
    """Surgical extraction of text from PDF bytes with fallback and cleaning."""
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_stream))
        text = []
        for page_num, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text()
                if page_text:
                    # Basic cleaning of common PDF artifacts
                    page_text = page_text.replace('\0', '') # remove null bytes
                    text.append(page_text)
                    logger.debug(f"Extracted {len(page_text)} chars from page {page_num + 1}")
            except Exception as page_err:
                logger.warning(f"Failed to extract text from page {page_num + 1}: {page_err}")
        
        full_text = "\n".join(text)
        logger.info(f"Total text extracted: {len(full_text)} characters from {len(reader.pages)} pages")
        return full_text
    except Exception as e:
        logger.error(f"PDF extraction failed: {str(e)}")
        raise RuntimeError(f"Failed to extract text from PDF: {str(e)}")

@app.route('/summarize', methods=['POST'])
def summarize_pdf():
    """Main endpoint for PDF summarization."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if not file or file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Invalid file type. Please upload a PDF.'}), 400

        algorithm = request.form.get('algorithm', 'llm')
        try:
            num_sentences = int(request.form.get('num_sentences', 3))
        except (ValueError, TypeError):
            num_sentences = 3

        # Clamp sentence count
        num_sentences = max(2, min(10, num_sentences))
        
        logger.info(f"Processing request: File={file.filename}, Algo={algorithm}, Sentences={num_sentences}")

        pdf_content = file.read()
        extracted_text = extract_text_from_pdf(pdf_content)

        if not extracted_text or len(extracted_text.strip()) < 50:
            return jsonify({'error': 'Insufficient text content in PDF for summarization.'}), 400

        summary_result = summarizer.generate_summary(
            text=extracted_text,
            method=algorithm,
            num_sentences=num_sentences
        )

        return jsonify({
            'success': True,
            'filename': file.filename,
            'summary': summary_result['summary'],
            'algorithm_used': summary_result['algorithm'],
            'statistics': {
                'original_length': len(extracted_text),
                'summary_length': len(summary_result['summary']),
                'original_word_count': summary_result['original_word_count'],
                'summary_word_count': summary_result['summary_word_count'],
                'original_sentences': summary_result['original_sentences'],
                'summary_sentences': summary_result['sentences_requested'],
                'compression_ratio': summary_result['compression_ratio']
            },
            'parameters': {
                'algorithm': algorithm,
                'num_sentences': num_sentences
            }
        })

    except Exception as e:
        logger.exception("Internal error during summarization")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/algorithms', methods=['GET'])
def get_algorithms_info():
    """Metadata for frontend to display algorithm details."""
    return jsonify({
        'algorithms': {
            'frequency': {
                'name': 'Frequency Analysis',
                'description': 'Scores sentences based on word frequency. Fast and simple.',
                'best_for': 'General documents'
            },
            'tfidf': {
                'name': 'TF-IDF',
                'description': 'Uses statistical word importance (Term Frequency-Inverse Document Frequency).',
                'best_for': 'Technical documents'
            },
            'textrank': {
                'name': 'TextRank',
                'description': 'Graph-based algorithm similar to PageRank. Finds interconnected ideas.',
                'best_for': 'Academic papers'
            },
            'llm': {
                'name': 'Neural (LLM)',
                'description': 'Advanced generative summary using Gemini 2.0 Flash.',
                'best_for': 'Complex texts requiring understanding'
            }
        },
        'defaults': {
            'algorithm': 'llm',
            'sentence_range': {'min': 2, 'max': 10, 'default': 3}
        }
    })

if __name__ == '__main__':
    # Use environment variable for port, default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False') == 'True')
