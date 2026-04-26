from pydantic import BaseModel, Field, field_validator
from typing import Literal


class SummarizeRequest(BaseModel):
    algorithm: Literal["frequency", "tfidf", "textrank", "llm"] = "llm"
    num_sentences: int = Field(default=3, ge=2, le=10)

    @field_validator("num_sentences", mode="before")
    @classmethod
    def clamp_sentences(cls, v: int) -> int:
        return max(2, min(10, v))


class FileValidation:
    ALLOWED_EXTENSIONS = {".pdf"}
    MAX_SIZE_MB = 10
    MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

    @classmethod
    def validate_file(cls, filename: str, size: int, content_type: str) -> None:
        if not filename:
            raise ValueError("No file selected")
        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in cls.ALLOWED_EXTENSIONS:
            raise ValueError("Invalid file type. Please upload a PDF.")
        if content_type and content_type != "application/pdf":
            raise ValueError("Invalid file type. Please upload a PDF.")
        if size > cls.MAX_SIZE_BYTES:
            raise ValueError(f"File too large. Maximum size is {cls.MAX_SIZE_MB}MB.")
        if size < 100:
            raise ValueError("File is empty or unreadable.")