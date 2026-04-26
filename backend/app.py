import os
import io
import sys
import logging
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import pypdf
from dotenv import load_dotenv

from adv_summ import AdvSummarizer
from schemas import SummarizeRequest, FileValidation

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

def extract_text_from_pdf(pdf_stream):
    """Surgical extraction of text from PDF bytes with fallback and cleaning."""
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_stream))
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

        try:
            body = SummarizeRequest(
                algorithm=request.form.get('algorithm', 'llm'),
                num_sentences=int(request.form.get('num_sentences', 3)),
            )
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid request parameters'}), 400

        try:
            FileValidation.validate_file(
                file.filename,
                file.seek(0, 2),
                file.content_type,
            )
            file.seek(0)
        except ValueError as ve:
            return jsonify({'error': str(ve)}), 400

        logger.info(f"Processing request: File={file.filename}, Algo={body.algorithm}, Sentences={body.num_sentences}")

        pdf_content = file.read()
        extracted_text = extract_text_from_pdf(pdf_content)

        if not extracted_text or len(extracted_text.strip()) < 50:
            return jsonify({'error': 'Insufficient text content in PDF for summarization.'}), 400

        summary_result = summarizer.generate_summary(
            text=extracted_text,
            method=body.algorithm,
            num_sentences=body.num_sentences
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
                'algorithm': body.algorithm,
                'num_sentences': body.num_sentences
            }
        })

    except Exception as e:
        logger.exception("Internal error during summarization")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    # Use environment variable for port, default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False') == 'True')
