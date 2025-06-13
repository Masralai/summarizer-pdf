"""
Run this file once to set up NLTK properly.
"""

import nltk
# punkt: sentence tokenizer (splits text into sentences)
# stopwords: common words like "the", "and", "is" that we often ignore in NLP
# wordnet: dictionary for word meanings and synonyms

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

print('NLTK setup complete')






