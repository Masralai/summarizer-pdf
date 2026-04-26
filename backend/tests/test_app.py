import pytest
import sys
import os
import io

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


class TestHealth:
    def test_health_returns_200(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "healthy"
        assert "timestamp" in data


class TestSummarize:
    def test_no_file_returns_400(self, client):
        resp = client.post("/summarize")
        assert resp.status_code == 400
        assert resp.get_json()["error"]

    def test_invalid_file_type_returns_400(self, client):
        data = {"file": (io.BytesIO(b"hello"), "doc.txt")}
        resp = client.post("/summarize", data=data, content_type="multipart/form-data")
        assert resp.status_code == 400

    def test_empty_file_returns_400(self, client):
        data = {"file": (io.BytesIO(b""), "empty.pdf")}
        resp = client.post(
            "/summarize", data=data, content_type="multipart/form-data"
        )
        assert resp.status_code == 400

    def test_invalid_algorithm_returns_400(self, client):
        data = {
            "file": (io.BytesIO(b"mock"), "test.pdf"),
            "algorithm": "invalid_algo",
        }
        resp = client.post(
            "/summarize", data=data, content_type="multipart/form-data"
        )
        assert resp.status_code == 400

    def test_invalid_num_sentences_returns_400(self, client):
        data = {
            "file": (io.BytesIO(b"mock"), "test.pdf"),
            "num_sentences": "not_a_number",
        }
        resp = client.post(
            "/summarize", data=data, content_type="multipart/form-data"
        )
        assert resp.status_code == 400