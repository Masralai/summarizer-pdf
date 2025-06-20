from flask import Flask,request,jsonify
from flask_cors import CORS #Allows frontend to talk to backend (different ports)
import PyPDF2
import nltk
from nltk.corpus import stopwords # filter out common words
from nltk.tokenize import sent_tokenize,word_tokenize # Split text into sentences and words
from nltk.probability import FreqDist # Count word frequencies
import sys
import datetime
import io 
from adv_summ import AdvSummarizer #tdidf , textrank , freqdist, gemini-2.0-flash


app = Flask(__name__)
CORS(app)

summarizer = AdvSummarizer()

@app.route('/health',methods=['GET'])
def health_check(): #testing
    """
    This endpoint tells us if our backend is running correctly.
    """    
    return jsonify({"status":"Backend is running!","message":"Flask server is healthy"})

@app.route('/status',methods=['GET'])
def server_status(): #server stats
    """
    information about the server(like current time, Python version, etc.)
    """
    return jsonify({
            "time": datetime.datetime.now(),
            "version":sys.version[:7],
            "server_status":"running",
            "nltk_available":True,
            "advanced_features": {
                "algorithms": ["frequency", "tfidf", "textrank"],
                "sentence_range": "2-10 sentences",
                "features": ["length_control", "algorithm_selection", "statistics"]
            }
        })

def extract_text_from_pdf(pdf_file):
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_file)) #io.BytesIO because the file comes as bytes from the web reques
    
        text=""
        #iterator to loop thorough each page
        for page_num,page in enumerate(reader.pages):
            page_text = page.extract_text()
            text += page_text + "\n" #newline b/w pages
            print(f"Extracted{len(page_text)} characters from page{page_num+1}")

        print(f"Total text extracted: {len(text)} characters")
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        raise Exception(f"failed to extract text from PDF: {str(e)}")

def basic_summarize(text,num_sentences=3): # kept here aswell for compatibility
    """
    Create a basic summary using frequency analysis.

    Finds the most common important words
    Scores sentences based on these words
    Returns the highest-scoring sentences
    """
    try:
        # clean text , split text into sentences then into words and remove stopwords

        text_lower = text.lower() #lowercase for consistency
        sentences = sent_tokenize(text) #Returns sentence-tokenized copy of text ; splits text into sentences
        print(f"Found {len(sentences)} sentences in the document")

        words = word_tokenize(text_lower) #splits text into individual words 
        stop_words = set(stopwords.words('english')) #set of english stopwords
        filtered_words = [word for word in words if word.isalpha() and word not in stop_words]
        print(f"Filtered {len(words)} words down to {len(filtered_words)} meaningful words")
        
        word_freq = FreqDist(filtered_words)
        most_common_words = word_freq.most_common(10) #most common words , probably most imp topic
        print(f"Most common words: {most_common_words}")

        #sentence scoring based on imp words
        sentence_scores = {}
        for sentence in sentences:
            sentence_words = word_tokenize(sentence.lower())
            score = 0
            for word in sentence_words:
                if word in word_freq:
                    score +=word_freq[word] #Add the frequency of this word to the sentence score
            sentence_scores[sentence] = score #store the score for this sentence
        
        ranked_sentences = sorted(sentence_scores.items(),key=lambda x:x[1],reverse=True) #sorting sentences by score (highest first)
        top_sentences = [sentence for sentence,score in ranked_sentences[:num_sentences]]
        summary = ' '.join(top_sentences)

        print(f"Generated summary with {len(top_sentences)} sentences")
        return summary

    except Exception as e:
        print(f"Error in summarization: {str(e)}")
        raise Exception(f"Failed to create summary:{str(e)}")


@app.route('/summarize',methods=['POST'])
def summarize_pdf():
    """
    This will be our main endpoint for PDF summarization.
    """   

    try:
        # file upload checks and file type validation
        if 'file' not in request.files:
            return jsonify({'error':'no file uploaded'}),400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error':'no file selected'}),400

        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error':'please upload a pdf file'}),400

        print(f"Processing file: {file.filename}")
        
        #get summarization params from request
        algorithm = request.form.get('algorithm','llm')
        try:
            num_sentences = int(request.form.get('num_sentences',3))
        except (ValueError, TypeError):
            num_sentences =3

        # validate algo chosen
        valid_algorithm = ['frequency','tfidf','textrank','llm']
        if algorithm not in valid_algorithm:
            algorithm = 'llm'

        num_sentences = max(2,min(10,num_sentences)) #clamping
        print(f"Processing file: {file.filename}")
        print(f"Algorithm: {algorithm}, Sentences: {num_sentences}")

        #text extraction
        pdf_content = file.read()
        extracted_text = extract_text_from_pdf(pdf_content)

        if not extracted_text or len(extracted_text.strip())<50:
            return jsonify({'error':'could not extract enough text from PDF. file might be image based or corrupt'}),400

        #summarize
        
        summary_result = summarizer.generate_summary(
            text = extracted_text,
            method = algorithm,
            num_sentences = num_sentences
        )

        #results are returned
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
        print(f"Error processing PDF: {str(e)}")
        return jsonify({'error':f'error processing pdf :{str(e)}'}),500

@app.route('/algorithms',methods=['GET'])
def get_algorithm():
    """
    endpoint for algo description
    """
    algorithms = {
        'frequency': {
            'name': 'Frequency Analysis',
            'description': 'Scores sentences based on word frequency. Fast and simple.',
            'best_for': 'General documents, quick summaries'
        },
        'tfidf': {
            'name': 'TF-IDF',
            'description': 'Uses Term Frequency-Inverse Document Frequency to find important sentences.',
            'best_for': 'Technical documents, identifying key concepts'
        },
        'textrank': {
            'name': 'TextRank',
            'description': 'Graph-based algorithm similar to PageRank. Finds sentences that are similar to many others.',
            'best_for': 'Academic papers, complex documents with interconnected ideas'
        },
        'llm':{
            'name': 'LLM-Based',
            'description': 'Utilizes advanced LLMs to understand the content and generate new, coherent summaries.',
            'best_for': 'Ideal for complex texts where deep understanding, cross-document synthesis, and rephrasing are required.'
        }
    }
    
    return jsonify({
        'algorithms': algorithms,
        'default': 'frequency',
        'sentence_range': {
            'min': 2,
            'max': 10,
            'default': 3
        }
    })


if __name__ == '__main__':
    app.run(host='127.0.0.1',port =5000,debug=True)







