from flask import Flask,request,jsonify
from flask_cors import CORS #Allows frontend to talk to backend (different ports)
import PyPDF2
import nltk
from nltk.corpus import stopwords # filter out common words
from nltk.tokenize import sent_tokenize,word_tokenize # Split text into sentences and words
from nltk.probability import FreqDist # Count word frequencies
import sys
import datetime
import io # for handling file streams 

app = Flask(__name__)
CORS(app)

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
            "nltk_available":True
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

def basic_summarize(text,num_sentences=3):
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
        summary = ''.join(top_sentences)

        print(f"Generated summary with {len(top_sentences)} sentences")
        return summary

    except Exception as e:
        print(f"Error in summarization: {str(e)}")
        raise Exception(f"Failed to craete summary:{str(e)}")


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

        #text extraction
        pdf_content = file.read()
        extracted_text = extract_text_from_pdf(pdf_content)

        if not extracted_text or len(extracted_text.strip())<50:
            return jsonify({'error':'could not extract enough text from PDF. file moight be image based or corrupt'}),400

        #summarize
        summary = summarize_pdf(extracted_text)
        
        #results are returned
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
        return jsonify({'error':f'error processing pdf :{str(e)}'}),500





if __name__ == '__main__':
    app.run(host='0.0.0.0',port =5000,debug=True)





