import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from schemas import SummarizeRequest, FileValidation


class TestSummarizeRequest:
    def test_uses_defaults_when_no_params_provided(self):
        req = SummarizeRequest()
        assert req.algorithm == "llm"
        assert req.num_sentences == 3

    def test_accepts_valid_algorithm_and_sentence_count(self):
        req = SummarizeRequest(algorithm="tfidf", num_sentences=5)
        assert req.algorithm == "tfidf"
        assert req.num_sentences == 5

    def test_clamps_num_sentences_to_valid_range(self):
        req = SummarizeRequest(num_sentences=50)
        assert req.num_sentences == 10
        req2 = SummarizeRequest(num_sentences=-5)
        assert req2.num_sentences == 2

    def test_rejects_invalid_algorithm(self):
        with pytest.raises(Exception):
            SummarizeRequest(algorithm="invalid")


class TestFileValidation:
    def test_accepts_valid_pdf_file(self):
        FileValidation.validate_file("doc.pdf", 1024 * 1024, "application/pdf")

    def test_rejects_non_pdf_extension(self):
        with pytest.raises(ValueError, match="Invalid file type"):
            FileValidation.validate_file("doc.docx", 1024, None)

    def test_rejects_files_exceeding_size_limit(self):
        with pytest.raises(ValueError, match="File too large"):
            FileValidation.validate_file(
                "large.pdf", 11 * 1024 * 1024, "application/pdf"
            )

    def test_rejects_empty_files(self):
        with pytest.raises(ValueError, match="empty or unreadable"):
            FileValidation.validate_file("empty.pdf", 50, "application/pdf")

    def test_rejects_missing_filename(self):
        with pytest.raises(ValueError, match="No file selected"):
            FileValidation.validate_file("", 1024, None)