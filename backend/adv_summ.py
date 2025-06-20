"""
Advanced summarization algorithms for better PDF summaries
This module implements TF-IDF and TextRank algorithms alongside the basic frequency method
"""
import os
from dotenv import load_dotenv
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize,word_tokenize
from nltk.probability import  FreqDist
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai
import numpy as np
import re
from collections import Counter

load_dotenv()


class AdvSummarizer:
    def __init__(self):
        try:
            self.stop_words = set(stopwords.words('english'))
        except LookupError:
            nltk.download('stopwords')
            self.stop_words = set(stopwords.words('english'))
            
        custom_stops = {'said', 'say', 'also', 'would', 'could', 'one', 'two', 'first', 'may', 'way', 'get', 'go'}
        self.stop_words.update(custom_stops)
        
    def clean_text(self,text):
        #white space ,PDF artifacts,page numbers removed
        text= re.sub(r'/s+',' ',text.strip())
        text = re.sub(r'page \d+', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\d+/\d+', '', text)
        
        return text
    
    def frequency_summarize(self,text,num_sentences =3):
        """
        enhanced freq based method from app.py
        """
    
        try:
            # clean text 
            text= self.clean_text(text)
            sentences = sent_tokenize(text) #Returns sentence-tokenized copy of text ; splits text into sentences
            print(f"Found {len(sentences)} sentences in the document")

            if len(sentences)<= num_sentences:
                return ' '.join(sentences)
            
            #tokenize and filter
            words = word_tokenize(text.lower()) #splits text into individual words 
            filtered_words = [word for word in words if word.isalpha() and word not in self.stop_words]
            print(f"Filtered {len(words)} words down to {len(filtered_words)} meaningful words")
            
            #Calculate word frequencies
            word_freq = FreqDist(filtered_words)
            most_common_words = word_freq.most_common(10) #most common words , probably most imp topic
            print(f"Most common words: {most_common_words}")

            #sentence scoring based on imp words
            sentence_scores = {}
            for sentence in sentences:
                sentence_words = word_tokenize(sentence.lower())
                score = 0
                word_count=0
                for word in sentence_words:
                    if word in word_freq:
                        score +=word_freq[word] #Add the frequency of this word to the sentence score
                        word_count+=1
                   
                if word_count>0:
                    sentence_scores[sentence] = score/word_count #store the score for this sentence
                else:
                    sentence_scores[sentence]=0
            
            #Get top sentences
            ranked_sentences = sorted(sentence_scores.items(),key=lambda x:x[1],reverse=True) #sorting sentences by score (highest first)
            top_sentences = [sentence for sentence,score in ranked_sentences[:num_sentences]]
            
            #Maintain original order of sentences in the summary
            ordered_sentences=[]
            for sentence in sentences:
                if sentence in top_sentences:
                    ordered_sentences.append(sentence)

            return ' '.join(ordered_sentences)

        except Exception as e:
            print(f"Error in summarization: {str(e)}")
            raise Exception(f"Failed to create summary:{str(e)}")

    def tfidf_summarize(self,text,num_sentences=3):
        """
        TF-IDF based summarization
        TF-IDF = Term Frequency * Inverse Document Frequency
        Identifies important words that are common in this document but rare overall
        """
        
        try:
            text = self.clean_text(text)
            sentences = sent_tokenize(text)
            
            if len(sentences)<= num_sentences:
                return ' '.join(sentences)
            
            #Clean sentences for TF-IDF processing
            cleaned_sentences = []
            for sentence in sentences:
                clean_sentences = re.sub(r'[^\w\s]','',sentence.lower()) #punctuation and convert to lowercase removal
                words = word_tokenize(clean_sentences)
                filtered_words = [word for word in words if word not in self.stop_words and word.isalpha()]
                cleaned_sentences.append(' '.join(filtered_words))
            
            #TF-IDF matrix calculation
            vectorizer = TfidfVectorizer(max_features=100) #Limit features for performance
            tfidf_matrix = vectorizer.fit_transform(cleaned_sentences)
            
            #sentence scores (sum of TF-IDF values) calculation
            sentence_scores = np.array(tfidf_matrix.sum(axis=1)).flatten()
            
            #sorted top indices in orginal order
            top_indices = sentence_scores.argsort()[-num_sentences:][::-1]
            top_indices = sorted(top_indices)
            
            summary_sentences = [sentences[i] for i in top_indices]
            return ' '.join(summary_sentences)
            
        except Exception as e:
            raise Exception(f"TF-IDF summarization failed: {str(e)}") 
            
    def textrank_summarizer(self,text,num_sentences=3):
        """
        TextRank algorithm for extractive summarization
        Similar to PageRank but for sentences, sentences that are similar to many others get higher scores
        """           
            
        try:
            text = self.clean_text(text)
            sentences = sent_tokenize(text)
            
            if len(sentences) <= num_sentences:
                return ' '.join(sentences)
            
            cleaned_sentences = []
            for sentence in sentences:
                clean_sentences = re.sub(r'[^\w\s]','',sentence.lower()) #punctuation and convert to lowercase removal
                words = word_tokenize(clean_sentences)
                filtered_words = [word for word in words if word not in self.stop_words and word.isalpha()]
                cleaned_sentences.append(' '.join(filtered_words))
            
            # TFIDF vectors for similarity calc
            vectorizer = TfidfVectorizer()
            tfidf_matrix = vectorizer.fit_transform(cleaned_sentences)
            
            similarity_matrix = cosine_similarity(tfidf_matrix) #cosine similarity between sentences
            
            scores = np.ones(len(sentences)) #TextRank algo
            
            ## Iterate to convergence (simplified PageRank)
            for _ in range(50):
                new_scores = np.ones(len(sentences))
                for i in range(len(sentences)):
                    for j in range(len(sentences)):
                        if i!=j:
                            new_scores[i] += similarity_matrix[i][j]*scores[j]
            
                new_scores = new_scores/np.sum(new_scores) # normalize scores
                
                #convergence test
                if np.allclose(scores,new_scores,atol=1e-4):
                    break
                scores = new_scores
            
            #get top sentences in original order
            top_indices = scores.argsort()[-num_sentences:][::-1]
            top_indices = sorted(top_indices)
            
            summary_sentences = [sentences[i] for i in top_indices]
            return ' '.join(summary_sentences)
        
        except Exception as e:
            raise Exception(f"TextRank summarization failed : {str(e)}")
    
        
    def llm_summarizer(self,text,num_sentences=3):
        GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY not found in environment variables or .env file.")
        genai.configure(api_key=GOOGLE_API_KEY)
        MODEL_NAME = "gemini-2.0-flash"
        
        
        try:
            model = genai.GenerativeModel(model_name=MODEL_NAME)

            prompt = f"""Please read the following document text and provide a comprehensive, concise summary. 
                        Highlight the main arguments, key findings, important conclusions, and any significant data points. 
                        Organize the summary into clear, readable paragraphs. Also get direct to-the-point and instaed of here is a summary..."
                        {text}
                        """
            response = model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(
                        temperature=0.4, # Lower temperature for more factual, less creative summary
                        max_output_tokens=1024*num_sentences #  summary length
                    )
            )
            return response.text
        except Exception as e:
            print(f"Error summarizing text with Gemini: {e}")
            return f"Failed to generate summary due to an API error: {e}"
   
    
    def generate_summary(self,text,method='frequency',num_sentences=3):
        """
         Main method to generate summary using specified algorithm
        """
        
        #input validation
        num_sentences = max(2,min(10,num_sentences)) #clamping
       
        if method == 'tfidf':
            summary = self.tfidf_summarize(text,num_sentences)
            algorithm_used = "TF-IDF"
        elif method == 'textrank':
            summary = self.textrank_summarizer(text,num_sentences)
            algorithm_used = "TextRank"
        elif method == 'frequency':
            summary = self.frequency_summarize(text,num_sentences)
            algorithm_used = "Frequency Analysis"
        else:
            summary = self.llm_summarizer(text,num_sentences)
            algorithm_used = "llm"
            
        # calc compression ratio
        original_sentences = len(sent_tokenize(text))
        compression_ratio = (len(summary)/len(text))*100 if original_sentences>0 else 0
                
        return {
            'summary': summary,
            'algorithm': algorithm_used,
            'sentences_requested': num_sentences,
            'original_sentences': original_sentences,
            'compression_ratio': round(compression_ratio, 2),
            'summary_word_count': len(summary.split()),
            'original_word_count': len(text.split())
        }    
            
            
            
            
            
            
            
            
            