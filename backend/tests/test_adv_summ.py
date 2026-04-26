import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from adv_summ import AdvSummarizer


@pytest.fixture
def summarizer():
    return AdvSummarizer()


SAMPLE_TEXT = """
The history of artificial intelligence began in antiquity, with myths, stories and rumors of artificial beings endowed with intelligence or consciousness by master craftsmen.
The seeds of modern AI were planted by philosophers who attempted to describe the process of human thinking as the mechanical manipulation of symbols.
This work culminated in the invention of the programmable digital computer in the 1940s, a machine based on the abstract essence of mathematical reasoning.
The discipline of computer science was founded in 1966 at several universities.
Machine learning became a dominant approach in the 2010s, with deep learning achieving cutting-edge results in many domains.
Natural language processing improved dramatically in the late 2010s, with large language models trained on massive text corpora.
"""


class TestFrequencySummarize:
    def test_returns_summary_of_requested_length(self, summarizer):
        result = summarizer.frequency_summarize(SAMPLE_TEXT, num_sentences=2)
        sentences = summarizer.clean_text(SAMPLE_TEXT).split(". ")
        assert len(sentences) >= 2

    def test_handles_text_below_threshold(self, summarizer):
        short_text = "Short text. Another sentence."
        result = summarizer.frequency_summarize(short_text, num_sentences=5)
        assert len(result) > 0

    def test_removes_page_numbers(self, summarizer):
        text_with_page = "page 42 Introduction. This is page 3 text."
        cleaned = summarizer.clean_text(text_with_page)
        assert "page 42" not in cleaned
        assert "page 3" not in cleaned

    def test_removes_dates_like_1_2(self, summarizer):
        text_with_dates = "Meeting on 12/12 and 01/01/2024."
        cleaned = summarizer.clean_text(text_with_dates)
        assert "12/12" not in cleaned
        assert "01/01/2024" not in cleaned


class TestTfidfSummarize:
    def test_returns_correct_sentence_count(self, summarizer):
        result = summarizer.tfidf_summarize(SAMPLE_TEXT, num_sentences=3)
        assert len(result) > 0

    def test_handles_short_text(self, summarizer):
        short = "Only one sentence here."
        result = summarizer.tfidf_summarize(short, num_sentences=3)
        assert result == short


class TestTextRankSummarizer:
    def test_returns_summary(self, summarizer):
        result = summarizer.textrank_summarizer(SAMPLE_TEXT, num_sentences=3)
        assert len(result) > 0

    def test_handles_short_text(self, summarizer):
        short = "Only one sentence here."
        result = summarizer.textrank_summarizer(short, num_sentences=5)
        assert result == short


class TestGenerateSummary:
    def test_calls_correct_algorithm(self, summarizer):
        result = summarizer.generate_summary(SAMPLE_TEXT, method="frequency", num_sentences=3)
        assert "summary" in result
        assert result["algorithm"] == "Frequency Analysis"
        assert result["sentences_requested"] == 3

    def test_tfidf_method(self, summarizer):
        result = summarizer.generate_summary(SAMPLE_TEXT, method="tfidf", num_sentences=2)
        assert result["algorithm"] == "TF-IDF"

    def test_textrank_method(self, summarizer):
        result = summarizer.generate_summary(SAMPLE_TEXT, method="textrank", num_sentences=2)
        assert result["algorithm"] == "TextRank"

    def test_llm_fallback_no_api_key(self, summarizer):
        result = summarizer.generate_summary(SAMPLE_TEXT, method="llm", num_sentences=2)
        assert "summary" in result
        assert "not configured" in result["summary"] or "Failed" in result["summary"]

    def test_compression_ratio_calculated(self, summarizer):
        result = summarizer.generate_summary(SAMPLE_TEXT, method="frequency", num_sentences=2)
        assert "compression_ratio" in result
        assert result["original_word_count"] > 0
        assert result["summary_word_count"] > 0

    def test_clamps_sentence_range(self, summarizer):
        result = summarizer.generate_summary(SAMPLE_TEXT, method="frequency", num_sentences=100)
        assert result["sentences_requested"] == 10